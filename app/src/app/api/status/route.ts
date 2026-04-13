/**
 * GET /api/status
 *
 * Full system health check. Checks all services in parallel and returns
 * a unified status object.
 *
 * Checked services:
 *   db          — in-memory DB (always ok in dev; swap with real DB check)
 *   redis       — not yet configured (reports not_configured)
 *   queue       — in-memory job queue stats
 *   gemini      — Google Gemini API reachability
 *   ace         — Wavespeed ACE 1.5 reachability
 *   lyria       — Google Lyria availability
 *   elevenlabs  — ElevenLabs API authentication
 *
 * Query params:
 *   ?id=<generationId>   — legacy: poll a specific generation (backward compat)
 */

import { NextRequest, NextResponse } from "next/server";
import { dbHealthCheck, Queue } from "@/lib/db";
import { geminiHealthCheck } from "@/lib/gemini";
import { aceHealthCheck } from "@/lib/models/ace";
import { lyriaHealthCheck } from "@/lib/models/lyria";
import { elevenLabsHealthCheck } from "@/lib/models/elevenlabs";
import type { ServiceStatus, ServiceHealth, SystemStatus } from "@/types";

// ─── Legacy poll compatibility ────────────────────────────────────────────────

const ACE_API_KEY = process.env.ACE_API_KEY ?? "";
const DEV_MODE = process.env.DEV_MODE === "true";
const ACE_STATUS_URL = "https://api.wavespeed.ai/api/v3/predictions";

// Use the global generationStore declared by /api/generate/route.ts
// Access via unknown to avoid type-declaration conflicts
type LegacyStore = Map<
  string,
  {
    id: string;
    status: string;
    tags: string[];
    tracks: {
      id: string;
      aceTaskId: string | null;
      status: string;
      audioUrl: string | null;
      lyrics: string;
      title: string;
      vibe: string;
    }[];
    posterUrl: string | null;
    createdAt: string;
  }
>;

