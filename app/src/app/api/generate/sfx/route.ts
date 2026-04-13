/**
 * POST /api/generate/sfx
 *
 * Generates shorter, loopable background audio and sound effects.
 * Routed to ACE 1.5 by default (best for non-lyrical audio).
 *
 * Body:
 *   SFXInput = {
 *     description: string       — what the sound should be
 *     duration?: number         — seconds (default 30)
 *     loopable: boolean
 *     category: SFXCategory
 *     modelMode: ModelMode
 *     model?: MusicModel
 *     userId?: string
 *   }
 *
 * Response:
 *   { sessionId, modelSelection, variations }
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSFXTags } from "@/lib/gemini";
import { orchestrate } from "@/lib/orchestrator";
import type { SFXInput, SFXCategory, ModelMode, MusicModel } from "@/types";

const VALID_CATEGORIES: SFXCategory[] = [
  "ambient",
  "nature",
  "urban",
  "cinematic",
  "game",
  "custom",
];

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    description,
    duration,
    loopable = true,
    category = "ambient",
    modelMode = "auto",
    model: preferredModel,
    userId,
  } = body as unknown as SFXInput & { userId?: string };

  if (!description || typeof description !== "string" || description.trim().length < 3) {
    return NextResponse.json(
      { error: "description is required (min 3 characters)" },
      { status: 400 }
    );
  }

  if (!VALID_CATEGORIES.includes(category as SFXCategory)) {
    return NextResponse.json(
      { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  const sfxDuration = Math.min(Math.max(Number(duration ?? 30), 5), 120);

  const sfxInput: SFXInput = {
    description: description.trim(),
    duration: sfxDuration,
    loopable: Boolean(loopable),
    category: category as SFXCategory,
    modelMode: (modelMode as ModelMode) ?? "auto",
    model: preferredModel as MusicModel | undefined,
  };

  try {
    // ── Step 1: Generate sonic descriptor tags via Gemini ─────────────────
    const variations = await generateSFXTags(sfxInput);

    // ── Step 2: Orchestrate ───────────────────────────────────────────────
    const { sessionId, modelSelection } = await orchestrate({
      mode: "sfx",
      userId: userId ? String(userId) : undefined,
      input: sfxInput,
      modelMode: sfxInput.modelMode,
      preferredModel: sfxInput.model,
      lyrics: variations,
    });

    return NextResponse.json(
      {
        sessionId,
        modelSelection,
        variations,
        duration: sfxDuration,
        loopable,
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("[/api/generate/sfx]", err);
    return NextResponse.json(
      { error: "SFX generation failed", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
