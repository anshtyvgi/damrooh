/**
 * Google Lyria 3 Client — via Wavespeed
 *
 * Endpoint: https://api.wavespeed.ai/api/v3/google/lyria-3
 * Auth:     Bearer ACE_API_KEY  (same key for all Wavespeed models)
 * Pattern:  POST → { id } → poll /predictions/{id} → /predictions/{id}/result
 */

const API_KEY = process.env.ACE_API_KEY ?? "";
const DEV_MODE = process.env.DEV_MODE === "true";

const LYRIA_URL = "https://api.wavespeed.ai/api/v3/google/lyria-3";
const POLL_URL = "https://api.wavespeed.ai/api/v3/predictions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LyriaGenerateInput {
  prompt: string;   // musical description / style tags
  lyrics?: string;  // optional lyric text
  duration?: number; // seconds
  bpm?: number;
  key?: string;
}

export interface LyriaTaskResult {
  taskId: string;
}

export interface LyriaTrackResult {
  status: "processing" | "completed" | "failed";
  audioUrl?: string;
}

// ─── Generate ─────────────────────────────────────────────────────────────────

export async function lyriaGenerate(
  input: LyriaGenerateInput
): Promise<LyriaTaskResult> {
  if (DEV_MODE || !API_KEY) {
    return { taskId: `dev-lyria-${crypto.randomUUID()}` };
  }

  const res = await fetch(LYRIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      ...(input.lyrics ? { lyrics: input.lyrics } : {}),
      duration: input.duration ?? 60,
      ...(input.bpm ? { bpm: input.bpm } : {}),
      ...(input.key ? { key: input.key } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lyria 3 generate failed: ${res.status} — ${body}`);
  }

  const data = await res.json();
  const taskId = data.id ?? data.task_id;
  if (!taskId) throw new Error("Lyria 3: no task ID in response");

  return { taskId };
}

// ─── Poll ─────────────────────────────────────────────────────────────────────

export async function lyriaPollStatus(taskId: string): Promise<LyriaTrackResult> {
  if (DEV_MODE || taskId.startsWith("dev-")) return { status: "processing" };

  const statusRes = await fetch(`${POLL_URL}/${taskId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!statusRes.ok) throw new Error(`Lyria 3 poll failed: ${statusRes.status}`);

  const statusData = await statusRes.json();
  const state: string = statusData.status ?? statusData.state ?? "processing";

  if (state === "completed" || state === "succeeded") {
    const resultRes = await fetch(`${POLL_URL}/${taskId}/result`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    let audioUrl: string | undefined;
    if (resultRes.ok) {
      const rd = await resultRes.json();
      audioUrl =
        rd.outputs?.[0] ??
        rd.output?.url ??
        rd.output?.audio_url ??
        (typeof rd.output === "string" ? rd.output : undefined) ??
        rd.audio_url ??
        rd.url;
    }

    return { status: "completed", audioUrl };
  }

  if (state === "failed" || state === "error") return { status: "failed" };
  return { status: "processing" };
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function lyriaHealthCheck(): Promise<{
  status: "ok" | "error" | "not_configured";
  message: string;
  latencyMs?: number;
}> {
  if (!API_KEY) return { status: "not_configured", message: "ACE_API_KEY not set" };
  if (DEV_MODE) return { status: "ok", message: "dev mode — bypassed" };

  const t0 = Date.now();
  try {
    const res = await fetch(`${POLL_URL}?limit=1`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - t0;
    return res.ok
      ? { status: "ok", message: "Wavespeed reachable (Lyria 3)", latencyMs }
      : { status: "error", message: `HTTP ${res.status}`, latencyMs };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    };
  }
}
