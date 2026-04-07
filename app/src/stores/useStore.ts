"use client";

import { create } from "zustand";
import type {
  DedicationInput,
  Generation,
  GenerationStatus,
  Mood,
  Genre,
  Language,
  VoiceType,
  Occasion,
  Relationship,
} from "@/types";

interface DamroohStore {
  // User
  coins: number;
  isFirstTime: boolean;
  setCoins: (coins: number) => void;
  deductCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;

  // Dedication form
  dedication: DedicationInput;
  setRecipientName: (name: string) => void;
  setOccasion: (occasion: Occasion) => void;
  setRelationship: (relationship: Relationship) => void;
  setMessage: (message: string) => void;
  setMood: (mood: Mood) => void;
  setGenre: (genre: Genre) => void;
  setLanguage: (language: Language) => void;
  setVoice: (voice: VoiceType) => void;
  resetDedication: () => void;

  // Generation
  currentGeneration: Generation | null;
  generationStatus: GenerationStatus;
  setCurrentGeneration: (gen: Generation | null) => void;
  setGenerationStatus: (status: GenerationStatus) => void;

  // Library
  generations: Generation[];
  addGeneration: (gen: Generation) => void;

  // UI
  step: number;
  setStep: (step: number) => void;
}

const DEFAULT_DEDICATION: DedicationInput = {
  recipientName: "",
  occasion: "love",
  relationship: "partner",
  message: "",
  mood: "romantic",
  genre: "bollywood",
  language: "hinglish",
  voice: "female",
};

export const useStore = create<DamroohStore>((set, get) => ({
  // User
  coins: 20, // Free onboarding coins
  isFirstTime: true,
  setCoins: (coins) => set({ coins }),
  deductCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) return false;
    set({ coins: coins - amount });
    return true;
  },
  addCoins: (amount) => set({ coins: get().coins + amount }),

  // Dedication form
  dedication: { ...DEFAULT_DEDICATION },
  setRecipientName: (name) =>
    set((s) => ({ dedication: { ...s.dedication, recipientName: name } })),
  setOccasion: (occasion) =>
    set((s) => ({ dedication: { ...s.dedication, occasion } })),
  setRelationship: (relationship) =>
    set((s) => ({ dedication: { ...s.dedication, relationship } })),
  setMessage: (message) =>
    set((s) => ({ dedication: { ...s.dedication, message } })),
  setMood: (mood) =>
    set((s) => ({ dedication: { ...s.dedication, mood } })),
  setGenre: (genre) =>
    set((s) => ({ dedication: { ...s.dedication, genre } })),
  setLanguage: (language) =>
    set((s) => ({ dedication: { ...s.dedication, language } })),
  setVoice: (voice) =>
    set((s) => ({ dedication: { ...s.dedication, voice } })),
  resetDedication: () => set({ dedication: { ...DEFAULT_DEDICATION }, step: 0 }),

  // Generation
  currentGeneration: null,
  generationStatus: "idle",
  setCurrentGeneration: (gen) => set({ currentGeneration: gen }),
  setGenerationStatus: (status) => set({ generationStatus: status }),

  // Library
  generations: [],
  addGeneration: (gen) =>
    set((s) => ({ generations: [gen, ...s.generations] })),

  // UI
  step: 0,
  setStep: (step) => set({ step }),
}));
