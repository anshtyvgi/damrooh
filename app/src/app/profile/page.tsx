"use client";

import { useStore } from "@/stores/useStore";
import { usePlayerStore } from "@/stores/playerStore";
import { Play, Pause, Lock, Heart, Share2, Music, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const grads = ["from-rose-400 to-violet-500", "from-amber-400 to-rose-500", "from-violet-400 to-indigo-500", "from-emerald-400 to-teal-500", "from-pink-400 to-red-500"];

export default function ProfilePage() {
  const generations = useStore((s) => s.generations);
  const coins = useStore((s) => s.coins);
  const player = usePlayerStore();
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const grouped = useMemo(() => {
    const map = new Map<string, typeof generations>();
    generations.forEach((g) => {
      const key = g.input.recipientName || "Myself";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    });
    return map;
  }, [generations]);

  const totalSongs = generations.length;
  const totalPeople = grouped.size;
  const totalPlays = generations.length * 12; // mock
  const pinned = generations[0];

  const playTrack = (gen: typeof generations[0]) => {
    const track = gen.tracks.find((t) => t.status === "completed" && t.audioUrl);
    if (!track?.audioUrl) return;
    if (player.currentTrack?.id === track.id && player.isPlaying) { player.pause(); return; }
    if (player.currentTrack?.id === track.id) { player.resume(); return; }
    player.play({ id: track.id, title: `For ${gen.input.recipientName}`, artist: "Damrooh AI", audioUrl: track.audioUrl, genre: gen.input.genre, mood: gen.input.mood, gradient: grads[0] });
  };

  const isPlaying = (id: string) => player.currentTrack?.id === id && player.isPlaying;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8">

      {/* ═══ 1. HERO — Identity ═══ */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#FF4D8D] flex items-center justify-center text-2xl">
              🎧
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111]">You</h1>
              <p className="text-sm text-[#999]">Making songs for people I care about</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#FAFAFA] border border-[#EAEAEA]">
              <button onClick={() => setVisibility("public")} className={`px-2.5 py-1 rounded text-[10px] font-medium cursor-pointer transition-all ${visibility === "public" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}>Public</button>
              <button onClick={() => setVisibility("private")} className={`px-2.5 py-1 rounded text-[10px] font-medium cursor-pointer transition-all ${visibility === "private" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}>Private</button>
            </div>
            <Link href="/settings">
              <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#999] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
                <Settings className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-[#F0F0F0]">
          <div className="text-center">
            <p className="text-lg font-bold text-[#111]">{totalSongs}</p>
            <p className="text-[10px] text-[#999] uppercase tracking-wider">Songs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#111]">{totalPeople}</p>
            <p className="text-[10px] text-[#999] uppercase tracking-wider">People</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#111]">{totalPlays}</p>
            <p className="text-[10px] text-[#999] uppercase tracking-wider">Plays</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-bold text-[#111]">{coins}</span>
            <Link href="/coins" className="text-[10px] text-[#7B61FF] font-semibold hover:underline">Buy</Link>
          </div>
        </div>
      </div>

      {/* ═══ 2. PINNED SONG ═══ */}
      {pinned && (
        <div>
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Pinned</p>
          <div
            onClick={() => playTrack(pinned)}
            className={`relative rounded-2xl bg-gradient-to-br ${grads[0]} overflow-hidden cursor-pointer group`}
          >
            <div className="absolute inset-0 banner-overlay opacity-40" />
            <div className="relative z-10 p-6 flex items-end min-h-[140px]">
              <div className="flex-1">
                <p className="text-white/50 text-xs uppercase tracking-wider capitalize">{pinned.input.occasion}</p>
                <p className="text-white font-bold text-lg mt-1">For {pinned.input.recipientName}</p>
                <p className="text-white/40 text-xs mt-0.5 capitalize">{pinned.input.mood} · {pinned.input.genre}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                {pinned.tracks[0] && isPlaying(pinned.tracks[0].id)
                  ? <Pause className="w-5 h-5 text-white" />
                  : <Play className="w-5 h-5 text-white ml-0.5" />
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 3. GROUPED BY PERSON ═══ */}
      {Array.from(grouped.entries()).map(([name, gens], gi) => (
        <div key={name}>
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">
            For {name} {name === "Myself" ? "🌙" : gi === 0 ? "💛" : "🙏"}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {gens.map((gen, i) => {
              const firstTrack = gen.tracks.find((t) => t.status === "completed" && t.audioUrl);
              return (
                <div
                  key={gen.id}
                  onClick={() => playTrack(gen)}
                  className="shrink-0 w-[160px] bg-white rounded-xl border border-[#EAEAEA] overflow-hidden hover:shadow-md hover:border-[#CCC] transition-all cursor-pointer"
                >
                  <div className={`h-24 bg-gradient-to-br ${grads[i % grads.length]} relative flex items-center justify-center`}>
                    <div className="absolute inset-0 banner-overlay opacity-30" />
                    {firstTrack && isPlaying(firstTrack.id)
                      ? <Pause className="w-5 h-5 text-white relative z-10" />
                      : <Play className="w-5 h-5 text-white ml-0.5 relative z-10" />
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#111] truncate">For {gen.input.recipientName}</p>
                    <p className="text-[10px] text-[#BBB] capitalize">{gen.input.mood} · {gen.input.genre}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {gen.isPaid ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-green-200 text-green-600">Unlocked</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#EAEAEA] text-[#CCC] flex items-center gap-0.5"><Lock className="w-2 h-2" />Preview</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ═══ Empty state ═══ */}
      {generations.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-8 h-8 text-[#DDD] mx-auto mb-3" />
          <p className="text-sm text-[#999]">Create your first song to build your profile</p>
          <Link href="/create">
            <button className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] text-white text-sm font-semibold cursor-pointer">Create a song</button>
          </Link>
        </div>
      )}
    </div>
  );
}
