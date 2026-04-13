/**
 * ElevenLabs Music Client — via Wavespeed
 *
 * Endpoint: https://api.wavespeed.ai/api/v3/elevenlabs/music-generation
 * Auth:     Bearer ACE_API_KEY  (same key for all Wavespeed models)
 * Pattern:  POST → { id } → poll /predictions/{id} → /predictions/{id}/result
 */

const API_KEY = process.env.ACE_API_KEY ?? "";
const DEV_MODE = process.env.DEV_MODE === "true";

const EL_URL = "https://api.wavespeed.ai/api/v3/elevenlabs/music-generation";
const POLL_URL = "https://api.wavespeed.ai/api/v3/predictions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ElevenLabsGenerateInput {
  prompt: string;           // text description of the music
  duration_seconds?: number; // default 30, max 30 for ElevenLabs via Wavespeed
  lyrics?: string;          // optional lyrics to sing
}

export interface ElevenLabsTaskResult {
  taskId: string;
  audioUrl?: string; // set if Wavespeed returns inline
}

export interface ElevenLabsTrackResult {
  status: "processing" | "completed" | "failed";
  audioUrl?: string;
}

// ─── Generate ─────────────────────────────────────────────────────────────────

export async function elevenLabsGenerate(
  input: ElevenLabsGenerateInput
): Promise<ElevenLabsTaskResult> {
  if (DEV_MODE || !API_KEY) {
    return { taskId: `dev-el-${crypto.randomUUID()}` };
  }

  const res = await fetch(EL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      duration_seconds: Math.min(input.duration_seconds ?? 30, 30),
      ...(input.lyrics ? { lyrics: input.lyrics } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs Music generate failed: ${res.status} — ${body}`);
  }

  const data = await res.json();
  const taskId = data.id ?? data.task_id;
  if (!taskId) throw new Error("ElevenLabs Music: no task ID in response");

  return { taskId };
}

// ─── Poll ─────────────────────────────────────────────────────────────────────

export async function elevenLabsPollStatus(
  taskId: string,
  audioUrl?: string
): Promise<ElevenLabsTrackResult> {
  if (audioUrl) return { status: "completed", audioUrl };
  if (DEV_MODE || taskId.startsWith("dev-")) return { status: "processing" };

  const statusRes = await fetch(`${POLL_URL}/${taskId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!statusRes.ok) throw new Error(`ElevenLabs poll failed: ${statusRes.status}`);

  const statusData = await statusRes.json();
  const state: string = statusData.status ?? statusData.state ?? "processing";

  if (state === "completed" || state === "succeeded") {
    const resultRes = await fetch(`${POLL_URL}/${taskId}/result`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    let url: string | undefined;
    if (resultRes.ok) {
      const rd = await resultRes.json();
      url =
        rd.outputs?.[0] ??
        rd.output?.url ??
        rd.output?.audio_url ??
        (typeof rd.output === "string" ? rd.output : undefined) ??
        rd.audio_url ??
        rd.url;
    }

    return { status: "completed", audioUrl: url };
  }

  if (state === "failed" || state === "error") return { status: "failed" };
  return { status: "processing" };
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function elevenLabsHealthCheck(): Promise<{
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
      ? { status: "ok", message: "Wavespeed reachable (ElevenLabs Music)", latencyMs }
      : { status: "error", message: `HTTP ${res.status}`, latencyMs };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    };
  }
}
