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
