/**
 * GET /api/generate/session/:id
 *
 * Returns the current state of a generation session.
 * Poll this endpoint (every 3–5s) until status is 'completed' | 'partial' | 'failed'.
 *
 * Falls back to the legacy generationStore for backward compatibility
 * with sessions created via the original /api/generate route.
 */

import { NextRequest, NextResponse } from "next/server";
import { Sessions } from "@/lib/db";

interface LegacyTrack {
  id: string;
  status: string;
  audioUrl: string | null;
  lyrics: string;
  title: string;
  vibe: string;
}

interface LegacyGenerationState {
  id: string;
  status: string;
  tags: string[];
  tracks: LegacyTrack[];
  posterUrl: string | null;
  createdAt: string;
}

// Access legacy store without re-declaring the global type
// (declared authoritatively in /api/generate/route.ts)
function getLegacyStore(): Map<string, LegacyGenerationState> | undefined {
  return (global as unknown as { generationStore?: Map<string, LegacyGenerationState> })
    .generationStore;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  // ── Try new session store first ───────────────────────────────────────────
  const session = Sessions.findById(id);
  if (session) {
    return NextResponse.json({
      sessionId: session.id,
      mode: session.mode,
      status: session.status,
      progress: session.progress,
      modelSelection: session.modelSelection,
      tracks: session.tracks.map((t) => ({
        id: t.id,
        variationIndex: t.variationIndex,
        status: t.status,
        title: t.lyric.title,
        vibe: t.lyric.vibe,
        lyrics: t.lyric.lyrics,
        tags: t.lyric.tags,
        model: t.model,
        audioUrl: t.audioUrl ?? null,
        coverUrl: t.coverUrl ?? null,
        duration: t.duration ?? null,
        error: t.error ?? null,
      })),
      error: session.error ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  }

  // ── Fall back to legacy generationStore ───────────────────────────────────
  const legacyState = getLegacyStore()?.get(id);
  if (legacyState) {
    return NextResponse.json({
      sessionId: legacyState.id,
      mode: "dedicate",
      status: legacyState.status,
      progress: legacyState.status === "completed" ? 100 : 50,
      modelSelection: {
        model: "ace-1.5",
        mode: "auto",
        reason: "Legacy session",
      },
      tracks: legacyState.tracks.map((t) => ({
        id: t.id,
        variationIndex: parseInt(t.id.split("-t").pop() ?? "0", 10),
        status: t.status,
        title: t.title,
        vibe: t.vibe,
        lyrics: t.lyrics,
        tags: [],
        model: "ace-1.5",
        audioUrl: t.audioUrl,
        coverUrl: legacyState.posterUrl,
        duration: null,
        error: null,
      })),
      error: null,
      createdAt: legacyState.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ error: "Session not found" }, { status: 404 });
}
