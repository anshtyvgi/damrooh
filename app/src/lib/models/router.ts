/**
 * Damrooh Model Router
 *
 * Decides which AI music model handles each generation request.
 *
 * Auto-routing heuristics:
 *  ┌────────────────────────────────┬────────────────┬─────────────────────────────────────────┐
 *  │ Signal                         │ → Model        │ Reason                                  │
 *  ├────────────────────────────────┼────────────────┼─────────────────────────────────────────┤
 *  │ mode = sfx                     │ ACE 1.5        │ Best for loops, textures, sound design  │
 *  │ language = hindi / punjabi     │ ACE 1.5        │ South Asian music training              │
 *  │ genre = bollywood              │ ACE 1.5        │ South Asian music training              │
 *  │ genre = lofi / classical /     │ Lyria          │ Superior instrument fidelity            │
 *  │          acoustic              │                │                                         │
 *  │ mode = studio, mood = romantic │ Lyria          │ Richer harmonic depth                   │
 *  │   or nostalgic                 │                │                                         │
 *  │ mode = studio (default)        │ Lyria          │ Highest baseline quality                │
 *  │ English + rnb / hiphop / pop   │ ElevenLabs     │ Best English vocal generation           │
 *  │ dedicate (default)             │ ACE 1.5        │ Emotional, personal music               │
 *  └────────────────────────────────┴────────────────┴─────────────────────────────────────────┘
 */

import type {
  MusicModel,
  ModelMode,
  GenerationMode,
  ModelSelection,
  Genre,
  Language,
  Mood,
} from "@/types";

export interface RouterContext {
  mode: GenerationMode;
  genre?: Genre;
  language?: Language;
  mood?: Mood;
  prompt?: string;
}

/**
 * Primary entry point.
 * In manual mode, validates and passes through the caller's choice.
 * In auto mode, applies the routing table above.
 */
export function routeModel(
  modelMode: ModelMode,
  context: RouterContext,
  preferredModel?: MusicModel
): ModelSelection {
  if (modelMode === "manual" && preferredModel) {
    return {
      model: preferredModel,
      mode: "manual",
      reason: `Manually selected: ${getModelDisplayName(preferredModel)}`,
    };
  }
  return autoRoute(context);
}

function autoRoute(ctx: RouterContext): ModelSelection {
  const { mode, genre, language, mood } = ctx;

  // 1. SFX always → ACE 1.5
  if (mode === "sfx") {
    return sel(
      "ace-1.5",
      "ACE 1.5 excels at sound effects, ambient textures, and loopable audio"
    );
  }

  // 2. South Asian language / Bollywood → ACE 1.5
  if (language === "hindi" || language === "punjabi" || genre === "bollywood") {
    return sel(
      "ace-1.5",
      "ACE 1.5 has superior training on South Asian music and Hindi/Punjabi vocals"
    );
  }

  // 3. Instrument-heavy genres → Lyria
  if (genre === "lofi" || genre === "classical" || genre === "acoustic") {
    return sel(
      "lyria",
      "Google Lyria leads in acoustic instrument fidelity and classical composition"
    );
  }

  // 4. Emotional Studio → Lyria
  if (mode === "studio" && (mood === "romantic" || mood === "nostalgic")) {
    return sel(
      "lyria",
      "Lyria produces richer harmonic depth for emotional studio productions"
    );
  }

  // 5. Studio default → Lyria
  if (mode === "studio") {
    return sel("lyria", "Lyria selected as studio default for highest quality output");
  }

  // 6. English contemporary → ElevenLabs
  if (
    (language === "english" || language === "hinglish") &&
    (genre === "rnb" || genre === "hiphop" || genre === "pop")
  ) {
    return sel(
      "elevenlabs",
      "ElevenLabs excels at English vocal generation in contemporary pop, R&B, and hip-hop"
    );
  }

  // 7. Dedicate default → ACE 1.5
  return sel(
    "ace-1.5",
    "ACE 1.5 selected as dedicate default for personalized, emotional music"
  );
}

function sel(model: MusicModel, reason: string): ModelSelection {
  return { model, mode: "auto", reason };
}

export function getModelDisplayName(model: MusicModel): string {
  const names: Record<MusicModel, string> = {
    "ace-1.5": "Wavespeed ACE 1.5",
    lyria: "Google Lyria",
    elevenlabs: "ElevenLabs Music",
  };
  return names[model];
}

/** Returns all supported models with metadata */
export const MODEL_REGISTRY: {
  id: MusicModel;
  name: string;
  strengths: string[];
  maxDuration: number;
}[] = [
  {
    id: "ace-1.5",
    name: "Wavespeed ACE 1.5",
    strengths: [
      "South Asian music",
      "Bollywood / Hindi / Punjabi vocals",
      "Sound effects",
      "Loopable audio",
      "Emotional dedications",
    ],
    maxDuration: 240,
  },
  {
    id: "lyria",
    name: "Google Lyria",
    strengths: [
      "Classical instruments",
      "Lo-fi / acoustic",
      "Studio-quality output",
      "Harmonic depth",
      "Cinematic scores",
    ],
    maxDuration: 120,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs Music",
    strengths: [
      "English vocals",
      "Contemporary pop",
      "R&B / Hip-hop",
      "Voice realism",
      "Fast generation",
    ],
    maxDuration: 180,
  },
];
