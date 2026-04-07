"use client";

import Link from "next/link";
import { useStore } from "@/stores/useStore";
import { Play, Heart, Share2, Download, Pause, Sparkles, ThumbsDown, Lock, Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { generateLyrics, generateMusic, startPolling } from "@/lib/api";
import { COIN_COSTS, GENRES, LANGUAGES } from "@/types";
import type { LyricOption } from "@/lib/api";
import type { VoiceType, Mood, Genre, Language } from "@/types";
import { usePlayerStore } from "@/stores/playerStore";

type Mode = "simple" | "advanced";

const voices: { value: VoiceType; label: string }[] = [
  { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "duet", label: "Duet" },
];

const randomPrompts = [
  "A love song for someone who makes ordinary days feel magical...",
  "The feeling when it rains and you miss someone far away...",
  "A birthday anthem that makes them feel like a superstar...",
  "An apology that says more than words ever could...",
];

const grads = ["from-rose-400 to-violet-500", "from-amber-400 to-rose-500", "from-violet-400 to-indigo-500"];

export default function CreatePage() {
  const store = useStore();
  const player = usePlayerStore();
  const { dedication, coins, isFirstTime, currentGeneration, generationStatus, generations } = store;

  const [mode, setMode] = useState<Mode>("simple");
  const [nameInput, setNameInput] = useState("");
  const [selectedMood, setSelectedMood] = useState<Mood>("romantic");
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState<Genre>("bollywood");
  const [language, setLanguage] = useState<Language>("hinglish");
  const [voice, setVoice] = useState<VoiceType>("female");
  const [lyricsOptions, setLyricsOptions] = useState<LyricOption[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState<"newest" | "liked">("newest");
  const stopRef = useRef<(() => void) | null>(null);

  const cost = isFirstTime ? 0 : COIN_COSTS.generate;

  // Filter workspace generations
  const filteredGens = generations.filter((g) =>
    !workspaceSearch || g.input.recipientName.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  const handleCreate = async () => {
    setIsGenerating(true);
    store.setRecipientName(nameInput || "Someone special");
    store.setMood(selectedMood);
    const input = { ...dedication, recipientName: nameInput || "Someone special", mood: selectedMood, genre, language, voice, message: mode === "advanced" ? prompt : "" };
    try {
      const result = await generateLyrics(input);
      setLyricsOptions(result.options);
      // Auto-generate music with all 3 lyrics
      if (!isFirstTime && !store.deductCoins(cost)) { setIsGenerating(false); return; }
      store.setGenerationStatus("generating-tracks");
      const musicResult = await generateMusic({
        lyrics: result.options.map((o) => o.lyrics), tags: result.options.map((o) => o.tags),
        titles: result.options.map((o) => o.title), vibes: result.options.map((o) => o.vibe),
        recipientName: nameInput || "Someone special", occasion: dedication.occasion, mood: selectedMood, genre,
      });
      const gen = {
        id: musicResult.id, input: { ...dedication, recipientName: nameInput || "Someone special", mood: selectedMood, genre, language, voice },
        status: "generating-tracks" as const,
        tracks: musicResult.tracks.map((t) => ({ id: t.id, status: t.status as "pending" | "processing" | "completed" | "failed" })),
        lyrics: result.options.map((o) => `${o.title}\n\n${o.lyrics}`).join("\n\n---\n\n"),
        createdAt: new Date().toISOString(), isPaid: false, isShared: false,
      };
      store.setCurrentGeneration(gen);
      stopRef.current = startPolling(musicResult.id, (data) => {
        const done = data.status === "completed";
        const updated = { ...gen, status: done ? "completed" as const : "generating-tracks" as const, posterUrl: data.posterUrl || undefined, tracks: data.tracks.map((t) => ({ id: t.id, status: t.status, audioUrl: t.audioUrl || undefined })) };
        store.setCurrentGeneration(updated);
        if (done) { store.setGenerationStatus("completed"); store.addGeneration({ ...updated, status: "completed" }); setIsGenerating(false); }
      }, () => { store.setGenerationStatus("failed"); setIsGenerating(false); if (!isFirstTime) store.addCoins(cost); }, 5000);
    } catch { setIsGenerating(false); }
  };

  const playTrack = (trackId: string, audioUrl: string, title: string, g: string, m: string, gradient: string) => {
    if (player.currentTrack?.id === trackId && player.isPlaying) { player.pause(); return; }
    if (player.currentTrack?.id === trackId) { player.resume(); return; }
    player.play({ id: trackId, title, artist: "Damrooh AI", audioUrl, genre: g, mood: m, gradient });
  };

  return (
    <div className="flex h-[calc(100vh-56px)] lg:h-screen">
      {/* ═══ LEFT — Controls ═══ */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-r border-[#EAEAEA] bg-white overflow-y-auto">
        {/* Mode + coins */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F5F5F5]">
            <button onClick={() => setMode("simple")} className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${mode === "simple" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}>Simple</button>
            <button onClick={() => setMode("advanced")} className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${mode === "advanced" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}>Advanced</button>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span>🪙</span><span className="font-bold text-[#111]">{coins}</span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {mode === "simple" ? (
            <>
              {/* Song description */}
              <div>
                <label className="text-xs font-semibold text-[#666] mb-1.5 block">Song Description</label>
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleCreate()}
                  placeholder="e.g. Birthday song for Priya, Love song for Bro..."
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] text-[#111] text-sm placeholder:text-[#CCC] focus:outline-none focus:ring-2 focus:ring-[#111]/10 border border-[#EAEAEA]" />
              </div>
              {/* Mood */}
              <div>
                <label className="text-xs font-semibold text-[#666] mb-1.5 block">Mood</label>
                <div className="flex flex-wrap gap-1.5">
                  {(["romantic", "happy", "nostalgic", "energetic", "savage", "playful", "bittersweet"] as Mood[]).map((m) => (
                    <button key={m} onClick={() => { setSelectedMood(m); store.setMood(m); }}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize cursor-pointer transition-all ${selectedMood === m ? "bg-[#111] text-white font-semibold" : "bg-[#FAFAFA] text-[#888] border border-[#EAEAEA]"}`}>{m}</button>
                  ))}
                </div>
              </div>
              {/* Style tags */}
              <div>
                <label className="text-xs font-semibold text-[#666] mb-1.5 block">Style</label>
                <div className="flex flex-wrap gap-1">
                  {GENRES.map((g) => (
                    <button key={g.value} onClick={() => setGenre(g.value)}
                      className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer transition-all ${genre === g.value ? "bg-[#111] text-white" : "bg-[#FAFAFA] text-[#888] border border-[#EAEAEA]"}`}>{g.label}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Advanced: Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#666]">Song Description</label>
                  <button onClick={() => setPrompt(randomPrompts[Math.floor(Math.random() * randomPrompts.length)])}
                    className="text-[10px] text-[#7B61FF] font-semibold cursor-pointer hover:underline">Inspire me</button>
                </div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the song you want to make..."
                  rows={3} className="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] text-[#111] text-sm placeholder:text-[#CCC] focus:outline-none focus:ring-2 focus:ring-[#111]/10 border border-[#EAEAEA] resize-none" />
              </div>
              {/* Lyrics */}
              <div>
                <label className="text-xs font-semibold text-[#666] mb-1.5 block">Lyrics (optional)</label>
                <textarea placeholder="Write lyrics or leave blank for AI to generate..." rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] text-[#111] text-sm placeholder:text-[#CCC] focus:outline-none focus:ring-2 focus:ring-[#111]/10 border border-[#EAEAEA] resize-none" />
              </div>
              {/* Styles */}
              <div>
                <label className="text-xs font-semibold text-[#666] mb-1.5 block">Styles</label>
                <div className="flex flex-wrap gap-1">
                  {GENRES.map((g) => (<button key={g.value} onClick={() => setGenre(g.value)} className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer ${genre === g.value ? "bg-[#111] text-white" : "bg-[#FAFAFA] text-[#888] border border-[#EAEAEA]"}`}>{g.label}</button>))}
                  <span className="w-px h-5 bg-[#EAEAEA] mx-0.5 self-center" />
                  {LANGUAGES.map((l) => (<button key={l.value} onClick={() => setLanguage(l.value)} className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer ${language === l.value ? "bg-[#111] text-white" : "bg-[#FAFAFA] text-[#888] border border-[#EAEAEA]"}`}>{l.label}</button>))}
                  <span className="w-px h-5 bg-[#EAEAEA] mx-0.5 self-center" />
                  {voices.map((v) => (<button key={v.value} onClick={() => setVoice(v.value)} className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer ${voice === v.value ? "bg-[#111] text-white" : "bg-[#FAFAFA] text-[#888] border border-[#EAEAEA]"}`}>{v.label}</button>))}
                </div>
              </div>
              {/* For */}
              <div>
                <label className="text-xs font-semibold text-[#666] mb-1.5 block">Dedicate to (optional)</label>
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Name..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] text-[#111] text-sm placeholder:text-[#CCC] focus:outline-none border border-[#EAEAEA]" />
              </div>
            </>
          )}
        </div>

        {/* Create button — sticky bottom */}
        <div className="sticky bottom-0 p-5 pt-3 bg-white border-t border-[#F0F0F0]">
          <button onClick={handleCreate} disabled={isGenerating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] text-white font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* ═══ RIGHT — Workspace ═══ */}
      <div className="hidden lg:flex flex-1 flex-col bg-[#F7F7F8] overflow-hidden">
        {/* Workspace header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EAEAEA] bg-white">
          <p className="text-sm font-semibold text-[#111]">My Workspace</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA]">
              <Search className="w-3.5 h-3.5 text-[#CCC]" />
              <input type="text" value={workspaceSearch} onChange={(e) => setWorkspaceSearch(e.target.value)}
                placeholder="Search" className="bg-transparent text-xs text-[#111] placeholder:text-[#CCC] focus:outline-none w-24" />
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#FAFAFA] border border-[#EAEAEA]">
              <button onClick={() => setWorkspaceFilter("newest")} className={`px-2 py-1 rounded text-[10px] font-medium cursor-pointer ${workspaceFilter === "newest" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}>Newest</button>
              <button onClick={() => setWorkspaceFilter("liked")} className={`px-2 py-1 rounded text-[10px] font-medium cursor-pointer ${workspaceFilter === "liked" ? "bg-white text-[#111] shadow-sm" : "text-[#999]"}`}>Liked</button>
            </div>
          </div>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto">
          {/* Currently generating */}
          {isGenerating && currentGeneration && (
            <div className="border-b border-[#EAEAEA]">
              {currentGeneration.tracks.map((track, i) => (
                <div key={track.id} className="flex items-center gap-4 px-5 py-3 border-b border-[#F0F0F0] bg-white">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${grads[i % 3]} flex items-center justify-center shrink-0 ${track.status === "processing" ? "animate-pulse" : ""}`}>
                    {track.status === "completed" ? <Play className="w-4 h-4 text-white ml-0.5" /> : <div className="w-3 h-3 rounded-full border-2 border-white/50 border-t-white animate-spin" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {track.status === "completed" ? (
                      <>
                        <p className="text-sm font-semibold text-[#111]">For {currentGeneration.input.recipientName}</p>
                        <p className="text-[11px] text-[#999] capitalize">{currentGeneration.input.genre} · {currentGeneration.input.mood}</p>
                      </>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="h-3 w-2/3 bg-[#F0F0F0] rounded animate-shimmer" />
                        <div className="h-2.5 w-1/3 bg-[#F5F5F5] rounded animate-shimmer" style={{ animationDelay: "0.1s" }} />
                      </div>
                    )}
                  </div>
                  {track.status === "completed" && track.audioUrl && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => playTrack(track.id, track.audioUrl!, `Track ${i+1}`, currentGeneration.input.genre, currentGeneration.input.mood, grads[i%3])}
                        className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#888] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
                        <Heart className="w-3 h-3" />
                      </button>
                      <button className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#888] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer">
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Past generations */}
          {filteredGens.map((gen) => (
            gen.tracks.map((track, i) => {
              const isActive = player.currentTrack?.id === track.id;
              const isThisPlaying = isActive && player.isPlaying;
              return (
                <div key={track.id} className={`flex items-center gap-4 px-5 py-3 border-b border-[#F0F0F0] hover:bg-white transition-colors cursor-pointer ${isActive ? "bg-white" : ""}`}
                  onClick={() => track.audioUrl && playTrack(track.id, track.audioUrl, `For ${gen.input.recipientName}`, gen.input.genre, gen.input.mood, grads[i%3])}>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${grads[i % 3]} flex items-center justify-center shrink-0 relative`}>
                    {isThisPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#111] truncate">For {gen.input.recipientName}</p>
                      {!gen.isPaid && <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#EAEAEA] text-[#CCC]">Preview</span>}
                    </div>
                    <p className="text-[11px] text-[#999] capitalize">{gen.input.genre} · {gen.input.mood}</p>
                    {isActive && <div className="mt-1 h-[3px] rounded-full bg-[#F0F0F0]"><div className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] transition-all" style={{ width: `${player.progress}%` }} /></div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#CCC] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <Heart className="w-3 h-3" />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#CCC] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#CCC] hover:text-[#111] hover:border-[#CCC] transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <Share2 className="w-3 h-3" />
                    </button>
                    {!gen.isPaid && (
                      <button className="px-2.5 py-1 rounded-lg border border-[#EAEAEA] text-[10px] font-semibold text-[#888] hover:border-[#CCC] transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ))}

          {/* Empty state */}
          {filteredGens.length === 0 && !isGenerating && (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center">
                <p className="text-sm text-[#BBB]">No songs yet</p>
                <p className="text-xs text-[#DDD] mt-1">Create your first song using the panel on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
