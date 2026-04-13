/**
 * Wavespeed ACE 1.5 Client
 *
 * Handles music generation via the ACE Step 1.5 model.
 * Supports async polling pattern (fire → poll → result).
 *
 * Docs: https://wavespeed.ai/models/wavespeed-ai/ace-step-1.5
 */

const ACE_API_KEY = process.env.ACE_API_KEY ?? "";
const DEV_MODE = process.env.DEV_MODE === "true";

const ACE_GENERATE_URL =
  "https://api.wavespeed.ai/api/v3/wavespeed-ai/ace-step-1.5";
const ACE_PREDICTIONS_URL = "https://api.wavespeed.ai/api/v3/predictions";

// ─── Input / output types ────────────────────────────────────────────────────

export interface AceGenerateInput {
  lyrics: string;
  tags: string; // comma-separated style descriptors
  duration: number; // seconds (1–240)
  seed?: number; // -1 = random
}

export interface AceTaskResult {
  taskId: string;
}

export interface AceTrackResult {
  status: "processing" | "completed" | "failed";
  audioUrl?: string;
}

// ─── Generate ─────────────────────────────────────────────────────────────────

/**
 * Fire an ACE generation request.
 * Returns a taskId for async polling.
 * In DEV_MODE returns a synthetic taskId immediately.
 */
export async function aceGenerate(
  input: AceGenerateInput
): Promise<AceTaskResult> {
  if (DEV_MODE || !ACE_API_KEY) {
    return { taskId: `dev-ace-${crypto.randomUUID()}` };
  }

  const res = await fetch(ACE_GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACE_API_KEY}`,
    },
    body: JSON.stringify({
      lyrics: input.lyrics,
      tags: input.tags,
      duration: input.duration,
      seed: input.seed ?? -1,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ACE generate failed: ${res.status} — ${body}`);
  }

  const data = await res.json();

  // API returns { id: "...", ... } at the top level
  const taskId = data.id ?? data.task_id ?? data.prediction_id;
  if (!taskId) throw new Error("ACE: no task ID in response");

  return { taskId };
}

// ─── Poll ─────────────────────────────────────────────────────────────────────

/**
 * Check the status of a previously submitted ACE task.
 * Call this on an interval until status is 'completed' or 'failed'.
 */
export async function acePollStatus(taskId: string): Promise<AceTrackResult> {
  if (DEV_MODE || taskId.startsWith("dev-")) {
    // Dev mode status is managed by orchestrator timeouts
    return { status: "processing" };
  }

  const statusRes = await fetch(`${ACE_PREDICTIONS_URL}/${taskId}`, {
    headers: { Authorization: `Bearer ${ACE_API_KEY}` },
  });

  if (!statusRes.ok) {
    throw new Error(`ACE poll failed: ${statusRes.status}`);
  }

  const statusData = await statusRes.json();
  const state: string = statusData.status ?? statusData.state ?? "processing";

  if (state === "completed" || state === "succeeded") {
    const resultRes = await fetch(`${ACE_PREDICTIONS_URL}/${taskId}/result`, {
      headers: { Authorization: `Bearer ${ACE_API_KEY}` },
    });

    let audioUrl: string | undefined;
    if (resultRes.ok) {
      const rd = await resultRes.json();
      // Probe known response shapes
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

  if (state === "failed" || state === "error") {
    return { status: "failed" };
  }

  return { status: "processing" };
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function aceHealthCheck(): Promise<{
  status: "ok" | "error" | "not_configured";
  message: string;
  latencyMs?: number;
}> {
  if (!ACE_API_KEY) {
    return { status: "not_configured", message: "ACE_API_KEY not set" };
  }
  if (DEV_MODE) {
    return { status: "ok", message: "dev mode — API calls bypassed" };
  }

  const t0 = Date.now();
  try {
    const res = await fetch(`${ACE_PREDICTIONS_URL}?limit=1`, {
      headers: { Authorization: `Bearer ${ACE_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - t0;
    if (res.ok) return { status: "ok", message: "reachable", latencyMs };
    return {
      status: "error",
      message: `HTTP ${res.status}`,
      latencyMs,
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    };
  }
}
