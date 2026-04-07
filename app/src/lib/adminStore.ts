// In-memory admin data store
// In production: replace with PostgreSQL + Prisma
// This simulates the full DB schema for admin operations

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  coinsBalance: number;
  totalSpent: number;
  totalGenerated: number;
  status: "active" | "banned" | "shadow_banned";
  createdAt: string;
  lastActiveAt: string;
}

export interface AdminSong {
  id: string;
  userId: string;
  userName: string;
  title: string;
  category: string;
  prompt: string;
  lyrics: string;
  audioUrl: string | null;
  posterUrl: string | null;
  duration: number;
  status: "preview" | "unlocked" | "deleted" | "featured";
  plays: number;
  shares: number;
  completionRate: number;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  userName: string;
  prompt: string;
  status: "queued" | "running" | "completed" | "failed";
  outputs: string[];
  errorMessage: string | null;
  cost: number;
  createdAt: string;
  completedAt: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  coins: number;
  amount: number;
  type: "purchase" | "spend" | "refund" | "bonus";
  source: "generate" | "unlock" | "download" | "signup" | "admin" | "payment";
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

export interface PricingConfig {
  generateCost: number;
  unlockCost: number;
  downloadCost: number;
  bundleCost: number;
  freeCoins: number;
}

export interface Report {
  id: string;
  songId: string;
  songTitle: string;
  userId: string;
  userName: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  createdAt: string;
}

// ─── Seed data ───

declare global {
  var adminStore: {
    users: AdminUser[];
    songs: AdminSong[];
    jobs: GenerationJob[];
    transactions: Transaction[];
    pricing: PricingConfig;
    reports: Report[];
  };
}

if (!global.adminStore) {
  const now = new Date().toISOString();
  const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

  global.adminStore = {
    users: [
      { id: "u1", name: "Ansh Tyagi", email: "ansh@damrooh.app", phone: "+919876543210", coinsBalance: 142, totalSpent: 358, totalGenerated: 47, status: "active", createdAt: ago(30), lastActiveAt: ago(0) },
      { id: "u2", name: "Priya Sharma", email: "priya@gmail.com", phone: "+919123456789", coinsBalance: 20, totalSpent: 0, totalGenerated: 3, status: "active", createdAt: ago(14), lastActiveAt: ago(2) },
      { id: "u3", name: "Raj Mehta", email: "raj@outlook.com", phone: "+918765432100", coinsBalance: 89, totalSpent: 211, totalGenerated: 31, status: "active", createdAt: ago(21), lastActiveAt: ago(1) },
      { id: "u4", name: "Neha Kapoor", email: "neha@yahoo.com", phone: "+917654321098", coinsBalance: 0, totalSpent: 50, totalGenerated: 8, status: "shadow_banned", createdAt: ago(10), lastActiveAt: ago(5) },
      { id: "u5", name: "Karan Singh", email: "karan@gmail.com", phone: "+916543210987", coinsBalance: 500, totalSpent: 1200, totalGenerated: 156, status: "active", createdAt: ago(45), lastActiveAt: ago(0) },
      { id: "u6", name: "Simran Kaur", email: "simran@hotmail.com", phone: "+915432109876", coinsBalance: 15, totalSpent: 85, totalGenerated: 12, status: "active", createdAt: ago(7), lastActiveAt: ago(3) },
      { id: "u7", name: "Dev Patel", email: "dev@proton.me", phone: "+914321098765", coinsBalance: 0, totalSpent: 0, totalGenerated: 1, status: "banned", createdAt: ago(3), lastActiveAt: ago(3) },
      { id: "u8", name: "Riya Gupta", email: "riya@gmail.com", phone: "+913210987654", coinsBalance: 45, totalSpent: 155, totalGenerated: 22, status: "active", createdAt: ago(18), lastActiveAt: ago(0) },
    ],
    songs: [
      { id: "s1", userId: "u1", userName: "Ansh Tyagi", title: "Birthday Song for Meera", category: "birthday", prompt: "Happy birthday song for my sister", lyrics: "[Verse]\nHappy birthday dear Meera...", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", posterUrl: null, duration: 60, status: "featured", plays: 2481, shares: 342, completionRate: 78, createdAt: ago(5) },
      { id: "s2", userId: "u1", userName: "Ansh Tyagi", title: "Love Song for Priya", category: "love", prompt: "Romantic bollywood song", lyrics: "[Verse]\nTere bina...", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", posterUrl: null, duration: 30, status: "unlocked", plays: 891, shares: 156, completionRate: 85, createdAt: ago(3) },
      { id: "s3", userId: "u3", userName: "Raj Mehta", title: "Apology Track", category: "apology", prompt: "Sorry song for girlfriend", lyrics: "[Verse]\nI'm sorry...", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", posterUrl: null, duration: 60, status: "preview", plays: 156, shares: 12, completionRate: 45, createdAt: ago(2) },
      { id: "s4", userId: "u5", userName: "Karan Singh", title: "Proposal Song", category: "love", prompt: "Proposal song she said yes", lyrics: "[Verse]\nWill you...", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", posterUrl: null, duration: 60, status: "featured", plays: 5621, shares: 892, completionRate: 92, createdAt: ago(8) },
      { id: "s5", userId: "u2", userName: "Priya Sharma", title: "Thank You Papa", category: "thank-you", prompt: "Gratitude song for father", lyrics: "[Verse]\nPapa...", audioUrl: null, posterUrl: null, duration: 30, status: "preview", plays: 34, shares: 2, completionRate: 22, createdAt: ago(1) },
    ],
    jobs: [
      { id: "j1", userId: "u1", userName: "Ansh Tyagi", prompt: "Happy birthday bollywood", status: "completed", outputs: ["s1"], errorMessage: null, cost: 6, createdAt: ago(5), completedAt: ago(5) },
      { id: "j2", userId: "u3", userName: "Raj Mehta", prompt: "Sorry lo-fi track", status: "completed", outputs: ["s3"], errorMessage: null, cost: 6, createdAt: ago(2), completedAt: ago(2) },
      { id: "j3", userId: "u5", userName: "Karan Singh", prompt: "Proposal bollywood romantic", status: "completed", outputs: ["s4"], errorMessage: null, cost: 6, createdAt: ago(8), completedAt: ago(8) },
      { id: "j4", userId: "u2", userName: "Priya Sharma", prompt: "Thank you acoustic", status: "failed", outputs: [], errorMessage: "ACE API timeout", cost: 0, createdAt: ago(1), completedAt: ago(1) },
      { id: "j5", userId: "u8", userName: "Riya Gupta", prompt: "Chill vibes midnight", status: "running", outputs: [], errorMessage: null, cost: 6, createdAt: now, completedAt: null },
      { id: "j6", userId: "u6", userName: "Simran Kaur", prompt: "Farewell acoustic sad", status: "queued", outputs: [], errorMessage: null, cost: 6, createdAt: now, completedAt: null },
    ],
    transactions: [
      { id: "t1", userId: "u1", userName: "Ansh Tyagi", coins: 20, amount: 0, type: "bonus", source: "signup", status: "completed", createdAt: ago(30) },
      { id: "t2", userId: "u1", userName: "Ansh Tyagi", coins: 130, amount: 100, type: "purchase", source: "payment", status: "completed", createdAt: ago(25) },
      { id: "t3", userId: "u1", userName: "Ansh Tyagi", coins: -6, amount: 0, type: "spend", source: "generate", status: "completed", createdAt: ago(5) },
      { id: "t4", userId: "u1", userName: "Ansh Tyagi", coins: -10, amount: 0, type: "spend", source: "unlock", status: "completed", createdAt: ago(4) },
      { id: "t5", userId: "u5", userName: "Karan Singh", coins: 300, amount: 200, type: "purchase", source: "payment", status: "completed", createdAt: ago(40) },
      { id: "t6", userId: "u5", userName: "Karan Singh", coins: 300, amount: 200, type: "purchase", source: "payment", status: "completed", createdAt: ago(20) },
      { id: "t7", userId: "u3", userName: "Raj Mehta", coins: 130, amount: 100, type: "purchase", source: "payment", status: "completed", createdAt: ago(15) },
      { id: "t8", userId: "u2", userName: "Priya Sharma", coins: 6, amount: 0, type: "refund", source: "generate", status: "completed", createdAt: ago(1) },
      { id: "t9", userId: "u4", userName: "Neha Kapoor", coins: 60, amount: 50, type: "purchase", source: "payment", status: "failed", createdAt: ago(6) },
    ],
    pricing: {
      generateCost: 6,
      unlockCost: 10,
      downloadCost: 19,
      bundleCost: 29,
      freeCoins: 20,
    },
    reports: [
      { id: "r1", songId: "s3", songTitle: "Apology Track", userId: "u4", userName: "Neha Kapoor", reason: "Inappropriate content", status: "pending", createdAt: ago(1) },
      { id: "r2", songId: "s5", songTitle: "Thank You Papa", userId: "u7", userName: "Dev Patel", reason: "Spam / low quality", status: "pending", createdAt: ago(0) },
    ],
  };
}

export function getAdminStore() {
  return global.adminStore;
}
