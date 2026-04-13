/**
 * GET /api/community/feed
 *
 * Returns public songs for the community feed.
 *
 * Query params:
 *   ?limit=20      — items per page (default 20, max 100)
 *   ?offset=0      — pagination offset
 *   ?mode=studio   — filter by GenerationMode
 *   ?model=lyria   — filter by MusicModel
 *
 * Response:
 *   { songs: FeedItem[], total: number, hasMore: boolean }
 *
 * Seed data is injected on first call (dev/demo mode) so the feed
 * is never empty.
 */

import { NextRequest, NextResponse } from "next/server";
import { Songs, Sessions } from "@/lib/db";
import type { GenerationMode, MusicModel } from "@/types";

// ─── Seed ─────────────────────────────────────────────────────────────────────

let seeded = false;

function seedFeedIfEmpty() {
  if (seeded || Songs.count() > 0) {
    seeded = true;
    return;
  }
  seeded = true;

  const now = new Date();
  const seedSongs = [
    {
      id: "seed-1",
      sessionId: "seed-session-1",
      userId: "seed-user-1",
      title: "Teri Yaadein",
      mode: "dedicate" as GenerationMode,
      model: "ace-1.5" as MusicModel,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverUrl: "https://placehold.co/512x512/ec4899/ffffff?text=Teri+Yaadein",
      duration: 60,
      lyrics: "[Verse]\nTeri yaadein aati hain...\n\n[Chorus]\nYe dil kehta hai teri baat...",
      tags: ["bollywood", "romantic", "female", "90bpm"],
      isPublic: true,
      plays: 1247,
      shares: 89,
    },
    {
      id: "seed-2",
      sessionId: "seed-session-2",
      userId: "seed-user-2",
      title: "Midnight Drive",
      mode: "studio" as GenerationMode,
      model: "lyria" as MusicModel,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      coverUrl: "https://placehold.co/512x512/8b5cf6/ffffff?text=Midnight+Drive",
      duration: 90,
      lyrics: "[Verse]\nNeon lights on empty streets...\n\n[Chorus]\nDriving through the night...",
      tags: ["lofi", "nostalgic", "piano", "75bpm"],
      isPublic: true,
      plays: 832,
      shares: 43,
    },
    {
      id: "seed-3",
      sessionId: "seed-session-3",
      userId: "seed-user-3",
      title: "Birthday Bash",
      mode: "dedicate" as GenerationMode,
      model: "elevenlabs" as MusicModel,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      coverUrl: "https://placehold.co/512x512/f59e0b/ffffff?text=Birthday+Bash",
      duration: 60,
      lyrics: "[Verse]\nToday is your special day...\n\n[Chorus]\nCelebrate, don't hesitate...",
      tags: ["pop", "happy", "upbeat", "120bpm"],
      isPublic: true,
      plays: 2103,
      shares: 156,
    },
    {
      id: "seed-4",
      sessionId: "seed-session-4",
      userId: "seed-user-1",
      title: "Forest Rain Loop",
      mode: "sfx" as GenerationMode,
      model: "ace-1.5" as MusicModel,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      coverUrl: "https://placehold.co/512x512/06b6d4/ffffff?text=Forest+Rain",
      duration: 30,
      lyrics: "",
      tags: ["nature", "ambient", "loopable", "rain", "60bpm"],
      isPublic: true,
      plays: 417,
      shares: 12,
    },
    {
      id: "seed-5",
      sessionId: "seed-session-5",
      userId: "seed-user-2",
      title: "Dil Ki Baat",
      mode: "dedicate" as GenerationMode,
      model: "ace-1.5" as MusicModel,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      coverUrl: "https://placehold.co/512x512/ef4444/ffffff?text=Dil+Ki+Baat",
      duration: 60,
      lyrics: "[Verse]\nDil ki baat keh deta hoon...",
      tags: ["hindi", "love", "acoustic", "male", "95bpm"],
      isPublic: true,
      plays: 689,
      shares: 34,
    },
  ];

  for (const song of seedSongs) {
    Songs.create(song);
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  seedFeedIfEmpty();

  const { searchParams } = new URL(request.url);

  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") ?? "20", 10), 1),
    100
  );
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);
  const modeFilter = searchParams.get("mode") as GenerationMode | null;
  const modelFilter = searchParams.get("model") as MusicModel | null;

  // Fetch public songs
  const allPublic = Songs.list({
    isPublic: true,
    mode: modeFilter ?? undefined,
    limit: undefined, // fetch all then filter by model
  });

  const filtered = modelFilter
    ? allPublic.filter((s) => s.model === modelFilter)
    : allPublic;

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);

  const songs = page.map((s) => ({
    id: s.id,
    sessionId: s.sessionId,
    title: s.title,
    mode: s.mode,
    model: s.model,
    audioUrl: s.audioUrl,
    coverUrl: s.coverUrl ?? null,
    duration: s.duration ?? null,
    tags: s.tags,
    plays: s.plays,
    shares: s.shares,
    createdAt: s.createdAt.toISOString(),
    // Enrich with session data if available
    session: (() => {
      const sess = Sessions.findById(s.sessionId);
      if (!sess) return null;
      return {
        mode: sess.mode,
        modelSelection: sess.modelSelection,
      };
    })(),
  }));

  return NextResponse.json({
    songs,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  });
}
