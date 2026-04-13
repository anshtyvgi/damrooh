/**
 * POST /api/generate/dedicate
 *
 * Creates a personalised music dedication.
 *
 * Body:
 *   DedicationInput + { modelMode: ModelMode, model?: MusicModel, userId?: string }
 *
 * Response:
 *   { sessionId, modelSelection, lyrics }
 *
 * The client should then poll GET /api/generate/session/:id for track status.
 */

import { NextRequest, NextResponse } from "next/server";
import { generate3Lyrics } from "@/lib/gemini";
import { orchestrate } from "@/lib/orchestrator";
import type { DedicationInput, ModelMode, MusicModel } from "@/types";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Validate required fields ──────────────────────────────────────────────
  const {
    recipientName,
    occasion,
    relationship,
    message,
    mood,
    genre,
    language,
    voice,
    modelMode = "auto",
    model: preferredModel,
    userId,
  } = body as unknown as DedicationInput & {
    modelMode: ModelMode;
    model?: MusicModel;
    userId?: string;
  };

  if (!recipientName || !occasion || !mood || !genre || !language || !voice) {
    return NextResponse.json(
      {
        error: "Missing required fields",
        required: ["recipientName", "occasion", "mood", "genre", "language", "voice"],
      },
      { status: 400 }
    );
  }

  const dedicationInput: DedicationInput = {
    recipientName: String(recipientName),
    occasion,
    relationship,
    message: String(message ?? ""),
    mood,
    genre,
    language,
    voice,
  };

  try {
    // ── Step 1: Generate 3 lyric variations via Gemini ────────────────────
    const lyrics = await generate3Lyrics(dedicationInput);

    // ── Step 2: Orchestrate (model route + fire pipeline) ─────────────────
    const { sessionId, modelSelection } = await orchestrate({
      mode: "dedicate",
      userId: userId ? String(userId) : undefined,
      input: dedicationInput,
      modelMode: (modelMode as ModelMode) ?? "auto",
      preferredModel: preferredModel as MusicModel | undefined,
      lyrics,
    });

    return NextResponse.json(
      {
        sessionId,
        modelSelection,
        lyrics, // return for immediate preview in UI
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("[/api/generate/dedicate]", err);
    return NextResponse.json(
      { error: "Generation failed", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
