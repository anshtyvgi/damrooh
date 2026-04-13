/**
 * Damrooh In-Memory Database
 *
 * Implements the four core tables:
 *   users · generation_sessions · songs · transactions
 *
 * Drop-in replacement path:
 *   Swap each store's Map operations for Prisma client calls
 *   and remove the global declarations.
 */

import type {
  MusicModel,
  GenerationMode,
  ModelSelection,
  LyricVariation,
  SessionTrack,
  SessionStatus,
  QueueJob,
} from "@/types";

// ─── Row shapes ─────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSession {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSong {
  id: string;
  sessionId: string;
  userId?: string;
  title: string;
  mode: GenerationMode;
  model: MusicModel;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  lyrics?: string;
  tags: string[];
  isPublic: boolean;
  plays: number;
  shares: number;
  createdAt: Date;
}

export interface DbTransaction {
  id: string;
  userId: string;
  coins: number;
  amountPaise?: number;
  type: "purchase" | "spend" | "refund" | "bonus";
  source: string;
  status: "completed" | "pending" | "failed";
  createdAt: Date;
}

// ─── Global singleton ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __damroohDb:
    | {
        users: Map<string, DbUser>;
        sessions: Map<string, DbSession>;
        songs: Map<string, DbSong>;
        transactions: Map<string, DbTransaction>;
        queue: Map<string, QueueJob>;
      }
    | undefined;
}

function getDb() {
  if (!global.__damroohDb) {
    global.__damroohDb = {
      users: new Map(),
      sessions: new Map(),
      songs: new Map(),
      transactions: new Map(),
      queue: new Map(),
    };
  }
  return global.__damroohDb;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const Users = {
  create(data: Omit<DbUser, "createdAt" | "updatedAt">): DbUser {
    const now = new Date();
    const row: DbUser = { ...data, createdAt: now, updatedAt: now };
    getDb().users.set(row.id, row);
    return row;
  },

  findById(id: string): DbUser | undefined {
    return getDb().users.get(id);
  },

  update(id: string, data: Partial<DbUser>): DbUser | undefined {
    const existing = getDb().users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    getDb().users.set(id, updated);
    return updated;
  },

  count(): number {
    return getDb().users.size;
  },
};

// ─── Sessions ────────────────────────────────────────────────────────────────

export const Sessions = {
  create(data: Omit<DbSession, "createdAt" | "updatedAt">): DbSession {
    const now = new Date();
    const row: DbSession = { ...data, createdAt: now, updatedAt: now };
    getDb().sessions.set(row.id, row);
    return row;
  },

  findById(id: string): DbSession | undefined {
    return getDb().sessions.get(id);
  },

  update(id: string, data: Partial<DbSession>): DbSession | undefined {
    const existing = getDb().sessions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    getDb().sessions.set(id, updated);
    return updated;
  },

  list(filter?: {
    mode?: GenerationMode;
    userId?: string;
    limit?: number;
    offset?: number;
  }): DbSession[] {
    let rows = Array.from(getDb().sessions.values());
    if (filter?.mode) rows = rows.filter((s) => s.mode === filter.mode);
    if (filter?.userId) rows = rows.filter((s) => s.userId === filter.userId);
    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? rows.length;
    return rows.slice(offset, offset + limit);
  },

  count(): number {
    return getDb().sessions.size;
  },
};

// ─── Songs ───────────────────────────────────────────────────────────────────

export const Songs = {
  create(data: Omit<DbSong, "createdAt">): DbSong {
    const row: DbSong = { ...data, createdAt: new Date() };
    getDb().songs.set(row.id, row);
    return row;
  },

  findById(id: string): DbSong | undefined {
    return getDb().songs.get(id);
  },

  update(id: string, data: Partial<DbSong>): DbSong | undefined {
    const existing = getDb().songs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    getDb().songs.set(id, updated);
    return updated;
  },

  list(filter?: {
    isPublic?: boolean;
    mode?: GenerationMode;
    userId?: string;
    limit?: number;
    offset?: number;
  }): DbSong[] {
    let rows = Array.from(getDb().songs.values());
    if (filter?.isPublic !== undefined)
      rows = rows.filter((s) => s.isPublic === filter.isPublic);
    if (filter?.mode) rows = rows.filter((s) => s.mode === filter.mode);
    if (filter?.userId) rows = rows.filter((s) => s.userId === filter.userId);
    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? rows.length;
    return rows.slice(offset, offset + limit);
  },

  count(): number {
    return getDb().songs.size;
  },
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const Transactions = {
  create(data: Omit<DbTransaction, "createdAt">): DbTransaction {
    const row: DbTransaction = { ...data, createdAt: new Date() };
    getDb().transactions.set(row.id, row);
    return row;
  },

  findByUserId(userId: string): DbTransaction[] {
    return Array.from(getDb().transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  count(): number {
    return getDb().transactions.size;
  },
};

// ─── Queue ───────────────────────────────────────────────────────────────────

export const Queue = {
  enqueue(job: Omit<QueueJob, "createdAt">): QueueJob {
    const row: QueueJob = { ...job, createdAt: new Date().toISOString() };
    getDb().queue.set(row.id, row);
    return row;
  },

  findById(id: string): QueueJob | undefined {
    return getDb().queue.get(id);
  },

  update(id: string, data: Partial<QueueJob>): QueueJob | undefined {
    const existing = getDb().queue.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    getDb().queue.set(id, updated);
    return updated;
  },

  stats(): { queued: number; running: number; done: number; failed: number } {
    const jobs = Array.from(getDb().queue.values());
    return {
      queued: jobs.filter((j) => j.status === "queued").length,
      running: jobs.filter((j) => j.status === "running").length,
      done: jobs.filter((j) => j.status === "done").length,
      failed: jobs.filter((j) => j.status === "failed").length,
    };
  },

  count(): number {
    return getDb().queue.size;
  },
};

// ─── Health ───────────────────────────────────────────────────────────────────

export function dbHealthCheck(): {
  status: "ok" | "error";
  stats: Record<string, number>;
} {
  try {
    const db = getDb();
    return {
      status: "ok",
      stats: {
        users: db.users.size,
        sessions: db.sessions.size,
        songs: db.songs.size,
        transactions: db.transactions.size,
        queueJobs: db.queue.size,
      },
    };
  } catch {
    return { status: "error", stats: {} };
  }
}
