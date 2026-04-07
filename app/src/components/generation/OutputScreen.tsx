"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/stores/useStore";
import { WaveformLoader } from "@/components/ui/WaveformLoader";
import { DiscPlayer } from "@/components/player/DiscPlayer";
import { Button } from "@/components/ui/Button";
import { COIN_COSTS } from "@/types";
import { Share2, Download, Heart, ThumbsDown, RotateCcw, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const statusMessages: Record<string, { text: string; emoji: string }> = {
  "generating-prompt": { text: "Writing lyrics...", emoji: "✍️" },
  "generating-poster": { text: "Designing visuals...", emoji: "🎨" },
  "generating-tracks": { text: "Composing music...", emoji: "🎵" },
  partial: { text: "Almost there...", emoji: "⏳" },
  completed: { text: "Your Damrooh is ready!", emoji: "🎉" },
  failed: { text: "Something went wrong", emoji: "😔" },
};

const trackGradients = [
  "from-emerald-400 to-cyan-400",
  "from-violet-400 to-indigo-500",
  "from-rose-400 to-amber-400",
];

export function OutputScreen() {
  const { generationStatus, currentGeneration, coins, deductCoins, addGeneration, generations, setGenerationStatus, setCurrentGeneration, resetDedication } = useStore();
  const router = useRouter();
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [dislikedTracks, setDislikedTracks] = useState<Set<string>>(new Set());
  const [shareLoading, setShareLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shared, setShared] = useState(false);

  // Save to library when generation completes
  const addToLibrary = useCallback(() => {
    if (currentGeneration && !generations.some((g) => g.id === currentGeneration.id)) {
      addGeneration({ ...currentGeneration, status: "completed" });
    }
  }, [currentGeneration, generations, addGeneration]);

  useEffect(() => {
    if (generationStatus === "completed" && currentGeneration) {
      addToLibrary();
    }
  }, [generationStatus, currentGeneration, addToLibrary]);
  const isComplete = generationStatus === "completed";
  const isGenerating = !isComplete && generationStatus !== "failed";
  const statusInfo = statusMessages[generationStatus] || { text: "Creating...", emoji: "✨" };

  const toggleLike = (trackId: string) => {
    setLikedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
    setDislikedTracks((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
  };

  const toggleDislike = (trackId: string) => {
    setDislikedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
    setLikedTracks((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
  };

  const handleShare = async () => {
    if (!currentGeneration) return;
    const cost = COIN_COSTS.shareFull;
    if (coins < cost) {
      router.push("/coins");
      return;
    }

    setShareLoading(true);
    try {
      const success = deductCoins(cost);
      if (!success) { router.push("/coins"); return; }

      const firstTrack = currentGeneration.tracks.find((t) => t.status === "completed");
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: currentGeneration.id,
          recipientName: currentGeneration.input.recipientName,
          occasion: currentGeneration.input.occasion,
          mood: currentGeneration.input.mood,
          genre: currentGeneration.input.genre,
          message: currentGeneration.input.message,
          audioUrl: firstTrack?.audioUrl || null,
          posterUrl: currentGeneration.posterUrl || null,
          lyrics: currentGeneration.lyrics || null,
        }),
      });
      const data = await res.json();

      setCurrentGeneration({ ...currentGeneration, isPaid: true, isShared: true });
      setShared(true);

      if (navigator.share) {
        await navigator.share({
          title: `A Damrooh for ${currentGeneration.input.recipientName}`,
          text: `I made a song for you!`,
          url: window.location.origin + data.shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + data.shareUrl);
        alert("Share link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setShareLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentGeneration) return;
    const cost = COIN_COSTS.download;
    if (coins < cost) {
      router.push("/coins");
      return;
    }

    setDownloadLoading(true);
    try {
      const success = deductCoins(cost);
      if (!success) { router.push("/coins"); return; }

      setCurrentGeneration({ ...currentGeneration, isPaid: true });

      // Download each completed track
      for (const track of currentGeneration.tracks) {
        if (track.audioUrl && track.status === "completed") {
          const link = document.createElement("a");
          link.href = track.audioUrl;
          link.download = `damrooh-${currentGeneration.input.recipientName}-track-${track.id}.mp3`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleRegenerate = () => {
    setGenerationStatus("idle");
    setCurrentGeneration(null);
    resetDedication();
    router.push("/dedicate");
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Status header */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={generationStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {isGenerating && (
              <div className="mb-6">
                <WaveformLoader size="lg" />
              </div>
            )}

            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-accent" />
              </motion.div>
            )}

            <p className="text-3xl mb-2">{statusInfo.emoji}</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:Poppins]">
              {isComplete && currentGeneration?.input.recipientName
                ? `For ${currentGeneration.input.recipientName}`
                : statusInfo.text}
            </h2>
            {isGenerating && (
              <p className="text-text-secondary mt-2 text-sm">{statusInfo.text}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Poster placeholder */}
      <AnimatePresence>
        {currentGeneration?.posterUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-3xl overflow-hidden aspect-square mesh-gradient-card border border-border flex items-center justify-center"
          >
            <div className="text-center p-8">
              <p className="text-5xl mb-4">🎵</p>
              <p className="text-xl font-bold font-[family-name:Poppins] gradient-text">
                {currentGeneration.input.recipientName}
              </p>
              <p className="text-text-secondary text-sm mt-2">A Damrooh, just for you</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracks */}
      <div className="space-y-4">
        <AnimatePresence>
          {currentGeneration?.tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="rounded-2xl bg-bg-card border border-border p-5 flex items-center gap-5"
            >
              <DiscPlayer
                audioUrl={track.audioUrl}
                trackNumber={i + 1}
                isPaid={currentGeneration.isPaid}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${trackGradients[i]}`} />
                  <p className="font-semibold text-text text-sm">Track {i + 1}</p>
                </div>
                <p className="text-text-muted text-xs capitalize mt-0.5">
                  {track.status === "completed"
                    ? `${currentGeneration.input.genre} · ${currentGeneration.input.mood}`
                    : track.status === "processing" ? "Composing..." : track.status}
                </p>

                {track.status === "completed" && (
                  <div className="flex gap-2 mt-2.5">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(track.id)}
                      className={`w-7 h-7 rounded-full bg-surface border flex items-center justify-center transition-colors cursor-pointer ${
                        likedTracks.has(track.id) ? "text-accent border-accent/30" : "text-text-muted border-border hover:text-accent hover:border-accent/30"
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${likedTracks.has(track.id) ? "fill-accent" : ""}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleDislike(track.id)}
                      className={`w-7 h-7 rounded-full bg-surface border flex items-center justify-center transition-colors cursor-pointer ${
                        dislikedTracks.has(track.id) ? "text-danger border-danger/30" : "text-text-muted border-border hover:text-danger hover:border-danger/30"
                      }`}
                    >
                      <ThumbsDown className={`w-3 h-3 ${dislikedTracks.has(track.id) ? "fill-danger" : ""}`} />
                    </motion.button>
                  </div>
                )}
              </div>

              {track.status === "processing" && <WaveformLoader bars={6} size="sm" />}
              {track.status === "pending" && (
                <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-pulse" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lyrics */}
      {currentGeneration?.lyrics && isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-bg-card border border-border p-6"
        >
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Lyrics</h3>
          <p className="text-text text-sm leading-relaxed whitespace-pre-line">
            {currentGeneration.lyrics}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Button size="lg" fullWidth onClick={handleShare} disabled={shareLoading || shared}>
            <Share2 className="w-5 h-5" />
            {shareLoading ? "Sharing..." : shared ? "Shared!" : `Share Damrooh \u00b7 ${COIN_COSTS.shareFull} tokens`}
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={handleDownload} disabled={downloadLoading}>
            <Download className="w-5 h-5" />
            {downloadLoading ? "Downloading..." : `Download \u00b7 ${COIN_COSTS.download} tokens`}
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={handleRegenerate}>
            <RotateCcw className="w-4 h-4" />
            Regenerate &middot; {COIN_COSTS.generate} tokens
          </Button>
          <p className="text-center text-text-muted text-xs">Balance: {coins} tokens</p>
        </motion.div>
      )}
    </div>
  );
}
