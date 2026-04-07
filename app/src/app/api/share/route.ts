import { NextRequest, NextResponse } from "next/server";

// In-memory store for shared dedications (mirrors generationStore pattern)
declare global {
  var sharedStore: Map<string, SharedDedication>;
}
if (!global.sharedStore) {
  global.sharedStore = new Map();
}

interface SharedDedication {
  id: string;
  recipientName: string;
  occasion: string;
  mood: string;
  genre: string;
  message: string;
  creatorName: string;
  posterUrl: string | null;
  audioUrl: string | null;
  lyrics: string | null;
  isPaid: boolean;
  createdAt: string;
}

// POST /api/share
// Creates a shareable link for a dedication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, recipientName, occasion, mood, genre, message, creatorName, posterUrl, audioUrl, lyrics } = body;

    if (!generationId) {
      return NextResponse.json({ error: "Missing generation ID" }, { status: 400 });
    }

    // Also check the generation store for audio data
    const generation = global.generationStore?.get(generationId);
    const firstCompletedTrack = generation?.tracks.find((t) => t.status === "completed");

    const shared: SharedDedication = {
      id: generationId,
      recipientName: recipientName || generation?.tracks[0]?.title || "Someone special",
      occasion: occasion || "love",
      mood: mood || "romantic",
      genre: genre || "pop",
      message: message || "",
      creatorName: creatorName || "A friend",
      posterUrl: posterUrl || generation?.posterUrl || null,
      audioUrl: audioUrl || firstCompletedTrack?.audioUrl || null,
      lyrics: lyrics || generation?.tracks.map((t) => t.lyrics).filter(Boolean).join("\n\n---\n\n") || null,
      isPaid: true,
      createdAt: new Date().toISOString(),
    };

    global.sharedStore.set(generationId, shared);

    const shareUrl = `/d/${generationId}`;

    return NextResponse.json({
      shareUrl,
      generationId,
      shared: true,
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

// GET /api/share?id={generationId}
// Fetches public dedication data for the share page
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  // Check shared store first
  const shared = global.sharedStore?.get(id);
  if (shared) {
    return NextResponse.json(shared);
  }

  // Fall back to generation store for preview data
  const generation = global.generationStore?.get(id);
  if (generation) {
    const firstCompletedTrack = generation.tracks.find((t) => t.status === "completed");
    return NextResponse.json({
      id,
      recipientName: generation.tracks[0]?.title || "Someone special",
      occasion: "love",
      mood: "romantic",
      genre: "pop",
      message: "",
      creatorName: "A friend",
      posterUrl: generation.posterUrl,
      audioUrl: firstCompletedTrack?.audioUrl || null,
      lyrics: generation.tracks.map((t) => t.lyrics).filter(Boolean).join("\n\n---\n\n"),
      isPaid: false,
      createdAt: generation.createdAt,
    });
  }

  // Not found — return mock data for demo
  return NextResponse.json({
    id,
    recipientName: "Someone special",
    occasion: "love",
    mood: "romantic",
    genre: "pop",
    message: "You mean the world to me",
    creatorName: "A friend",
    posterUrl: null,
    audioUrl: null,
    lyrics: null,
    isPaid: false,
    createdAt: new Date().toISOString(),
  });
}
