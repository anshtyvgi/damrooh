/**
 * POST /api/generate/studio
 *
 * Advanced / publishable music creation with full prompt control.
 *
 * Body:
 *   StudioInput = {
 *     prompt: string
 *     style?: string
 *     bpm?: number
 *     key?: string
 *     duration?: number
 *     isPublic: boolean
 *     modelMode: ModelMode
 *     model?: MusicModel
 *     userId?: string
 *   }
 *
 * Response:
 *   { sessionId, modelSelection, lyrics }
 */

import { NextRequest, NextResponse } from "next/server";
import { generateStudioLyrics } from "@/lib/gemini";
import { orchestrate } from "@/lib/orchestrator";
import { Songs } from "@/lib/db";
import type { StudioInput, ModelMode, MusicModel } from "@/types";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    prompt,
    style,
    bpm,
    key,
    duration,
    isPublic = false,
    modelMode = "auto",
    model: preferredModel,
    userId,
  } = body as unknown as StudioInput & { userId?: string };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
    return NextResponse.json(
      { error: "prompt is required (min 5 characters)" },
      { status: 400 }
    );
  }

  const studioInput: StudioInput = {
    prompt: prompt.trim(),
    style: style ? String(style) : undefined,
    bpm: bpm ? Number(bpm) : undefined,
    key: key ? String(key) : undefined,
    duration: duration ? Number(duration) : 60,
    isPublic: Boolean(isPublic),
    modelMode: (modelMode as ModelMode) ?? "auto",
    model: preferredModel as MusicModel | undefined,
  };

  try {
    // ── Step 1: Generate lyric/arrangement variations via Gemini ──────────
    const lyrics = await generateStudioLyrics(studioInput);

    // ── Step 2: Orchestrate ───────────────────────────────────────────────
    const { sessionId, modelSelection } = await orchestrate({
      mode: "studio",
      userId: userId ? String(userId) : undefined,
      input: studioInput,
      modelMode: studioInput.modelMode,
      preferredModel: studioInput.model,
      lyrics,
    });

    // If isPublic, we'll register songs in the DB once tracks complete
    // (handled by the orchestrator completion hook in a full implementation)

    return NextResponse.json(
      {
        sessionId,
        modelSelection,
        lyrics,
        isPublic,
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("[/api/generate/studio]", err);
    return NextResponse.json(
      { error: "Studio generation failed", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
