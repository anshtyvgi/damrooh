"use client";

import Link from "next/link";
import { useStore } from "@/stores/useStore";
import { Music2, Heart, Globe, ArrowRight, TrendingUp } from "lucide-react";

const quickActions = [
  { emoji: "🎂", label: "Birthday song", mood: "happy", genre: "pop" },
  { emoji: "💕", label: "Love song", mood: "romantic", genre: "bollywood" },
  { emoji: "🙏", label: "Thank you", mood: "nostalgic", genre: "acoustic" },
  { emoji: "🥺", label: "Apology", mood: "bittersweet", genre: "lofi" },
];

const trendingCreations = [
  { title: "Birthday Surprise for Aman", plays: "2.4k", color: "from-amber-400 to-orange-500" },
  { title: "Forever & Always — Neha", plays: "1.8k", color: "from-pink-400 to-rose-500" },
  { title: "Thank You Maa", plays: "3.1k", color: "from-emerald-400 to-teal-500" },
];

export default function DashboardPage() {
  const coins = useStore((s) => s.coins);
  const generations = useStore((s) => s.generations);

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto">
      {/* Welcome header with token display */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:Poppins]">
            Welcome back <span className="gradient-text">✨</span>
          </h1>
          <p className="text-text-secondary mt-1">What will you create today?</p>
        </div>

        {/* Token badge — gamified */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm"
        >
          <div className="w-10 h-10 rounded-full token-coin flex items-center justify-center">
            <span className="text-lg">🪙</span>
          </div>
          <div>
            <p className="text-lg font-bold text-text font-[family-name:Poppins]">{coins}</p>
            <p className="text-[11px] text-amber-600 font-medium">TOKENS</p>
          </div>
          <Link href="/coins">
            <div
              className="ml-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center cursor-pointer shadow-md hover:scale-110 active:scale-90 transition-transform"
            >
              <span className="text-white text-lg font-bold">+</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Two primary action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div>
          <Link href="/studio">
            <div
              className="rounded-3xl mesh-gradient-card border border-border p-7 h-full cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center mb-5">
                <Music2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold font-[family-name:Poppins] mb-2">Studio Mode</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">
                Create a studio-ready song from scratch. Just describe how you feel.
              </p>
              <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                Start creating
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        <div>
          <Link href="/dedicate">
            <div
              className="rounded-3xl mesh-gradient-card border border-border p-7 h-full cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-violet-500" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400/20 to-violet-400/20 flex items-center justify-center mb-5">
                <Heart className="w-7 h-7 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold font-[family-name:Poppins] mb-2">Dedicate a Song</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">
                Make someone&apos;s day with a personalized song they&apos;ll never forget.
              </p>
              <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold">
                Start dedicating
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div
        className="mb-8"
      >
        <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-3">Quick create</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <Link key={action.label} href="/dedicate">
              <div
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-bg-card border border-border shadow-sm cursor-pointer whitespace-nowrap hover:border-accent/30 hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <span className="text-xl">{action.emoji}</span>
                <span className="text-sm font-medium text-text">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending + Community */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending */}
        <div
          className="rounded-3xl bg-bg-card border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-coral" />
            <p className="text-sm font-semibold text-text">Trending Now</p>
          </div>
          <div className="space-y-3">
            {trendingCreations.map((item, i) => (
              <div
                key={item.title}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface hover:translate-x-1 transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                  <span className="text-white text-lg font-bold">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{item.title}</p>
                  <p className="text-xs text-text-muted">{item.plays} plays</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                  <span className="text-xs">▶</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community banner */}
        <div>
          <Link href="/community">
            <div
              className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-7 h-full cursor-pointer relative overflow-hidden hover:-translate-y-1 transition-transform"
            >
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

              <div className="relative z-10">
                <Globe className="w-8 h-8 text-white/80 mb-4" />
                <h3 className="text-xl font-bold text-white font-[family-name:Poppins] mb-2">
                  Explore Community
                </h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  Discover songs others are creating. Get inspired. Share yours.
                </p>
                <div className="flex items-center gap-2 text-white text-sm font-semibold">
                  Browse feed
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* Fake avatars */}
                <div className="flex -space-x-2 mt-6">
                  {["🧑", "👩", "👨", "👧", "🧔"].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-indigo-500 text-sm">
                      {emoji}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-indigo-500 text-xs text-white font-bold">
                    +99
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
