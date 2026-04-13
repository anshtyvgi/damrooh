/**
 * Cover Image Generator
 *
 * Generates album cover art for each song using Google Imagen 3
 * (via the Gemini API). Falls back to a gradient placeholder
 * when the API is unavailable or DEV_MODE is on.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const DEV_MODE = process.env.DEV_MODE === "true";

const IMAGEN_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoverInput {
  title: string;
  mood: string;
  genre: string;
  vibe: string;
  recipientName?: string;
  language?: string;
}

// ─── Mood → visual palette ────────────────────────────────────────────────────

const MOOD_PALETTES: Record<string, { colors: string; hex: string }> = {
  happy:       { colors: "warm golden yellows, soft oranges, and sunshine whites",    hex: "f59e0b" },
  romantic:    { colors: "deep rose pinks, soft lavender, and candlelight gold",      hex: "ec4899" },
  nostalgic:   { colors: "amber sepia, dusty roses, and faded vintage tones",         hex: "b45309" },
  energetic:   { colors: "electric crimson, neon orange, and stark black",             hex: "ef4444" },
  bittersweet: { colors: "twilight indigo, muted purples, and bruised steel blue",    hex: "8b5cf6" },
  playful:     { colors: "vibrant teal, coral pinks, and candy-lime green",           hex: "06b6d4" },
  savage:      { colors: "dark charcoal, electric orange accents, and deep crimson",  hex: "f97316" },
};

// ─── Generate ─────────────────────────────────────────────────────────────────

export async function generateCover(input: CoverInput): Promise<string | null> {
  if (DEV_MODE || !GEMINI_API_KEY) {
    return placeholderCover(input);
  }

  const prompt = buildPrompt(input);

  try {
    const res = await fetch(`${IMAGEN_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "BLOCK_ONLY_HIGH",
          outputOptions: { mimeType: "image/jpeg", compressionQuality: 85 },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.warn(`[Cover] Imagen failed: ${res.status}`);
      return placeholderCover(input);
    }

    const data = await res.json();
    const b64: string | undefined =
      data.predictions?.[0]?.bytesBase64Encoded;

    if (!b64) return placeholderCover(input);

    // Production: upload to GCS/S3 and return CDN URL
    // Dev / staging: return data URL
    return `data:image/jpeg;base64,${b64}`;
  } catch (err) {
    console.warn("[Cover] Error:", err);
    return placeholderCover(input);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPrompt(input: CoverInput): string {
  const palette = MOOD_PALETTES[input.mood] ?? { colors: "rich deep colors" };
  const genreStyle: Record<string, string> = {
    bollywood:  "Bollywood movie poster aesthetic with ornate Indian patterns",
    pop:        "modern pop music album cover, sleek and vibrant",
    lofi:       "lo-fi aesthetic, cozy bedroom studio, soft watercolor",
    classical:  "classical music album, elegant minimalism, concert hall",
    rnb:        "R&B album art, urban sophistication, moody lighting",
    hiphop:     "hip-hop album cover, bold typography space, street art influence",
    acoustic:   "acoustic folk album art, hand-drawn illustration, warm wood tones",
  };
  const style = genreStyle[input.genre] ?? "artistic music album cover";

  return `${style}.
Mood: ${input.mood}, vibe: ${input.vibe}.
Color palette: ${palette.colors}.
Abstract, no faces, no text, no words, no letters.
Ultra high quality, 4K, professional album cover art. Square 1:1 format.`;
}

function placeholderCover(input: CoverInput): string {
  const palette = MOOD_PALETTES[input.mood] ?? { colors: "", hex: "6366f1" };
  const encoded = encodeURIComponent(input.title.slice(0, 24));
  return `https://placehold.co/512x512/${palette.hex}/ffffff?text=${encoded}`;
}
