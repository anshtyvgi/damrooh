"use client";

import { useStore } from "@/stores/useStore";
import { usePlayerStore } from "@/stores/playerStore";
import { Play, Pause, Heart, ThumbsDown, Share2, Music, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const grads = ["from-rose-400 to-violet-500", "from-amber-400 to-rose-500", "from-violet-400 to-indigo-500", "from-emerald-400 to-teal-500", "from-pink-400 to-red-500"];

type Tab = "songs" | "liked" | "shared";
type Sort = "newest" | "oldest";

export default function LibraryPage() {
  const generations = useStore((s) => s.generations);
  const player = usePlayerStore();
  const [tab, setTab] = useState<Tab>("songs");
  const [sort, setSort] = useState<Sort>("newest");
  const [search, setSearch] = useState("");

  const filtered = generations
    .filter((g) => {
      if (tab === "liked") return g.isPaid; // mock: treat paid as liked
      if (tab === "shared") return g.isShared;
      return true;
    })
    .filter((g) => !search || g.input.recipientName.toLowerCase().includes(search.toLowerCase()));

  const playTrack = (trackId: string, audioUrl: string, title: string, genre: string, mood: string, gradient: string) => {
    if (player.currentTrack?.id === trackId && player.isPlaying) { player.pause(); return; }
    if (player.currentTrack?.id === trackId) { player.resume(); return; }
    player.play({ id: trackId, title, artist: "Damrooh AI", audioUrl, genre, mood, gradient });
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: "songs", label: "Songs" },
    { value: "liked", label: "Liked" },
    { value: "shared", label: "Shared" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#111]">Library</h1>
        <Link href="/create">
          <button className="px-4 py-2 rounded-xl bg-[#111] text-white text-xs font-semibold cursor-pointer hover:bg-[#333] transition-colors">+ Create</button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-4 border-b border-[#EAEAEA]">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`pb-2.5 text-sm font-medium cursor-pointer transition-colors border-b-2 ${tab === t.value ? "text-[#111] border-[#111]" : "text-[#999] border-transparent hover:text-[#111]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EAEAEA]">
          <Search className="w-4 h-4 text-[#CCC]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search"
            className="flex-1 bg-transparent text-sm text-[#111] placeholder:text-[#CCC] focus:outline-none" />
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white border border-[#EAEAEA]">
          <button onClick={() => setSort("newest")} className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium cursor-pointer ${sort === "newest" ? "bg-[#F5F5F5] text-[#111]" : "text-[#999]"}`}>Newest</button>
          <button onClick={() => setSort("oldest")} className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium cursor-pointer ${sort === "oldest" ? "bg-[#F5F5F5] text-[#111]" : "text-[#999]"}`}>Oldest</button>
        </div>
      </div>

      {/* Song list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-12 text-center">
          <Music className="w-6 h-6 text-[#DDD] mx-auto mb-2" />
          <p className="text-sm text-[#999]">{tab === "songs" ? "No songs yet" : `No ${tab} songs`}</p>
          <p className="text-xs text-[#CCC] mt-1">Create your first song to see it here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
          {filtered.map((gen) =>
            gen.tracks.map((track, i) => {
              const isActive = player.currentTrack?.id === track.id;
              const isThisPlaying = isActive && player.isPlaying;
              const grad = grads[i % grads.length];
              return (
                <div key={track.id}
                  onClick={() => track.audioUrl && playTrack(track.id, track.audioUrl, `For ${gen.input.recipientName}`, gen.input.genre, gen.input.mood, grad)}
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${isActive ? "bg-[#FAFAFA]" : "hover:bg-[#FAFAFA]"}`}>
                  {/* Poster */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 relative`}>
                    {isThisPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#111] truncate">For {gen.input.recipientName}</p>
                      {!gen.isPaid && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#EAEAEA] text-[#CCC]">Preview</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#999] capitalize">{gen.input.genre} · {gen.input.mood}</p>
                    {isActive && (
                      <div className="mt-1 h-[3px] rounded-full bg-[#F0F0F0] w-full max-w-[200px]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] transition-all" style={{ width: `${player.progress}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#CCC] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
                      <Heart className="w-3 h-3" />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#CCC] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#CCC] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
                      <Share2 className="w-3 h-3" />
                    </button>
                    {!gen.isPaid && (
                      <button className="px-2.5 py-1 rounded-lg border border-[#EAEAEA] text-[10px] font-semibold text-[#888] hover:border-[#CCC] transition-colors cursor-pointer">
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
