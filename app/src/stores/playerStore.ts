"use client";

import { create } from "zustand";

interface PlayerStore {
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    genre: string;
    mood: string;
    gradient: string;
  } | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;

  play: (track: NonNullable<PlayerStore["currentTrack"]>) => void;
  pause: () => void;
  resume: () => void;
  setProgress: (progress: number, currentTime: number, duration: number) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  currentTime: 0,
  duration: 0,

  play: (track) => set({ currentTrack: track, isPlaying: true, progress: 0, currentTime: 0 }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  setProgress: (progress, currentTime, duration) => set({ progress, currentTime, duration }),
  stop: () => set({ currentTrack: null, isPlaying: false, progress: 0, currentTime: 0, duration: 0 }),
}));