function getLegacyStore(): LegacyStore | undefined {
  return (global as unknown as { generationStore?: LegacyStore }).generationStore;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const legacyId = searchParams.get("id");

  // ── Legacy: single generation poll ───────────────────────────────────────
  if (legacyId) {
    return handleLegacyPoll(legacyId);
  }

  // ── Full system health check ──────────────────────────────────────────────
  const t0 = Date.now();

  const [gemini, ace, lyria, elevenlabs] = await Promise.all([
    timed(geminiHealthCheck),
    timed(aceHealthCheck),
    timed(lyriaHealthCheck),
    timed(elevenLabsHealthCheck),
  ]);

  const dbResult = dbHealthCheck();
  const queueStats = Queue.stats();

  const db: ServiceStatus = {
    status: dbResult.status,
    message: `ok — ${Object.entries(dbResult.stats)
      .map(([k, v]) => `${k}:${v}`)
      .join(" ")}`,
  };

  const redis: ServiceStatus = {
    status: "not_configured",
    message: "Redis not configured — using in-memory queue (dev only)",
  };

  const queue: ServiceStatus = {
    status: "ok",
    message: `queued:${queueStats.queued} running:${queueStats.running} done:${queueStats.done} failed:${queueStats.failed}`,
  };

  const services = {
    db,
    redis,
    queue,
    gemini: toServiceStatus(gemini),
    ace: toServiceStatus(ace),
    lyria: toServiceStatus(lyria),
    elevenlabs: toServiceStatus(elevenlabs),
  };

  const statuses = Object.values(services).map((s) => s.status as ServiceHealth);
  const overall: ServiceHealth = statuses.some((s) => s === "error")
    ? "error"
    : statuses.some((s) => s === "not_configured" || s === "degraded")
    ? "degraded"
    : "ok";

  const body: SystemStatus = {
    timestamp: new Date().toISOString(),
    overall,
    services,
  };

  return NextResponse.json(body, {
    status: overall === "error" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function timed<T extends { status: string; message: string; latencyMs?: number }>(
  fn: () => Promise<T>
): Promise<T & { latencyMs: number }> {
  const t0 = Date.now();
  try {
    const result = await fn();
    return { ...result, latencyMs: result.latencyMs ?? Date.now() - t0 };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    } as T & { latencyMs: number };
  }
}

function toServiceStatus(r: {
  status: string;
  message: string;
  latencyMs?: number;
}): ServiceStatus {
  return {
    status: r.status as ServiceHealth,
    message: r.message,
    latencyMs: r.latencyMs,
  };
}

// ─── Legacy poll handler ──────────────────────────────────────────────────────

async function handleLegacyPoll(generationId: string) {
  const state = getLegacyStore()?.get(generationId);

  if (!state) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  if (state.status === "completed" || state.status === "failed") {
    return NextResponse.json({
      id: state.id,
      status: state.status,
      posterUrl: state.posterUrl,
      tracks: state.tracks.map((t) => ({
        id: t.id,
        status: t.status,
        audioUrl: t.audioUrl,
      })),
      lyrics: state.tracks
        .map((t) => t.lyrics)
        .filter(Boolean)
        .join("\n\n---\n\n"),
    });
  }

  if (DEV_MODE) {
    const allCompleted = state.tracks.every((t) => t.status === "completed");
    if (allCompleted) state.status = "completed";
    // state is a reference; Map reflects mutations automatically

    return NextResponse.json({
      id: state.id,
      status: state.status,
      posterUrl: state.posterUrl,
      tracks: state.tracks.map((t) => ({
        id: t.id,
        status: t.status,
        audioUrl: t.audioUrl,
      })),
      lyrics: state.tracks
        .map((t) => t.lyrics)
        .filter(Boolean)
        .join("\n\n---\n\n"),
    });
  }

  // Poll ACE for each pending track
  const updatedTracks = await Promise.all(
    state.tracks.map(async (track) => {
      if (
        track.status === "completed" ||
        track.status === "failed" ||
        !track.aceTaskId
      ) {
        return track;
      }

      try {
        const statusRes = await fetch(
          `${ACE_STATUS_URL}/${track.aceTaskId}`,
          { headers: { Authorization: `Bearer ${ACE_API_KEY}` } }
        );
        if (!statusRes.ok) return track;

        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          const resultRes = await fetch(
            `${ACE_STATUS_URL}/${track.aceTaskId}/result`,
            { headers: { Authorization: `Bearer ${ACE_API_KEY}` } }
          );
          let audioUrl: string | null = null;
          if (resultRes.ok) {
            const rd = await resultRes.json();
            audioUrl =
              rd.outputs?.[0] ??
              rd.output?.url ??
              rd.output?.audio_url ??
              (typeof rd.output === "string" ? rd.output : null) ??
              rd.audio_url ??
              rd.url ??
              null;
          }
          return { ...track, status: "completed", audioUrl };
        }

        if (statusData.status === "failed") {
          return { ...track, status: "failed" };
        }

        return { ...track, status: "processing" };
      } catch {
        return track;
      }
    })
  );

  state.tracks = updatedTracks as typeof state.tracks;

  const allCompleted = updatedTracks.every((t) => t.status === "completed");
  const allDone = updatedTracks.every(
    (t) => t.status === "completed" || t.status === "failed"
  );

  if (allCompleted) state.status = "completed";
  else if (allDone) state.status = "failed";
  // state is a reference — Map reflects mutations automatically

  return NextResponse.json({
    id: state.id,
    status: state.status,
    posterUrl: state.posterUrl,
    tracks: state.tracks.map((t) => ({
      id: t.id,
      status: t.status,
      audioUrl: t.audioUrl,
    })),
    lyrics: state.tracks
      .map((t) => t.lyrics)
      .filter(Boolean)
      .join("\n\n---\n\n"),
  });
}
