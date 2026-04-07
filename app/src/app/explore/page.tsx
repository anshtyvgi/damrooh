"use client";

import { Play, Pause, Heart, Search, ChevronRight } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { useState } from "react";

const featuredSongs = [
  { id: "fs1", title: "Tere Liye", artist: "ansh_creates", genre: "Bollywood", plays: "157K", gradient: "from-rose-400 to-violet-500", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "fs2", title: "Miles and Memories", artist: "priya_music", genre: "Acoustic", plays: "181K", gradient: "from-amber-400 to-rose-500", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "fs3", title: "Neon Dreams", artist: "raj_beats", genre: "Lo-fi", plays: "46K", gradient: "from-violet-400 to-indigo-500", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "fs4", title: "Apology Song", artist: "neha_vibes", genre: "Pop", plays: "92K", gradient: "from-sky-400 to-blue-500", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "fs5", title: "Farewell Note", artist: "karan_damrooh", genre: "Acoustic", plays: "168K", gradient: "from-emerald-400 to-teal-500", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "fs6", title: "Birthday Bash", artist: "simran_mel", genre: "Pop", plays: "303K", gradient: "from-pink-400 to-red-500", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "fs7", title: "Thank You Papa", artist: "dev_music", genre: "Classical", plays: "220K", gradient: "from-orange-400 to-amber-500", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
];

const creators = [
  { name: "ansh_creates", followers: "3.2K", gradient: "from-rose-300 to-pink-500" },
  { name: "priya_music", followers: "5.2K", gradient: "from-violet-300 to-indigo-500" },
  { name: "raj_beats", followers: "4.0K", gradient: "from-amber-300 to-orange-500" },
  { name: "neha_vibes", followers: "3.8K", gradient: "from-emerald-300 to-teal-500" },
  { name: "karan_damrooh", followers: "5.9K", gradient: "from-sky-300 to-blue-500" },
  { name: "simran_mel", followers: "2.4K", gradient: "from-pink-300 to-rose-500" },
];

const playlists = [
  { name: "Romantic", songs: 29, gradient: "from-pink-400 to-rose-600" },
  { name: "Bollywood", songs: 26, gradient: "from-amber-400 to-orange-600" },
  { name: "Lo-fi", songs: 23, gradient: "from-indigo-400 to-violet-600" },
  { name: "Acoustic", songs: 18, gradient: "from-emerald-400 to-teal-600" },
  { name: "Pop", songs: 31, gradient: "from-sky-400 to-blue-600" },
  { name: "Classical", songs: 15, gradient: "from-amber-300 to-yellow-600" },
  { name: "Hip-hop", songs: 22, gradient: "from-red-400 to-rose-600" },
];

const genres = ["Pop", "Bollywood", "Lo-fi", "Classical", "R&B", "Hip-hop", "Acoustic", "Rock", "Jazz", "Funk", "Indie", "Folk", "Electronic", "Ambient", "Devotional", "Punjabi", "Hinglish", "Trap", "Chillhop"];

const staffPicks = [
  { id: "sp1", title: "Memory", artist: "JoonOc", plays: "387K", likes: "10K", gradient: "from-violet-500 to-purple-700", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "sp2", title: "April's Gone", artist: "Thomas Otten", plays: "189K", likes: "3.0K", gradient: "from-sky-400 to-blue-600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "sp3", title: "Signal Fade", artist: "MakMuzical", plays: "143K", likes: "1.1K", gradient: "from-emerald-400 to-teal-600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "sp4", title: "Bittersweet Gravity", artist: "Wistaria", plays: "278K", likes: "6.0K", gradient: "from-rose-400 to-pink-600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "sp5", title: "Kundalini", artist: "TheloniousPunkd", plays: "241K", likes: "5.7K", gradient: "from-orange-400 to-red-600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "sp6", title: "Stuck In My Head", artist: "Kostaboda", plays: "113K", likes: "886", gradient: "from-indigo-400 to-violet-600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
];

export default function ExplorePage() {
  const player = usePlayerStore();
  const [search, setSearch] = useState("");

  const play = (t: { id: string; title: string; artist: string; audioUrl: string; gradient: string; genre?: string }) => {
    if (player.currentTrack?.id === t.id && player.isPlaying) { player.pause(); return; }
    if (player.currentTrack?.id === t.id) { player.resume(); return; }
    player.play({ id: t.id, title: t.title, artist: t.artist, audioUrl: t.audioUrl, genre: t.genre || "Pop", mood: "Chill", gradient: t.gradient });
  };

  const isPlaying = (id: string) => player.currentTrack?.id === id && player.isPlaying;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#EAEAEA]">
        <Search className="w-4 h-4 text-[#CCC]" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for songs, creators, or genres"
          className="flex-1 bg-transparent text-sm text-[#111] placeholder:text-[#CCC] focus:outline-none" />
      </div>

      {/* Featured Songs */}
      <div>
        <p className="text-sm font-bold text-[#111] mb-3">Featured Songs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {featuredSongs.map((s) => (
            <div key={s.id} onClick={() => play({ ...s, genre: s.genre })}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${player.currentTrack?.id === s.id ? "bg-white border border-[#111] shadow-sm" : "hover:bg-white"}`}>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center shrink-0`}>
                {isPlaying(s.id) ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111] truncate">{s.title}</p>
                <p className="text-[11px] text-[#999]">{s.genre} · @{s.artist}</p>
              </div>
              <span className="text-[11px] text-[#CCC] flex items-center gap-0.5 shrink-0"><Play className="w-2.5 h-2.5" />{s.plays}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Creators */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-[#111]">Featured Creators</p>
          <button className="text-xs text-[#7B61FF] font-semibold cursor-pointer hover:underline flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {creators.map((c) => (
            <div key={c.name} className="shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-lg font-bold group-hover:shadow-lg transition-shadow`}>
                {c.name[0].toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-[#111] truncate max-w-[80px]">@{c.name}</p>
              <p className="text-[10px] text-[#999]">{c.followers} followers</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Playlists */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-[#111]">Featured Playlists</p>
          <button className="text-xs text-[#7B61FF] font-semibold cursor-pointer hover:underline flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {playlists.map((p) => (
            <div key={p.name} className="shrink-0 cursor-pointer group">
              <div className={`w-36 h-36 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-end p-3 relative overflow-hidden group-hover:shadow-lg transition-shadow`}>
                <p className="text-white font-bold text-lg relative z-10">{p.name}</p>
                <div className="absolute inset-0 banner-overlay opacity-30" />
              </div>
              <p className="text-xs text-[#111] font-semibold mt-2">Best of {p.name}</p>
              <p className="text-[10px] text-[#999]">{p.songs} songs</p>
            </div>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div>
        <p className="text-sm font-bold text-[#111] mb-3">Genres</p>
        <div className="flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <button key={g} className="px-3 py-1.5 rounded-lg bg-white border border-[#EAEAEA] text-xs text-[#666] hover:border-[#CCC] hover:text-[#111] transition-colors cursor-pointer">{g}</button>
          ))}
        </div>
      </div>

      {/* Staff Picks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-[#111]">Staff Picks</p>
          <button className="text-xs text-[#7B61FF] font-semibold cursor-pointer hover:underline flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {staffPicks.map((s) => (
            <div key={s.id} onClick={() => play({ ...s })} className="shrink-0 cursor-pointer group w-[180px]">
              <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center relative overflow-hidden group-hover:shadow-lg transition-shadow`}>
                <div className="absolute inset-0 banner-overlay opacity-30" />
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPlaying(s.id) ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-2 text-white/70 text-[10px]">
                  <span className="flex items-center gap-0.5"><Play className="w-2.5 h-2.5" />{s.plays}</span>
                  <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{s.likes}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-[#111] mt-2 truncate">{s.title}</p>
              <p className="text-[11px] text-[#999]">@{s.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
