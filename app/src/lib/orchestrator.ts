/**
 * Damrooh Generation Orchestrator
 *
 * Coordinates the full multi-model music generation pipeline:
 *
 *   1. Route → select AI model (auto or manual)
 *   2. Create session in DB
 *   3. Enqueue background job
 *   4. Return sessionId immediately (non-blocking)
 *
 * Background pipeline (runs after response is sent):
 *   5. Fire model API calls (one per lyric variation) in parallel
 *   6. Fire cover image generation in parallel with music
 *   7. Poll / await each track until completed or failed
 *   8. Update session status and progress throughout
 *
 * NOTE: In Next.js dev mode (persistent Node process) the background
 * setTimeout tasks survive the HTTP response. In production serverless
 * deployments (Vercel), replace with BullMQ + Redis worker.
 */

import { routeModel } from "@/lib/models/router";
import { aceGenerate, acePollStatus } from "@/lib/models/ace";
import { lyriaGenerate, lyriaPollStatus } from "@/lib/models/lyria";
import { elevenLabsGenerate, elevenLabsPollStatus } from "@/lib/models/elevenlabs";
import { generateCover } from "@/lib/cover";
import { Sessions, Queue } from "@/lib/db";
import type {
  GenerationMode,
  MusicModel,
  ModelMode,
  ModelSelection,
  LyricVariation,
  SessionTrack,
  DedicationInput,
  StudioInput,
  SFXInput,
} from "@/types";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface OrchestrateInput {
  mode: GenerationMode;
  userId?: string;
  input: DedicationInput | StudioInput | SFXInput;
  modelMode: ModelMode;
  preferredModel?: MusicModel;
  lyrics: LyricVariation[];
}

export interface OrchestrateResult {
  sessionId: string;
  modelSelection: ModelSelection;
}

/**
 * Entry point. Creates the session, enqueues the pipeline, and returns
 * the sessionId immediately so the HTTP handler can respond fast.
 */
