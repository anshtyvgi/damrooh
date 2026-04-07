"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DiscPlayer } from "@/components/player/DiscPlayer";
import { Heart, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DedicationData {
  id: string;
  recipientName: string;
  occasion: string;
  mood: string;
  message: string;
  creatorName: string;
  posterUrl: string | null;
  audioUrl: string | null;
  isPaid: boolean;
}

export default function DedicationPage() {
  const params = useParams();
  const id = params.id as string;
  const [dedication, setDedication] = useState<DedicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDedication() {
      try {
        const res = await fetch(`/api/share?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setDedication({
            id: data.id,
            recipientName: data.recipientName,
            occasion: data.occasion,
            mood: data.mood,
            message: data.message,
            creatorName: data.creatorName || "A friend",
            posterUrl: data.posterUrl,
            audioUrl: data.audioUrl,
            isPaid: data.isPaid,
          });
        }
      } catch (err) {
        console.error("Failed to load dedication:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDedication();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!dedication) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-center px-6">
        <div>
          <p className="text-3xl mb-4">🎵</p>
          <h2 className="text-xl font-bold font-[family-name:Poppins] mb-2">Damrooh not found</h2>
          <p className="text-text-secondary mb-6">This dedication may have expired or doesn&apos;t exist.</p>
          <Link href="/login">
            <Button>Create your own Damrooh</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-accent/[0.04] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-pink-500/[0.04] blur-[100px]" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className="max-w-md w-full text-center space-y-8"
        >
          {/* From label */}
          <p
            className="text-text-secondary text-sm"
          >
            A Damrooh from <span className="text-text font-medium">{dedication.creatorName}</span>
          </p>

          {/* Poster / Visual */}
          <div
            className="rounded-3xl aspect-square bg-gradient-to-br from-pink-50 to-rose-50 border border-border flex items-center justify-center overflow-hidden mx-auto max-w-[320px]"
          >
            <div className="text-center p-8">
              <div className="animate-pulse">
                <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              </div>
              <p className="text-3xl font-bold font-[family-name:Poppins] gradient-text">
                {dedication.recipientName}
              </p>
              <p className="text-text-secondary text-sm mt-2 capitalize">{dedication.occasion}</p>
            </div>
          </div>

          {/* Message */}
          {dedication.message && (
            <div
              className="rounded-2xl glass p-6"
            >
              <p className="text-text italic leading-relaxed">
                &quot;{dedication.message}&quot;
              </p>
            </div>
          )}

          {/* Player */}
          {dedication.audioUrl && (
            <div>
              <DiscPlayer
                audioUrl={dedication.audioUrl}
                trackNumber={1}
                isPaid={dedication.isPaid}
              />
            </div>
          )}

          {!dedication.audioUrl && (
            <div
              className="rounded-2xl glass p-6 text-center"
            >
              <p className="text-text-muted text-sm">Audio preview not available</p>
            </div>
          )}

          {/* CTA - Viral loop */}
          <div
            className="pt-4 space-y-4"
          >
            <Link href="/login">
              <Button size="lg" fullWidth>
                <Sparkles className="w-5 h-5" />
                Make a Damrooh for someone you love
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-[8px]">D</span>
              </div>
              <span className="text-text-muted text-xs">damrooh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
