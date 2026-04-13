// ========================
// Damrooh Core Types
// ========================

export type Occasion =
  | "birthday"
  | "anniversary"
  | "love"
  | "apology"
  | "thank-you"
  | "friendship"
  | "farewell"
  | "custom";

export type Relationship =
  | "partner"
  | "parent"
  | "friend"
  | "sibling"
  | "colleague"
  | "crush"
  | "custom";

export type Mood =
  | "happy"
  | "romantic"
  | "nostalgic"
  | "energetic"
  | "bittersweet"
  | "playful"
  | "savage";

export type Genre =
  | "bollywood"
  | "pop"
  | "lofi"
  | "classical"
  | "rnb"
  | "hiphop"
  | "acoustic";

export type Language = "hindi" | "english" | "hinglish" | "punjabi";

export type VoiceType = "male" | "female" | "duet";

export type TrackStatus = "pending" | "processing" | "completed" | "failed";

export type GenerationStatus =
  | "idle"
  | "generating-prompt"
  | "generating-tracks"
  | "generating-poster"
  | "partial"
  | "completed"
  | "failed";

export interface Track {
  id: string;
  status: TrackStatus;
  audioUrl?: string;
  duration?: number;
}

export interface DedicationInput {
  recipientName: string;
  occasion: Occasion;
  relationship: Relationship;
  message: string;
  mood: Mood;
  genre: Genre;
  language: Language;
  voice: VoiceType;
}

export interface Generation {
  id: string;
  userId?: string;
  input: DedicationInput;
  status: GenerationStatus;
  prompt?: string;
  tags?: string[];
  posterUrl?: string;
  tracks: Track[];
  lyrics?: string;
  createdAt: string;
  isPaid: boolean;
  isShared: boolean;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  coins: number;
  generations: string[];
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  priceINR: number;
  priceUSD: number;
  popular?: boolean;
  bestValue?: boolean;
}

// Pricing
export const COIN_PACKAGES: CoinPackage[] = [
  { id: "starter", name: "Starter", coins: 50, priceINR: 99, priceUSD: 1.49 },
  { id: "popular", name: "Popular", coins: 150, priceINR: 249, priceUSD: 3.49, popular: true },
  { id: "best-value", name: "Best Value", coins: 500, priceINR: 699, priceUSD: 8.99, bestValue: true },
  { id: "pro", name: "Pro", coins: 1500, priceINR: 1799, priceUSD: 21.99 },
];

export const COIN_COSTS = {
  generate: 6,
  shareFull: 10,
  download: 19,
  fullPack: 29,
} as const;

export const FREE_COINS = 20;
export const FREE_PREVIEW_SECONDS = 10;

// Occasion metadata
export const OCCASIONS: { value: Occasion; label: string; emoji: string }[] = [
  { value: "birthday", label: "Birthday", emoji: "🎂" },
  { value: "anniversary", label: "Anniversary", emoji: "💍" },
  { value: "love", label: "Love", emoji: "❤️" },
  { value: "apology", label: "Apology", emoji: "🥺" },
  { value: "thank-you", label: "Thank You", emoji: "🙏" },
  { value: "friendship", label: "Friendship", emoji: "🤝" },
  { value: "farewell", label: "Farewell", emoji: "👋" },
  { value: "custom", label: "Something else", emoji: "✨" },
];

export const MOODS: { value: Mood; label: string; color: string }[] = [
  { value: "happy", label: "Happy", color: "#84CC16" },
  { value: "romantic", label: "Romantic", color: "#EC4899" },
  { value: "nostalgic", label: "Nostalgic", color: "#F59E0B" },
  { value: "energetic", label: "Energetic", color: "#EF4444" },
  { value: "bittersweet", label: "Bittersweet", color: "#8B5CF6" },
  { value: "playful", label: "Playful", color: "#06B6D4" },
  { value: "savage", label: "Savage", color: "#F97316" },
];

export const GENRES: { value: Genre; label: string }[] = [
  { value: "bollywood", label: "Bollywood" },
  { value: "pop", label: "Pop" },
  { value: "lofi", label: "Lo-fi" },
  { value: "classical", label: "Classical" },
  { value: "rnb", label: "R&B" },
  { value: "hiphop", label: "Hip-hop" },
  { value: "acoustic", label: "Acoustic" },
];

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
  { value: "hinglish", label: "Hinglish" },
  { value: "punjabi", label: "Punjabi" },
];

// ========================
// Multi-Model System Types
// ========================

/** Supported AI music generation models */
export type MusicModel = "ace-1.5" | "lyria" | "elevenlabs";

/** How the model was chosen */
export type ModelMode = "auto" | "manual";

/** Which platform feature is being used */
export type GenerationMode = "dedicate" | "studio" | "sfx";

/** Model routing decision with explanation */
export interface ModelSelection {
  model: MusicModel;
  mode: ModelMode;
  reason: string;
}

// ========================
// Session System
// ========================

export type SessionStatus =
  | "queued"
  | "lyrics"
  | "generating"
  | "covers"
  | "completed"
  | "partial"
  | "failed";

/** One lyric variation produced by Gemini */
export interface LyricVariation {
  id: string;
  title: string;
  vibe: string;
  lyrics: string;
  tags: string[];
}

/** Per-track state within a generation session */
export interface SessionTrack {
  id: string;
  variationIndex: number;
  lyric: LyricVariation;
  model: MusicModel;
  status: "pending" | "generating" | "completed" | "failed";
  audioUrl?: string;
  coverUrl?: string;
  duration?: number;
  modelTaskId?: string;
  error?: string;
}

/** Full generation session (new system — replaces legacy Generation) */
export interface GenerationSession {
  id: string;
  userId?: string;
  mode: GenerationMode;
  status: SessionStatus;
  progress: number; // 0–100
  modelSelection: ModelSelection;
  input: Record<string, unknown>;
  lyrics?: LyricVariation[];
  tracks: SessionTrack[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Studio Mode
// ========================

export interface StudioInput {
  prompt: string;
  style?: string;
  bpm?: number;
  key?: string;
  duration?: number; // seconds, default 60
  isPublic: boolean;
  modelMode: ModelMode;
  model?: MusicModel;
}

// ========================
// SFX / Background Mode
// ========================

export type SFXCategory =
  | "ambient"
  | "nature"
  | "urban"
  | "cinematic"
  | "game"
  | "custom";

export interface SFXInput {
  description: string;
  duration?: number; // seconds, default 30
  loopable: boolean;
  category: SFXCategory;
  modelMode: ModelMode;
  model?: MusicModel;
}

// ========================
// Health / Status
// ========================

export type ServiceHealth = "ok" | "error" | "not_configured" | "degraded";

export interface ServiceStatus {
  status: ServiceHealth;
  message: string;
  latencyMs?: number;
}

export interface SystemStatus {
  timestamp: string;
  overall: ServiceHealth;
  services: {
    db: ServiceStatus;
    redis: ServiceStatus;
    queue: ServiceStatus;
    gemini: ServiceStatus;
    ace: ServiceStatus;
    lyria: ServiceStatus;
    elevenlabs: ServiceStatus;
  };
}

// ========================
// Queue
// ========================

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface QueueJob {
  id: string;
  sessionId: string;
  status: JobStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}
