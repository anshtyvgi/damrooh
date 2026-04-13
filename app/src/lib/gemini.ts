/**
 * Gemini Lyrics & Prompt Helper
 *
 * Centralises all Gemini API calls:
 *  - generate3Lyrics       → Dedicate mode (personalised lyrics)
 *  - generateStudioLyrics  → Studio mode (prompt-driven variations)
 *  - generateSFXTags       → SFX mode (sonic descriptor tags)
 *  - geminiHealthCheck     → /status endpoint
 */

import type { DedicationInput, StudioInput, SFXInput, LyricVariation } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const DEV_MODE = process.env.DEV_MODE === "true";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─── Shared fetch helper ─────────────────────────────────────────────────────

async function geminiJSON<T>(prompt: string): Promise<T> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned empty content");
  return JSON.parse(text) as T;
}

// ─── Dedicate mode ────────────────────────────────────────────────────────────

export async function generate3Lyrics(
  input: DedicationInput
): Promise<LyricVariation[]> {
  if (DEV_MODE || !GEMINI_API_KEY) return dedicateFallback(input);

  const prompt = `You are a world-class songwriter. Generate 3 COMPLETELY DIFFERENT song lyric variations for a personalised music dedication.

Each variation MUST have a different emotional angle, storytelling approach, and song structure.

RULES:
- Language: ${input.language}
- Mood: ${input.mood}  Genre: ${input.genre}  Voice: ${input.voice}
- Include section markers: [Verse] [Chorus] [Bridge]
- Personalise for recipient "${input.recipientName}" and occasion "${input.occasion}"
- Relationship context: ${input.relationship}
- Each lyric body: 150–250 words
- Tags: comma-separated music/style descriptors (tempo, instruments, energy)
${input.message ? `- Weave in this personal message: "${input.message}"` : ""}

RESPOND ONLY with valid JSON — no markdown fences:
{
  "options": [
    {
      "title": "Song Title",
      "vibe": "Upbeat & Warm",
      "lyrics": "[Verse]\\nLine 1\\nLine 2\\n\\n[Chorus]\\nChorus lines...",
      "tags": "pop, upbeat, piano, 120bpm, warm"
    }
  ]
}`;

  try {
    const parsed = await geminiJSON<{ options: Omit<LyricVariation, "id">[] }>(prompt);
    const options = parsed.options ?? (parsed as unknown as Omit<LyricVariation, "id">[]);
    return options.slice(0, 3).map((o, i) => ({ ...o, id: `lyric-${i}` }));
  } catch (err) {
    console.error("[Gemini] generate3Lyrics fallback:", err);
    return dedicateFallback(input);
  }
}

// ─── Studio mode ──────────────────────────────────────────────────────────────

export async function generateStudioLyrics(
  input: StudioInput
): Promise<LyricVariation[]> {
  if (DEV_MODE || !GEMINI_API_KEY) return studioFallback(input);

  const prompt = `You are a professional music producer and lyricist. Generate 3 distinct song variations based on the following studio brief.

Studio brief: "${input.prompt}"
${input.style ? `Style: ${input.style}` : ""}
${input.bpm ? `BPM: ${input.bpm}` : ""}
${input.key ? `Key: ${input.key}` : ""}

Each variation should:
- Explore a different creative direction of the brief
- Include [Verse] [Chorus] [Bridge] section markers
- Be 150–300 words
- Have a unique title and vibe description
- Tags: comma-separated production descriptors

RESPOND ONLY with valid JSON:
{
  "options": [
    {
      "title": "Title",
      "vibe": "Dark & Cinematic",
      "lyrics": "[Verse]\\n...",
      "tags": "cinematic, strings, 90bpm, minor key"
    }
  ]
}`;

  try {
    const parsed = await geminiJSON<{ options: Omit<LyricVariation, "id">[] }>(prompt);
    const options = parsed.options ?? (parsed as unknown as Omit<LyricVariation, "id">[]);
    return options.slice(0, 3).map((o, i) => ({ ...o, id: `lyric-${i}` }));
  } catch (err) {
    console.error("[Gemini] generateStudioLyrics fallback:", err);
    return studioFallback(input);
  }
}

// ─── SFX mode ─────────────────────────────────────────────────────────────────

/**
 * For SFX there are no lyrics — we generate sonic descriptor tags
 * that guide the AI music model's generation.
 * Returns a single LyricVariation with empty lyrics and rich tags.
 */
export async function generateSFXTags(
  input: SFXInput
): Promise<LyricVariation[]> {
  if (DEV_MODE || !GEMINI_API_KEY) return sfxFallback(input);

  const prompt = `You are a sound designer and audio engineer. Generate 3 sets of descriptive tags for AI sound/music generation.

Sound description: "${input.description}"
Category: ${input.category}
Duration: ~${input.duration ?? 30} seconds
Loopable: ${input.loopable}

For each set, provide rich sonic descriptors that guide an AI audio model.

RESPOND ONLY with valid JSON:
{
  "options": [
    {
      "title": "Descriptive Sound Name",
      "vibe": "Ethereal & Spacious",
      "tags": "ambient, pad, reverb, slow attack, 60bpm, C minor, loopable, atmospheric"
    }
  ]
}`;

  try {
    type SFXOption = { title: string; vibe: string; tags: string };
    const parsed = await geminiJSON<{ options: SFXOption[] }>(prompt);
    const options = parsed.options ?? [];
    return options.slice(0, 3).map((o, i) => ({
      id: `sfx-${i}`,
      title: o.title,
      vibe: o.vibe,
      lyrics: "", // SFX has no lyrics
      tags: o.tags.split(",").map((t) => t.trim()),
    }));
  } catch (err) {
    console.error("[Gemini] generateSFXTags fallback:", err);
    return sfxFallback(input);
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function geminiHealthCheck(): Promise<{
  status: "ok" | "error" | "not_configured";
  message: string;
  latencyMs?: number;
}> {
  if (!GEMINI_API_KEY) {
    return { status: "not_configured", message: "GEMINI_API_KEY not set" };
  }
  if (DEV_MODE) {
    return { status: "ok", message: "dev mode — API calls bypassed" };
  }

  const t0 = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}&pageSize=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    const latencyMs = Date.now() - t0;
    return res.ok
      ? { status: "ok", message: "reachable", latencyMs }
      : { status: "error", message: `HTTP ${res.status}`, latencyMs };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    };
  }
}

