import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ACE_API_KEY = process.env.ACE_API_KEY!;
const DEV_MODE = process.env.DEV_MODE === "true";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const ACE_URL = "https://api.wavespeed.ai/api/v3/wavespeed-ai/ace-step-1.5";

declare global {
  var generationStore: Map<string, GenerationState>;
}
if (!global.generationStore) {
  global.generationStore = new Map();
}

interface TrackState {
  id: string;
  aceTaskId: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  audioUrl: string | null;
  lyrics: string;
  title: string;
  vibe: string;
}

interface GenerationState {
  id: string;
  status: "processing" | "completed" | "failed";
  tags: string[];
  tracks: TrackState[];
  posterUrl: string | null;
  createdAt: string;
}

// Step 1: Generate 3 different lyrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientName, occasion, relationship, message, mood, genre, language, voice, action } = body;

    // Action: generate-lyrics → returns 3 lyric options
    // Action: generate-music → takes selected lyrics and fires ACE
    if (action === "generate-music") {
      return handleGenerateMusic(body);
    }

    if (!recipientName || !occasion || !mood || !genre) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate 3 different lyrics via Gemini
    const lyricsOptions = await generate3Lyrics({
      recipientName, occasion, relationship, message, mood, genre, language, voice,
    });

    return NextResponse.json({
      status: "lyrics-ready",
      options: lyricsOptions,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

// Step 2: Generate music from selected lyrics
async function handleGenerateMusic(body: {
  lyrics: string[];
  tags: string[];
  titles: string[];
  vibes: string[];
  recipientName: string;
  occasion: string;
  mood: string;
  genre: string;
}) {
  const generationId = crypto.randomUUID();
  const { lyrics, tags, titles, vibes } = body;

  if (DEV_MODE) {
    const state: GenerationState = {
      id: generationId,
      status: "processing",
      tags,
      tracks: lyrics.map((lyric, i) => ({
        id: `${generationId}-t${i}`,
        aceTaskId: `dev-${i}`,
        status: "processing" as const,
        audioUrl: null,
        lyrics: lyric,
        title: titles[i] || `Track ${i + 1}`,
        vibe: vibes[i] || "",
      })),
      posterUrl: null,
      createdAt: new Date().toISOString(),
    };
    global.generationStore.set(generationId, state);

    setTimeout(() => {
      const s = global.generationStore.get(generationId);
      if (s) {
        s.tracks[0] = { ...s.tracks[0], status: "completed", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" };
        global.generationStore.set(generationId, s);
      }
    }, 5000);
    setTimeout(() => {
      const s = global.generationStore.get(generationId);
      if (s) {
        s.tracks[1] = { ...s.tracks[1], status: "completed", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" };
        global.generationStore.set(generationId, s);
      }
    }, 9000);
    setTimeout(() => {
      const s = global.generationStore.get(generationId);
      if (s) {
        s.tracks[2] = { ...s.tracks[2], status: "completed", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" };
        s.status = "completed";
        global.generationStore.set(generationId, s);
      }
    }, 13000);

    return NextResponse.json({
      id: generationId,
      status: "processing",
      tracks: state.tracks.map((t) => ({ id: t.id, status: t.status, title: t.title, lyrics: t.lyrics })),
    });
  }

  // Real ACE requests — one per lyric variant
  const trackResults = await Promise.allSettled(
    lyrics.map((lyric) =>
      fireACERequest({ lyrics: lyric, tags: tags.join(", "), duration: 60 })
    )
  );

  const tracks: TrackState[] = trackResults.map((result, i) => ({
    id: `${generationId}-t${i}`,
    aceTaskId: result.status === "fulfilled" ? result.value.taskId : null,
    status: result.status === "fulfilled" ? ("processing" as const) : ("failed" as const),
    audioUrl: null,
    lyrics: lyrics[i],
    title: titles[i] || `Track ${i + 1}`,
    vibe: vibes[i] || "",
  }));

  const state: GenerationState = {
    id: generationId,
    status: "processing",
    tags,
    tracks,
    posterUrl: null,
    createdAt: new Date().toISOString(),
  };

  global.generationStore.set(generationId, state);

  return NextResponse.json({
    id: generationId,
    status: "processing",
    tracks: tracks.map((t) => ({ id: t.id, status: t.status, title: t.title, lyrics: t.lyrics })),
  });
}

// --- Gemini: Generate 3 different lyric variations ---

interface PromptInput {
  recipientName: string;
  occasion: string;
  relationship: string;
  message: string;
  mood: string;
  genre: string;
  language: string;
  voice: string;
}

async function generate3Lyrics(input: PromptInput) {
  const systemPrompt = `You are a world-class songwriter. Generate 3 COMPLETELY DIFFERENT song lyric variations.

Each variation should have a different:
- Emotional angle / storytelling approach
- Song title
- Vibe description (2-3 words)

RULES:
- Language: ${input.language}
- Mood: ${input.mood}, Genre: ${input.genre}, Voice: ${input.voice}
- MUST include [Verse], [Chorus], [Bridge] section markers
- Make it personal for "${input.recipientName}" and "${input.occasion}"
- Each lyric: 150-250 words
- Tags: comma-separated music style descriptors

RESPOND IN JSON:
{
  "options": [
    {
      "title": "Song Title 1",
      "vibe": "Upbeat & Warm",
      "lyrics": "[Verse]\\nLyrics here...\\n\\n[Chorus]\\nChorus here...",
      "tags": "pop, upbeat, warm, piano, 120bpm"
    },
    {
      "title": "Song Title 2",
      "vibe": "Soulful & Deep",
      "lyrics": "[Verse]\\nDifferent lyrics...\\n\\n[Chorus]\\nDifferent chorus...",
      "tags": "soul, deep, guitar, emotional, 90bpm"
    },
    {
      "title": "Song Title 3",
      "vibe": "Playful & Fun",
      "lyrics": "[Verse]\\nAnother approach...\\n\\n[Chorus]\\nAnother chorus...",
      "tags": "pop, playful, synth, groovy, 110bpm"
    }
  ]
}`;

  const userPrompt = `Create 3 song variations for ${input.recipientName}.
Occasion: ${input.occasion}
Relationship: ${input.relationship}
Language: ${input.language}
Voice: ${input.voice}
Mood: ${input.mood}
Genre: ${input.genre}
${input.message ? `Weave in this message: "${input.message}"` : "Write something heartfelt."}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", response.status, errText);
      throw new Error("Gemini failed");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No content");

    const parsed = JSON.parse(text);
    return parsed.options || parsed;
  } catch (error) {
    console.error("Gemini fallback:", error);
    // Fallback — 3 basic variations
    return [
      {
        title: `${input.recipientName}'s Song`,
        vibe: "Warm & Heartfelt",
        lyrics: `[Verse]\nA ${input.mood} melody for ${input.recipientName}\n${input.message || "You mean the world to me"}\nEvery moment is a song with you\n\n[Chorus]\nThis is your damrooh, your melody\nA song that speaks what words can't say\nFrom my heart to yours today\n\n[Bridge]\nThrough every high and low\nYou're the one I want to know\n\n[Chorus]\nThis is your damrooh, your melody\nA song that speaks what words can't say`,
        tags: `${input.genre}, ${input.mood}, heartfelt, ${input.voice}, emotional, 100bpm`,
      },
      {
        title: `Dear ${input.recipientName}`,
        vibe: "Soulful & Deep",
        lyrics: `[Verse]\nWords I never said out loud\nFeelings lost within the crowd\nBut today I'll let them flow\nLet this song help you know\n\n[Chorus]\nDear ${input.recipientName}, hear my heart\nThis melody is just the start\nOf everything I feel for you\nEvery word, every note is true\n\n[Bridge]\nNo distance, no time can erase\nThe smile you bring to my face\n\n[Chorus]\nDear ${input.recipientName}, hear my heart\nThis melody is just the start`,
        tags: `${input.genre}, soulful, deep, ${input.voice}, acoustic, 90bpm`,
      },
      {
        title: `Celebration`,
        vibe: "Upbeat & Fun",
        lyrics: `[Verse]\nLight it up, it's time to shine\n${input.recipientName}, this moment's mine to give to you\nA beat that makes you move\n\n[Chorus]\nCelebrate, don't hesitate\nThis is your song, your time, your day\nLet the music take us away\nDancing till the break of day\n\n[Verse]\nEvery rhythm, every rhyme\nCrafted just for you this time\n\n[Chorus]\nCelebrate, don't hesitate\nThis is your song, your time, your day`,
        tags: `${input.genre}, upbeat, fun, ${input.voice}, energetic, 120bpm`,
      },
    ];
  }
}

// --- ACE 1.5 ---

async function fireACERequest(input: { lyrics: string; tags: string; duration: number }): Promise<{ taskId: string }> {
  const response = await fetch(ACE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACE_API_KEY}`,
    },
    body: JSON.stringify({ lyrics: input.lyrics, tags: input.tags, duration: input.duration, seed: -1 }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("ACE error:", response.status, errText);
    throw new Error(`ACE error: ${response.status}`);
  }

  const data = await response.json();
  console.log("ACE response:", JSON.stringify(data).slice(0, 300));
  if (!data.id) throw new Error("No task ID from ACE");
  return { taskId: data.id };
}
