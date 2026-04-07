"use client";

import type { DedicationInput } from "@/types";

export interface LyricOption {
  title: string;
  vibe: string;
  lyrics: string;
  tags: string;
}

export interface LyricsResponse {
  status: "lyrics-ready";
  options: LyricOption[];
}

export interface GenerateMusicResponse {
  id: string;
  status: string;
  tracks: { id: string; status: string; title: string; lyrics: string }[];
}

export interface StatusResponse {
  id: string;
  status: "processing" | "completed" | "failed";
  posterUrl: string | null;
  tracks: {
    id: string;
    status: "pending" | "processing" | "completed" | "failed";
    audioUrl: string | null;
    lyrics?: string;
    title?: string;
  }[];
}

// Step 1: Generate 3 lyric options
export async function generateLyrics(input: DedicationInput): Promise<LyricsResponse> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Lyrics generation failed");
  }

  return response.json();
}

// Step 2: Generate music from selected lyrics
export async function generateMusic(params: {
  lyrics: string[];
  tags: string[];
  titles: string[];
  vibes: string[];
  recipientName: string;
  occasion: string;
  mood: string;
  genre: string;
}): Promise<GenerateMusicResponse> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, action: "generate-music" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Music generation failed");
  }

  return response.json();
}

export async function pollStatus(generationId: string): Promise<StatusResponse> {
  const response = await fetch(`/api/status?id=${generationId}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Status check failed");
  }
  return response.json();
}

export function startPolling(
  generationId: string,
  onUpdate: (data: StatusResponse) => void,
  onError: (error: Error) => void,
  intervalMs = 5000
): () => void {
  let stopped = false;

  const poll = async () => {
    if (stopped) return;
    try {
      const data = await pollStatus(generationId);
      onUpdate(data);
      if (data.status === "completed" || data.status === "failed") return;
      setTimeout(poll, intervalMs);
    } catch (err) {
      if (!stopped) onError(err instanceof Error ? err : new Error("Polling failed"));
    }
  };

  poll();
  return () => { stopped = true; };
}
