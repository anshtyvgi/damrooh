"use client";

import { usePlayerStore } from "@/stores/playerStore";
import { Play, Pause, SkipBack, SkipForward, Heart, Share2, Volume2, X, ChevronUp, ChevronDown, Lock, Download } from "lucide-react";
import { useRef, useEffect, useCallback, useState } from "react";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Mock lyrics for demo
const mockLyrics = [
  { time: 0, text: "[Verse]" },
  { time: 2, text: "A melody for you tonight" },
  { time: 5, text: "Every note is burning bright" },
  { time: 8, text: "Words I never said out loud" },
  { time: 11, text: "Singing them above the crowd" },
  { time: 15, text: "" },
  { time: 16, text: "[Chorus]" },
  { time: 17, text: "This is your damrooh, your melody" },
  { time: 21, text: "A song that speaks what words can't say" },
  { time: 25, text: "From my heart to yours today" },
  { time: 29, text: "Every rhythm, every rhyme" },
  { time: 33, text: "Crafted just for you this time" },
  { time: 37, text: "" },
  { time: 38, text: "[Verse]" },
  { time: 39, text: "Through every high and low" },
  { time: 43, text: "You're the one I want to know" },
  { time: 47, text: "In this song I'll let you see" },
  { time: 51, text: "What you really mean to me" },
  { time: 55, text: "" },
  { time: 56, text: "[Chorus]" },
  { time: 57, text: "This is your damrooh, your melody" },
  { time: 61, text: "A song that speaks what words can't say" },
];

export function GlobalPlayer() {
  const { currentTrack, isPlaying, progress, currentTime, duration, pause, resume, setProgress, stop } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [expanded, setExpanded] = useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const p = (a.currentTime / (a.duration || 1)) * 100;
    setProgress(p, a.currentTime, a.duration || 0);
  }, [setProgress]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnd = () => pause();
    a.addEventListener("timeupdate", handleTimeUpdate);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", handleTimeUpdate); a.removeEventListener("ended", onEnd); };
  }, [currentTrack, handleTimeUpdate, pause]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentTrack) return;
    if (a.src !== currentTrack.audioUrl) { a.src = currentTrack.audioUrl; a.load(); }
    if (isPlaying) a.play().catch(() => {});
    else a.pause();
  }, [isPlaying, currentTrack]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (!expanded || !lyricsRef.current) return;
    const activeLine = lyricsRef.current.querySelector("[data-active=true]");
    if (activeLine) activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentTime, expanded]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = pct * (a.duration || 0);
  };

  const currentLyricIndex = mockLyrics.findLastIndex((l) => currentTime >= l.time);

  if (!currentTrack) return null;

  return (
    <>
      {/* ═══ EXPANDED PLAYER ═══ */}
      {expanded && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA]">
            <button onClick={() => setExpanded(false)} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#111] transition-colors cursor-pointer">
              <ChevronDown className="w-4 h-4" /> Close
            </button>
            <p className="text-sm font-semibold text-[#111]">Now Playing</p>
            <div className="w-16" />
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* LEFT — Poster */}
            <div className="flex items-center justify-center p-8 lg:border-r border-[#F0F0F0]">
              <div className={`w-full max-w-[280px] aspect-square rounded-3xl bg-gradient-to-br ${currentTrack.gradient} relative overflow-hidden shadow-xl`}>
                <div className="absolute inset-0 banner-overlay opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                      {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
                    </div>
                    <p className="text-white font-bold text-xl">{currentTrack.title}</p>
                    <p className="text-white/50 text-sm mt-1 capitalize">{currentTrack.genre} · {currentTrack.mood}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER — Controls */}
            <div className="flex flex-col items-center justify-center p-8 lg:border-r border-[#F0F0F0]">
              <p className="text-lg font-bold text-[#111] mb-1">{currentTrack.title}</p>
              <p className="text-sm text-[#999] capitalize mb-8">{currentTrack.genre} · {currentTrack.mood}</p>

              {/* Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#999] hover:text-[#111] transition-colors cursor-pointer">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={() => isPlaying ? pause() : resume()} className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors">
                  {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#999] hover:text-[#111] transition-colors cursor-pointer">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Seek */}
              <div className="w-full max-w-xs space-y-1">
                <div className="h-1.5 rounded-full bg-[#F0F0F0] cursor-pointer" onClick={handleSeek}>
                  <div className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#BBB]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                {[
                  { icon: Heart, label: "Like" },
                  { icon: Share2, label: "Share" },
                  { icon: Download, label: "Save" },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] text-xs font-medium text-[#888] hover:border-[#CCC] transition-colors cursor-pointer">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              {/* Unlock CTA */}
              <button className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] text-white text-sm font-semibold cursor-pointer flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Unlock full · 10 coins
              </button>
            </div>

            {/* RIGHT — Lyrics */}
            <div className="flex flex-col p-6 overflow-hidden">
              <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-4">Lyrics</p>
              <div ref={lyricsRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
                {mockLyrics.map((line, i) => {
                  const isActive = i === currentLyricIndex;
                  const isPast = i < currentLyricIndex;
                  const isSection = line.text.startsWith("[");
                  return (
                    <p
                      key={i}
                      data-active={isActive}
                      className={`text-sm leading-relaxed transition-all duration-300 ${
                        isSection
                          ? "text-[10px] font-semibold text-[#BBB] uppercase tracking-wider mt-4"
                          : isActive
                          ? "text-[#111] font-semibold text-base"
                          : isPast
                          ? "text-[#999]"
                          : "text-[#CCC]"
                      }`}
                    >
                      {line.text || "\u00A0"}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MINI PLAYER BAR ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EAEAEA] lg:ml-[60px]">
        <div className="h-1 bg-[#F0F0F0] cursor-pointer" onClick={handleSeek}>
          <div className="h-full bg-gradient-to-r from-[#7B61FF] to-[#FF4D8D] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 max-w-[1200px] mx-auto">
          {/* Track info — clickable to expand */}
          <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentTrack.gradient} shrink-0 flex items-center justify-center`}>
              <span className="text-white text-[10px] font-bold">🎵</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111] truncate">{currentTrack.title}</p>
              <p className="text-[11px] text-[#999] truncate capitalize">{currentTrack.genre} · {currentTrack.mood}</p>
            </div>
          </div>

          {/* Expand */}
          <button onClick={() => setExpanded(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#CCC] hover:text-[#111] transition-colors cursor-pointer hidden sm:flex">
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#999] hover:text-[#111] transition-colors cursor-pointer">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => isPlaying ? pause() : resume()} className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors">
              {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#999] hover:text-[#111] transition-colors cursor-pointer">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#999] w-24 justify-center">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#CCC] hover:text-[#111] transition-colors cursor-pointer">
              <Heart className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#CCC] hover:text-[#111] transition-colors cursor-pointer">
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button onClick={stop} className="w-7 h-7 rounded-full flex items-center justify-center text-[#CCC] hover:text-[#111] transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <audio ref={audioRef} preload="metadata" />
    </>
  );
}