// ─── Fallbacks ────────────────────────────────────────────────────────────────

function dedicateFallback(input: DedicationInput): LyricVariation[] {
  return [
    {
      id: "lyric-0",
      title: `${input.recipientName}'s Song`,
      vibe: "Warm & Heartfelt",
      lyrics: `[Verse]\nA ${input.mood} melody for ${input.recipientName}\n${input.message || "You mean the world to me"}\nEvery moment with you is a song\n\n[Chorus]\nThis is your damrooh, your melody\nA song that speaks what words can't say\nFrom my heart to yours today\n\n[Bridge]\nThrough every high and low\nYou're the one I want to know\n\n[Chorus]\nThis is your damrooh, your melody\nA song that speaks what words can't say`,
      tags: [`${input.genre}`, `${input.mood}`, "heartfelt", `${input.voice}`, "emotional", "100bpm"],
    },
    {
      id: "lyric-1",
      title: `Dear ${input.recipientName}`,
      vibe: "Soulful & Deep",
      lyrics: `[Verse]\nWords I never said out loud\nFeelings that were lost in the crowd\nBut today I'll let them flow\nLet this song help you know\n\n[Chorus]\nDear ${input.recipientName}, hear my heart\nThis melody is just the start\nOf everything I feel for you\nEvery word, every note is true\n\n[Bridge]\nNo distance or time can erase\nThe smile you bring to my face\n\n[Chorus]\nDear ${input.recipientName}, hear my heart\nThis melody is just the start`,
      tags: [`${input.genre}`, "soulful", "deep", `${input.voice}`, "acoustic", "90bpm"],
    },
    {
      id: "lyric-2",
      title: "Celebration",
      vibe: "Upbeat & Fun",
      lyrics: `[Verse]\nLight it up, it's time to shine\n${input.recipientName}, this moment's yours and mine\nA beat that makes you move\nWe're locked into the groove\n\n[Chorus]\nCelebrate, don't hesitate\nThis is your song, your time, your day\nLet the music take us away\nDancing till the break of day\n\n[Verse]\nEvery rhythm, every rhyme\nCrafted just for you this time\n\n[Chorus]\nCelebrate, don't hesitate\nThis is your song, your time, your day`,
      tags: [`${input.genre}`, "upbeat", "fun", `${input.voice}`, "energetic", "120bpm"],
    },
  ];
}

function studioFallback(input: StudioInput): LyricVariation[] {
  const base = input.prompt.slice(0, 60);
  return [
    {
      id: "lyric-0",
      title: `${base} — Version I`,
      vibe: "Dark & Cinematic",
      lyrics: `[Verse]\nShadows fall across the floor\nLooking for what came before\nEvery note a different door\n\n[Chorus]\nThis is the sound of something more\nEchoing through every corridor\n\n[Bridge]\nRise above the noise and find the light`,
      tags: ["cinematic", "strings", "90bpm", "minor", "emotional"],
    },
    {
      id: "lyric-1",
      title: `${base} — Version II`,
      vibe: "Bright & Uplifting",
      lyrics: `[Verse]\nMorning light on open fields\nAll the promise that it yields\nMoving forward as it heals\n\n[Chorus]\nUp and over, through the sky\nLet the melody run high\n\n[Bridge]\nSoar beyond what you thought you knew`,
      tags: ["uplifting", "piano", "120bpm", "major", "hopeful"],
    },
    {
      id: "lyric-2",
      title: `${base} — Version III`,
      vibe: "Minimal & Introspective",
      lyrics: `[Verse]\nIn the quiet of the room\nSpace between the light and gloom\nJust a heartbeat and a tune\n\n[Chorus]\nNothing extra, nothing more\nJust the feeling at the core\n\n[Bridge]\nStripped away to what is real`,
      tags: ["minimal", "ambient", "75bpm", "acoustic", "introspective"],
    },
  ];
}

function sfxFallback(input: SFXInput): LyricVariation[] {
  return [
    {
      id: "sfx-0",
      title: `${input.description} — A`,
      vibe: "Atmospheric",
      lyrics: "",
      tags: [input.category, "ambient", "loopable", "reverb", "60bpm"],
    },
    {
      id: "sfx-1",
      title: `${input.description} — B`,
      vibe: "Textured",
      lyrics: "",
      tags: [input.category, "textured", "pad", "slow-attack", "75bpm"],
    },
    {
      id: "sfx-2",
      title: `${input.description} — C`,
      vibe: "Dynamic",
      lyrics: "",
      tags: [input.category, "dynamic", "rhythmic", "punchy", "90bpm"],
    },
  ];
}
