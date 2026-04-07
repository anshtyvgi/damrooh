"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/stores/useStore";
import { Button } from "@/components/ui/Button";
import { COIN_COSTS, OCCASIONS, MOODS, GENRES, LANGUAGES } from "@/types";
import { ArrowLeft, Sparkles, Check, Music } from "lucide-react";
import { generateLyrics, generateMusic, startPolling } from "@/lib/api";
import type { LyricOption } from "@/lib/api";
import { useState, useRef } from "react";

const lyricCardColors = [
  "from-emerald-400/10 to-cyan-400/5 border-emerald-200",
  "from-violet-400/10 to-indigo-400/5 border-violet-200",
  "from-rose-400/10 to-amber-400/5 border-rose-200",
];

export function StepGenerate() {
  const { dedication, coins, isFirstTime, deductCoins, setStep, setGenerationStatus, setCurrentGeneration } = useStore();
  const [lyricsOptions, setLyricsOptions] = useState<LyricOption[] | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<number | null>(null);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const stopPollingRef = useRef<(() => void) | null>(null);

  const cost = isFirstTime ? 0 : COIN_COSTS.generate;
  const canAfford = isFirstTime || coins >= cost;

  const occasionLabel = OCCASIONS.find((o) => o.value === dedication.occasion)?.label;
  const moodLabel = MOODS.find((m) => m.value === dedication.mood)?.label;
  const genreLabel = GENRES.find((g) => g.value === dedication.genre)?.label;
  const languageLabel = LANGUAGES.find((l) => l.value === dedication.language)?.label;

  const handleGenerateLyrics = async () => {
    setIsGeneratingLyrics(true);
    try {
      const result = await generateLyrics(dedication);
      setLyricsOptions(result.options);
    } catch (error) {
      console.error("Lyrics error:", error);
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!lyricsOptions || !canAfford) return;

    if (!isFirstTime) {
      const success = deductCoins(cost);
      if (!success) return;
    }

    setIsGeneratingMusic(true);
    setGenerationStatus("generating-tracks");

    try {
      // Send all 3 lyrics — each gets its own track
      const result = await generateMusic({
        lyrics: lyricsOptions.map((o) => o.lyrics),
        tags: lyricsOptions.map((o) => o.tags),
        titles: lyricsOptions.map((o) => o.title),
        vibes: lyricsOptions.map((o) => o.vibe),
        recipientName: dedication.recipientName,
        occasion: dedication.occasion,
        mood: dedication.mood,
        genre: dedication.genre,
      });

      const generation = {
        id: result.id,
        input: dedication,
        status: "generating-tracks" as const,
        tracks: result.tracks.map((t) => ({
          id: t.id,
          status: t.status as "pending" | "processing" | "completed" | "failed",
        })),
        lyrics: lyricsOptions.map((o) => `**${o.title}** — ${o.vibe}\n\n${o.lyrics}`).join("\n\n---\n\n"),
        createdAt: new Date().toISOString(),
        isPaid: false,
        isShared: false,
      };

      setCurrentGeneration(generation);

      stopPollingRef.current = startPolling(
        result.id,
        (statusData) => {
          const hasAnyCompleted = statusData.tracks.some((t) => t.status === "completed");
          const allCompleted = statusData.status === "completed";

          setCurrentGeneration({
            ...generation,
            status: allCompleted ? "completed" : hasAnyCompleted ? "partial" : "generating-tracks",
            posterUrl: statusData.posterUrl || undefined,
            tracks: statusData.tracks.map((t) => ({
              id: t.id,
              status: t.status,
              audioUrl: t.audioUrl || undefined,
            })),
          });

          if (allCompleted) setGenerationStatus("completed");
          else if (hasAnyCompleted) setGenerationStatus("partial");
          else if (statusData.status === "failed") setGenerationStatus("failed");
        },
        (error) => {
          console.error("Polling error:", error);
          setGenerationStatus("failed");
        },
        5000
      );
    } catch (error) {
      console.error("Music generation error:", error);
      setGenerationStatus("failed");
      if (!isFirstTime) useStore.getState().addCoins(cost);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:Poppins]">
          {lyricsOptions ? "Pick your vibe" : "Ready to create?"}
        </h1>
        <p className="text-text-secondary mt-2 text-sm">
          {lyricsOptions
            ? "AI wrote 3 unique songs. Each will become a track."
            : "Review your dedication, then we'll write the lyrics"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!lyricsOptions ? (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Summary card */}
            <div className="rounded-3xl bg-bg-card border border-border p-6 space-y-3">
              {[
                ["For", dedication.recipientName],
                ["Occasion", occasionLabel],
                ["Mood", moodLabel],
                ["Genre", genreLabel],
                ["Language", languageLabel],
                ["Voice", dedication.voice],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">{label}</span>
                  <span className="text-text-secondary text-sm capitalize font-medium">{value}</span>
                </div>
              ))}
              {dedication.message && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <span className="text-text-muted text-sm block mb-1">Message</span>
                    <p className="text-text-secondary text-sm italic">&quot;{dedication.message}&quot;</p>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button size="lg" fullWidth onClick={handleGenerateLyrics} disabled={isGeneratingLyrics}>
                <Sparkles className="w-5 h-5" />
                {isGeneratingLyrics ? "Writing lyrics..." : "Write Lyrics"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="lyrics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* 3 lyric cards */}
            <div className="space-y-4">
              {lyricsOptions.map((option, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  onClick={() => setSelectedLyrics(selectedLyrics === i ? null : i)}
                  className={`lyric-card bg-gradient-to-br ${lyricCardColors[i]} border ${
                    selectedLyrics === i ? "ring-2 ring-accent shadow-lg" : ""
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-text font-[family-name:Poppins] text-lg">{option.title}</p>
                        <p className="text-text-secondary text-xs mt-0.5">{option.vibe}</p>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        selectedLyrics === i ? "bg-accent" : "bg-surface border border-border"
                      }`}>
                        {selectedLyrics === i && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line line-clamp-6">
                      {option.lyrics.replace(/\[(Verse|Chorus|Bridge)\]/g, "").trim()}
                    </p>
                    {selectedLyrics === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-border/50"
                      >
                        <p className="text-text text-sm leading-relaxed whitespace-pre-line">
                          {option.lyrics}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cost + Generate music */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full token-coin flex items-center justify-center">
                  <span className="text-base">🪙</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">
                    {isFirstTime ? "First one's free!" : `${cost} tokens`}
                  </p>
                  <p className="text-xs text-text-muted">
                    {isFirstTime ? "No tokens needed" : `Balance: ${coins}`}
                  </p>
                </div>
              </div>
              {isFirstTime && (
                <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-bold">FREE</span>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setLyricsOptions(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                fullWidth
                disabled={!canAfford || isGeneratingMusic}
                onClick={handleGenerateMusic}
              >
                <Music className="w-5 h-5" />
                {isGeneratingMusic ? "Generating music..." : isFirstTime ? "Generate Music — Free" : `Generate Music — ${cost} tokens`}
              </Button>
            </div>

            {!canAfford && (
              <p className="text-center text-danger text-sm">
                Not enough tokens. <a href="/coins" className="underline">Buy more</a>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