export async function orchestrate(
  params: OrchestrateInput
): Promise<OrchestrateResult> {
  const { mode, userId, input, modelMode, preferredModel, lyrics } = params;

  // 1. Route model
  const ctx = buildRouterContext(mode, input);
  const modelSelection = routeModel(modelMode, ctx, preferredModel);

  // 2. Create session
  const sessionId = crypto.randomUUID();
  const initialTracks: SessionTrack[] = lyrics.map((lyric, i) => ({
    id: `${sessionId}-t${i}`,
    variationIndex: i,
    lyric,
    model: modelSelection.model,
    status: "pending" as const,
  }));

  Sessions.create({
    id: sessionId,
    userId,
    mode,
    status: "queued",
    progress: 0,
    modelSelection,
    input: input as unknown as Record<string, unknown>,
    lyrics,
    tracks: initialTracks,
  });

  // 3. Enqueue job record
  const jobId = crypto.randomUUID();
  Queue.enqueue({
    id: jobId,
    sessionId,
    status: "queued",
  });

  // 4. Kick off background pipeline (non-blocking)
  setTimeout(() => {
    Queue.update(jobId, {
      status: "running",
      startedAt: new Date().toISOString(),
    });
    runPipeline(sessionId, jobId, lyrics, modelSelection, mode, input as DedicationInput)
      .then(() => {
        Queue.update(jobId, {
          status: "done",
          completedAt: new Date().toISOString(),
        });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Orchestrator] Pipeline ${sessionId} failed:`, msg);
        Sessions.update(sessionId, { status: "failed", error: msg });
        Queue.update(jobId, {
          status: "failed",
          error: msg,
          completedAt: new Date().toISOString(),
        });
      });
  }, 0);

  return { sessionId, modelSelection };
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

async function runPipeline(
  sessionId: string,
  _jobId: string,
  lyrics: LyricVariation[],
  modelSelection: ModelSelection,
  mode: GenerationMode,
  dedicationInput?: DedicationInput
): Promise<void> {
  Sessions.update(sessionId, { status: "generating", progress: 5 });

  // Helper: resolve mood/genre from whichever input shape we got
  const mood = (dedicationInput as DedicationInput)?.mood ?? "happy";
  const genre = (dedicationInput as DedicationInput)?.genre ?? "pop";
  const sfxDuration = mode === "sfx" ? 30 : 60;

  // Fire all tracks + covers in parallel
  await Promise.allSettled([
    // ── Music tracks ───────────────────────────────────────────────────
    ...lyrics.map(async (lyric, i) => {
      const trackId = `${sessionId}-t${i}`;
      patchTrack(sessionId, trackId, { status: "generating" });
      incrementProgress(sessionId, 10);

      try {
        let taskId: string;

        switch (modelSelection.model) {
          case "ace-1.5": {
            const r = await aceGenerate({
              lyrics: lyric.lyrics || lyric.tags.join(", "),
              tags: lyric.tags.join(", "),
              duration: sfxDuration,
            });
            taskId = r.taskId;
            break;
          }
          case "lyria": {
            const prompt = `${lyric.vibe} — ${lyric.tags.join(", ")}`;
            const r = await lyriaGenerate({
              prompt,
              lyrics: lyric.lyrics || undefined,
              duration: sfxDuration,
            });
            taskId = r.taskId;
            break;
          }
          case "elevenlabs": {
            const prompt = `${lyric.vibe} ${genre} music: ${lyric.tags.join(", ")}`;
            const r = await elevenLabsGenerate({
              prompt,
              lyrics: lyric.lyrics || undefined,
              duration_seconds: sfxDuration,
            });
            taskId = r.taskId;
            break;
          }
        }

        patchTrack(sessionId, trackId, {
          modelTaskId: taskId!,
          status: "generating",
        });

        // Poll until done
        const DEV_MODE = process.env.DEV_MODE === "true";
        if (DEV_MODE) {
          await simulateDevCompletion(sessionId, trackId, i);
        } else {
          await pollTrack(sessionId, trackId, taskId!, modelSelection.model);
        }
      } catch (err) {
        console.error(`[Pipeline] track ${trackId} failed:`, err);
        patchTrack(sessionId, trackId, {
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }),

    // ── Cover images ───────────────────────────────────────────────────
    ...lyrics.map(async (lyric, i) => {
      try {
        const coverUrl = await generateCover({
          title: lyric.title,
          mood,
          genre,
          vibe: lyric.vibe,
          recipientName: (dedicationInput as DedicationInput)?.recipientName,
        });
        if (coverUrl) {
          patchTrack(sessionId, `${sessionId}-t${i}`, { coverUrl });
        }
      } catch (err) {
        console.warn(`[Pipeline] cover ${i} failed:`, err);
      }
    }),
  ]);

  // Finalise session status
  const final = Sessions.findById(sessionId);
  if (!final) return;

  const allOk = final.tracks.every((t) => t.status === "completed");
  const allDone = final.tracks.every(
    (t) => t.status === "completed" || t.status === "failed"
  );

  Sessions.update(sessionId, {
    status: allOk ? "completed" : allDone ? "partial" : "completed",
    progress: 100,
  });
}

// ─── Poll loop ────────────────────────────────────────────────────────────────

async function pollTrack(
  sessionId: string,
  trackId: string,
  taskId: string,
  model: MusicModel,
  maxAttempts = 72,        // 72 × 5s = 6 minutes max
  intervalMs = 5_000
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(intervalMs);

    type PollResult = { status: string; audioUrl?: string };
    let result: PollResult;

    try {
      switch (model) {
        case "ace-1.5":
          result = await acePollStatus(taskId);
          break;
        case "lyria":
          result = await lyriaPollStatus(taskId);
          break;
        case "elevenlabs":
          result = await elevenLabsPollStatus(taskId);
          break;
      }
    } catch (err) {
      console.warn(`[Poll] ${trackId} attempt ${attempt} error:`, err);
      continue;
    }

    if (result!.status === "completed") {
      patchTrack(sessionId, trackId, {
        status: "completed",
        audioUrl: result!.audioUrl,
      });
      return;
    }
    if (result!.status === "failed") {
      patchTrack(sessionId, trackId, { status: "failed" });
      return;
    }
  }

  // Timeout
  patchTrack(sessionId, trackId, {
    status: "failed",
    error: "Polling timeout after 6 minutes",
  });
}

// ─── Dev simulation ───────────────────────────────────────────────────────────

const DEV_AUDIO_URLS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
];

async function simulateDevCompletion(
  sessionId: string,
  trackId: string,
  index: number
): Promise<void> {
  await sleep((index + 1) * 4_000); // 4s, 8s, 12s stagger
  patchTrack(sessionId, trackId, {
    status: "completed",
    audioUrl: DEV_AUDIO_URLS[index % DEV_AUDIO_URLS.length],
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function patchTrack(
  sessionId: string,
  trackId: string,
  update: Partial<SessionTrack>
): void {
  const session = Sessions.findById(sessionId);
  if (!session) return;
  const tracks = session.tracks.map((t) =>
    t.id === trackId ? { ...t, ...update } : t
  );
  Sessions.update(sessionId, { tracks });
}

function incrementProgress(sessionId: string, by: number): void {
  const session = Sessions.findById(sessionId);
  if (!session) return;
  Sessions.update(sessionId, {
    progress: Math.min(95, (session.progress ?? 0) + by),
  });
}

function buildRouterContext(
  mode: GenerationMode,
  input: DedicationInput | StudioInput | SFXInput
) {
  if (mode === "dedicate") {
    const d = input as DedicationInput;
    return { mode, genre: d.genre, language: d.language, mood: d.mood };
  }
  if (mode === "studio") {
    return { mode, prompt: (input as StudioInput).prompt };
  }
  return { mode, prompt: (input as SFXInput).description };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
