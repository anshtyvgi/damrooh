"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/stores/useStore";
import { Button } from "@/components/ui/Button";
import { GENRES, LANGUAGES, MOODS } from "@/types";
import type { VoiceType } from "@/types";
import { Sparkles, Shuffle, ArrowLeft, Check, Music } from "lucide-react";
import { OutputScreen } from "@/components/generation/OutputScreen";
import { generateLyrics, generateMusic, startPolling } from "@/lib/api";
import type { LyricOption } from "@/lib/api";
import { useState, useRef } from "react";

const voices: { value: VoiceType; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "duet", label: "Duet" },
];

const studioPrompts = [
  "A song about chasing dreams in a big city...",
  "The feeling when it rains and you miss someone...",
  "Dancing alone at midnight, feeling alive...",
  "A letter to my younger self...",
  "The joy of finding your person...",
  "Letting go of what no longer serves you...",
];

const lyricCardColors = [
  "from-emerald-400/10 to-cyan-400/5 border-emerald-200",
  "from-violet-400/10 to-indigo-400/5 border-violet-200",
  "from-rose-400/10 to-amber-400/5 border-rose-200",
];

export default function StudioPage() {
  const {
    dedication, setMessage, setMood, setGenre, setLanguage, setVoice,
    coins, isFirstTime, deductCoins,
    generationStatus, setGenerationStatus, setCurrentGeneration,
  } = useStore();

  const [lyricsOptions, setLyricsOptions] = useState<LyricOption[] | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<number | null>(null);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [step, setStep] = useState<"input" | "lyrics" | "output">("input");
  const stopPollingRef = useRef<(() => void) | null>(null);

  const showOutput = generationStatus !== "idle" && generationStatus !== "failed";
  const cost = isFirstTime ? 0 : 6;
  const canAfford = isFirstTime || coins >= cost;

  const randomizePrompt = () => {
    setMessage(studioPrompts[Math.floor(Math.random() * studioPrompts.length)]);
  };

  const handleWriteLyrics = async () => {
    if (!dedication.message.trim()) return;
    setIsGeneratingLyrics(true);
    try {
      const input = { ...dedication, recipientName: "Studio Track", occasion: "custom" as const, relationship: "custom" as const };
      const result = await generateLyrics(input);
      setLyricsOptions(result.options);
      setStep("lyrics");
    } catch (error) {
      console.error("Lyrics error:", error);
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!lyricsOptions || !canAfford) return;
    if (!isFirstTime) { const success = deductCoins(cost); if (!success) return; }
    setIsGeneratingMusic(true);
    setGenerationStatus("generating-tracks");
    setStep("output");
    try {
      const result = await generateMusic({
        lyrics: lyricsOptions.map((o) => o.lyrics),
        tags: lyricsOptions.map((o) => o.tags),
        titles: lyricsOptions.map((o) => o.title),
        vibes: lyricsOptions.map((o) => o.vibe),
        recipientName: "Studio Track",
        occasion: "custom",
        mood: dedication.mood,
        genre: dedication.genre,
      });
      const generation = {
        id: result.id,
        input: { ...dedication, recipientName: "Studio Track", occasion: "custom" as const, relationship: "custom" as const },
        status: "generating-tracks" as const,
        tracks: result.tracks.map((t) => ({ id: t.id, status: t.status as "pending" | "processing" | "completed" | "failed" })),
        lyrics: lyricsOptions.map((o) => `**${o.title}** — ${o.vibe}\n\n${o.lyrics}`).join("\n\n---\n\n"),
        createdAt: new Date().toISOString(),
        isPaid: false,
        isShared: false,
      };
      setCurrentGeneration(generation);
      stopPollingRef.current = startPolling(result.id, (statusData) => {
        const hasAny = statusData.tracks.some((t) => t.status === "completed");
        const allDone = statusData.status === "completed";
        setCurrentGeneration({
          ...generation, status: allDone ? "completed" : hasAny ? "partial" : "generating-tracks",
          posterUrl: statusData.posterUrl || undefined,
          tracks: statusData.tracks.map((t) => ({ id: t.id, status: t.status, audioUrl: t.audioUrl || undefined })),
        });
        if (allDone) setGenerationStatus("completed");
        else if (hasAny) setGenerationStatus("partial");
        else if (statusData.status === "failed") setGenerationStatus("failed");
      }, (err) => { console.error("Poll error:", err); setGenerationStatus("failed"); }, 5000);
    } catch (error) {
      console.error("Music error:", error);
      setGenerationStatus("failed");
      if (!isFirstTime) useStore.getState().addCoins(cost);
    }
  };

  return (
    <div className="p-5 sm:p-8 lg:p-6 min-h-screen">
      <AnimatePresence mode="wait">
        {/* ═══ INPUT + LYRICS — Split Screen ═══ */}
        {(step === "input" || step === "lyrics") && !showOutput && (
          <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
            {/* LEFT — Controls (40%) */}
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-[28px] bg-white border border-black/[0.04] p-6 sm:p-8 space-y-6">
                <div>
                  <p className="text-sm font-bold text-[#FFC629] uppercase tracking-widest mb-1">Studio</p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create from scratch.</h1>
                </div>

                {/* Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Prompt</label>
                    <button onClick={randomizePrompt} className="flex items-center gap-1 text-xs text-[#FFC629] font-semibold hover:text-[#E6B000] transition-colors cursor-pointer">
                      <Shuffle className="w-3 h-3" /> Inspire me
                    </button>
                  </div>
                  <textarea
                    value={dedication.message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write anything — a feeling, a story, a mood..."
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#F5F5F0] text-[#111] text-sm placeholder:text-[#BBB] focus:outline-none focus:ring-2 focus:ring-[#FFC629]/40 border border-black/[0.06] resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  {/* Genre */}
                  <div>
                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest mb-2 block">Genre</label>
                    <div className="flex flex-wrap gap-1.5">
                      {GENRES.map((g) => (
                        <button key={g.value} onClick={() => setGenre(g.value)}
                          className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${dedication.genre === g.value ? "bg-[#111] text-white font-bold" : "bg-[#F5F5F0] text-[#666] hover:bg-[#EDEDEA]"}`}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Mood */}
                  <div>
                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest mb-2 block">Mood</label>
                    <div className="flex flex-wrap gap-1.5">
                      {MOODS.map((m) => (
                        <button key={m.value} onClick={() => setMood(m.value)}
                          className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${dedication.mood === m.value ? "bg-[#111] text-white font-bold" : "bg-[#F5F5F0] text-[#666] hover:bg-[#EDEDEA]"}`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Language */}
                  <div>
                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest mb-2 block">Language</label>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map((l) => (
                        <button key={l.value} onClick={() => setLanguage(l.value)}
                          className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${dedication.language === l.value ? "bg-[#111] text-white font-bold" : "bg-[#F5F5F0] text-[#666] hover:bg-[#EDEDEA]"}`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Voice */}
                  <div>
                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest mb-2 block">Voice</label>
                    <div className="flex gap-2">
                      {voices.map((v) => (
                        <button key={v.value} onClick={() => setVoice(v.value)}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${dedication.voice === v.value ? "bg-[#111] text-white font-bold" : "bg-[#F5F5F0] text-[#666] hover:bg-[#EDEDEA]"}`}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button size="lg" fullWidth disabled={!dedication.message.trim() || isGeneratingLyrics} onClick={handleWriteLyrics} className="!bg-[#FFC629] !text-[#111] !shadow-[0_8px_24px_rgba(255,198,41,0.3)]">
                  <Sparkles className="w-5 h-5" />
                  {isGeneratingLyrics ? "Writing lyrics..." : "Write Lyrics"}
                </Button>
              </div>
            </div>

            {/* RIGHT — Preview (60%) */}
            <div className="lg:col-span-3">
              {step === "input" && !lyricsOptions && (
                <div className="rounded-[28px] bg-white border border-black/[0.04] p-8 h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center max-w-sm">
                    <div className="w-20 h-20 rounded-3xl bg-[#FFF8E1] flex items-center justify-center mx-auto mb-6">
                      <Music className="w-9 h-9 text-[#FFC629]" />
                    </div>
                    <h3 className="text-xl font-extrabold mb-2">Your preview will appear here</h3>
                    <p className="text-[#999] text-sm">Write a prompt and hit &quot;Write Lyrics&quot; to see AI-generated song options.</p>
                  </div>
                </div>
              )}

              {step === "lyrics" && lyricsOptions && (
                <div className="rounded-[28px] bg-white border border-black/[0.04] p-6 sm:p-8 space-y-5">
                  <div>
                    <h2 className="text-xl font-extrabold">Pick your vibe</h2>
                    <p className="text-[#999] text-sm mt-1">AI wrote 3 unique songs. Each becomes a track.</p>
                  </div>

                  <div className="space-y-4">
                    {lyricsOptions.map((option, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                        onClick={() => setSelectedLyrics(selectedLyrics === i ? null : i)}
                        className={`lyric-card bg-gradient-to-br ${lyricCardColors[i]} border ${selectedLyrics === i ? "ring-2 ring-[#FFC629] shadow-lg" : ""}`}>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-[#111] text-lg">{option.title}</p>
                              <p className="text-[#888] text-xs mt-0.5">{option.vibe}</p>
                            </div>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${selectedLyrics === i ? "bg-[#FFC629]" : "bg-[#F5F5F0] border border-black/[0.06]"}`}>
                              {selectedLyrics === i && <Check className="w-4 h-4 text-[#111]" />}
                            </div>
                          </div>
                          <p className="text-[#666] text-sm leading-relaxed whitespace-pre-line line-clamp-5">
                            {option.lyrics.replace(/\[(Verse|Chorus|Bridge)\]/g, "").trim()}
                          </p>
                          {selectedLyrics === i && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-black/[0.06]">
                              <p className="text-[#333] text-sm leading-relaxed whitespace-pre-line">{option.lyrics}</p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cost + Generate */}
                  <div className="rounded-2xl bg-[#FFF8E1] border border-[#FFC629]/20 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full token-coin flex items-center justify-center"><span className="text-base">🪙</span></div>
                      <div>
                        <p className="text-sm font-bold text-[#111]">{isFirstTime ? "First one's free!" : `${cost} tokens`}</p>
                        <p className="text-xs text-[#999]">{isFirstTime ? "No tokens needed" : `Balance: ${coins}`}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => { setStep("input"); setLyricsOptions(null); }}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button size="lg" fullWidth disabled={!canAfford || isGeneratingMusic} onClick={handleGenerateMusic} className="!bg-[#111] !text-white">
                      <Music className="w-5 h-5" />
                      {isGeneratingMusic ? "Generating..." : isFirstTime ? "Generate — Free" : `Generate — ${cost} tokens`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ OUTPUT ═══ */}
        {(step === "output" || showOutput) && (
          <motion.div key="output" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <OutputScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
