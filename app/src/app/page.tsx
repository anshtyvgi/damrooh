"use client";

import Link from "next/link";
import {
  ArrowRight, Play, Zap, Heart, Music, Sparkles,
  Shuffle, Lock, ChevronRight, Star, Quote,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { COIN_COSTS } from "@/types";

/* ─── ticker items ─── */
const tickerItems = [
  "Birthday songs 🎂", "Love dedications 💕", "Apology tracks 🥺",
  "Anniversary surprises 💍", "Friendship anthems 🤝", "Farewell songs 👋",
  "Proposal vibes 💎", "Thank you melodies 🙏", "Custom creations ✨",
  "Savage breakup hits 😈", "Miss you tracks 💭", "Graduation songs 🎓",
];

const tickerItems2 = [
  "Bollywood 🇮🇳", "Pop ⚡", "Lo-fi 🌙", "R&B 🎤", "Hip-hop 🔥",
  "Classical 🎻", "Acoustic 🎸", "Hinglish 🫶", "Punjabi 💪",
  "Romantic 🥰", "Energetic ⚡", "Nostalgic 🥺",
];

const testimonialRow1 = [
  { name: "Ansh", handle: "@ansh_creates", text: "Made a birthday song for my sister. She literally cried. Best ₹29 I ever spent.", avatar: "🧑‍🎤", bg: "bg-yellow-100" },
  { name: "Priya", handle: "@priya_music", text: "My parents' 25th anniversary gift was a Damrooh. They play it every morning now 😭", avatar: "👩‍🎨", bg: "bg-pink-100" },
  { name: "Raj", handle: "@raj_beats", text: "Sent an apology song to my gf. She forgave me in 10 seconds. The song did what 100 texts couldn't.", avatar: "🧑‍💻", bg: "bg-violet-100" },
  { name: "Neha", handle: "@neha_vibes", text: "I use Studio mode to make tracks for my reels. The quality is insane for the price.", avatar: "👩‍🦱", bg: "bg-emerald-100" },
  { name: "Karan", handle: "@karan_damrooh", text: "Proposed with a custom song. She said YES before the chorus even hit 💍", avatar: "🧑‍🚀", bg: "bg-orange-100" },
  { name: "Simran", handle: "@sim_melodies", text: "Made a farewell song for my best friend moving abroad. We both cried at the airport.", avatar: "👩‍🎤", bg: "bg-cyan-100" },
];

const testimonialRow2 = [
  { name: "Arjun", handle: "@arjun.wav", text: "My mom cried when she heard the thank you song I made. She keeps it as her alarm now 🥹", avatar: "🧑‍🦰", bg: "bg-rose-100" },
  { name: "Meera", handle: "@meera_sings", text: "Better than any gift I've ever given. My boyfriend plays it on repeat in the car.", avatar: "👩‍🦳", bg: "bg-amber-100" },
  { name: "Rohit", handle: "@rohit_hype", text: "Made a savage breakup track as a joke. Now my friends want one for themselves 😂", avatar: "🧔", bg: "bg-red-100" },
  { name: "Aanya", handle: "@aanya_vibes", text: "Used it for my brother's graduation. The whole family was in tears. Absolute masterpiece.", avatar: "👧", bg: "bg-indigo-100" },
  { name: "Vikram", handle: "@vik_music", text: "Three songs for ₹6? This is insane. Each one sounded completely different and unique.", avatar: "🧑‍💼", bg: "bg-teal-100" },
  { name: "Diya", handle: "@diya_damrooh", text: "Made a friendship anthem for my hostel group. We play it every night before sleep 🫶", avatar: "👩", bg: "bg-lime-100" },
];

const ugcVideos = [
  { title: "She heard her birthday song", reaction: "😭", gradient: "from-rose-400 to-pink-500", views: "2.4M" },
  { title: "Proposal song reaction", reaction: "💍", gradient: "from-violet-400 to-indigo-500", views: "5.1M" },
  { title: "Parents anniversary surprise", reaction: "🥺", gradient: "from-amber-400 to-orange-500", views: "1.8M" },
  { title: "Apology song — she forgave me", reaction: "😅", gradient: "from-emerald-400 to-cyan-500", views: "3.2M" },
  { title: "Best friend farewell — airport", reaction: "💔", gradient: "from-sky-400 to-blue-500", views: "1.2M" },
  { title: "Graduation song for my son", reaction: "🎓", gradient: "from-green-400 to-emerald-500", views: "890K" },
  { title: "Breakup savage track went viral", reaction: "🔥", gradient: "from-red-400 to-orange-500", views: "4.7M" },
  { title: "Teacher's day dedication", reaction: "🙏", gradient: "from-purple-400 to-violet-500", views: "670K" },
];

/* ─── Hero card data ─── */
const heroCards = [
  { name: "Ayesha", tag: "For Ayesha 💕", occasion: "Love", genre: "Bollywood", title: "You Are My\nUniverse", lyrics: "tere bina ye dil mera\nkuch bhi nahi kehta...", gradient: "from-rose-400 via-pink-500 to-violet-600" },
  { name: "Meera", tag: "For Meera 🎂", occasion: "Birthday", genre: "Pop", title: "Happy Birthday\nSuperstar", lyrics: "aaj ka din hai tera\nchaa gayi khushiyan...", gradient: "from-amber-400 via-orange-500 to-rose-500" },
  { name: "Papa", tag: "For Papa 🙏", occasion: "Thank You", genre: "Acoustic", title: "Thank You\nFor Everything", lyrics: "har kadam pe saath diya\nhonsla badhaya...", gradient: "from-sky-400 via-blue-500 to-indigo-600" },
  { name: "Bro", tag: "For Bro 🤝", occasion: "Friendship", genre: "Hip-hop", title: "Brothers\nForever", lyrics: "yaari dosti ka band\ntod na sake koi...", gradient: "from-emerald-400 via-teal-500 to-cyan-600" },
];

const burstEmojis = ["🪩", "🐝", "🎵", "🎧", "💃", "🎶", "✨", "🔥", "💕"];
const burstSizes = ["text-lg", "text-2xl", "text-3xl", "text-4xl", "text-xl"];

function HeroCardCarousel() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [swipeDir, setSwipeDir] = useState<"left" | "right">("left");
  const [progress, setProgress] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; emoji: string; x: number; size: string; delay: number }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstIdRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const advance = useCallback((dir: "left" | "right" = "left") => {
    setSwipeDir(dir);
    setPrev(active);
    setActive((p) => dir === "left" ? (p + 1) % heroCards.length : (p - 1 + heroCards.length) % heroCards.length);
    setProgress(0);
  }, [active]);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => advance("left"), 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [advance]);

  // Progress tick
  useEffect(() => {
    progressRef.current = setInterval(() => setProgress((p) => Math.min(p + 0.5, 100)), 20);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [active]);

  // Buzz sound
  const playBuzz = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      // White noise buzz
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 200;
      filter.Q.value = 2;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      source.stop(ctx.currentTime + 0.06);
    } catch {}
  };

  // Emoji burst from disc position (bottom-left), flowing upward
  const spawnBursts = () => {
    const newBursts = Array.from({ length: 8 }, (_, i) => {
      burstIdRef.current++;
      return {
        id: burstIdRef.current,
        emoji: burstEmojis[Math.floor(Math.random() * burstEmojis.length)],
        x: 5 + Math.random() * 25, // cluster near bottom-left disc area
        size: burstSizes[Math.floor(Math.random() * burstSizes.length)],
        delay: i * 0.06,
      };
    });
    setBursts((p) => [...p, ...newBursts]);
    setTimeout(() => setBursts((p) => p.filter((b) => !newBursts.some((n) => n.id === b.id))), 1800);
  };

  const handleTap = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => advance("left"), 4000);
    advance("left");
    playBuzz();
    spawnBursts();
    try { if ("vibrate" in navigator) navigator.vibrate([10, 20, 10]); } catch {}
  };

  // Swipe detection
  const touchStartRef = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(diff) > 50) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => advance("left"), 4000);
      advance(diff < 0 ? "left" : "right");
      playBuzz();
      spawnBursts();
    }
  };

  const card = heroCards[active];
  const prevCard = prev >= 0 ? heroCards[prev] : null;

  return (
    <div onClick={handleTap} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      className="relative rounded-[32px] bg-[#FFC629] p-8 sm:p-10 flex items-center justify-center overflow-hidden min-h-[500px] fade-in cursor-pointer select-none"
      style={{ animationDelay: "0.1s" }}>
      <div className="absolute inset-0 grid-bg-dark opacity-30" />

      {/* Floating stickers */}
      <div className="absolute top-5 left-6 text-3xl" style={{ transform: "rotate(-12deg)" }}>💕</div>
      <div className="absolute top-8 right-10 text-2xl" style={{ transform: "rotate(8deg)" }}>✨</div>
      <div className="absolute bottom-8 left-8 text-3xl" style={{ transform: "rotate(-6deg)" }}>🎵</div>
      <div className="absolute bottom-12 right-6 text-2xl">🎤</div>

      {/* Doodle arrow — "tap here" */}
      <div className="absolute top-14 right-6 z-20 flex flex-col items-center gap-0.5" style={{ transform: "rotate(15deg)" }}>
        <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
          <path d="M12 2C12 2 5 12 5 18C5 23 8 28 12 34M12 34C16 28 19 23 19 18C19 12 12 2 12 2M12 34L9 28M12 34L15 28" stroke="#111" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-[9px] font-bold text-[#111]/40">tap</span>
      </div>

      {/* Emoji bursts — from disc, flowing up */}
      {bursts.map((b) => (
        <div key={b.id} className={`absolute z-30 pointer-events-none emoji-float ${b.size}`}
          style={{ left: `${b.x}%`, bottom: "10%", animationDelay: `${b.delay}s` }}>
          {b.emoji}
        </div>
      ))}

      <div className="relative w-full max-w-[340px] z-10 h-[440px]">
        {/* Lyrics card */}
        <div className="absolute -top-4 -right-2 w-[80%] rounded-2xl bg-white/80 backdrop-blur-sm p-4 border border-white shadow-lg z-20 transition-all duration-500"
          style={{ transform: `rotate(4deg)` }}>
          <p className="text-[#555] text-sm italic leading-relaxed">&quot;{card.lyrics}&quot;</p>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[10px] text-[#999]">AI lyrics</span>
          </div>
        </div>

        {/* Card stack — previous card behind */}
        {prevCard && (
          <div className={`absolute inset-0 top-8 rounded-3xl bg-white shadow-lg overflow-hidden z-0 card-exit-${swipeDir}`}
            style={{ transform: "scale(0.92) rotate(-1deg)", opacity: 0.5 }}>
            <div className={`aspect-[3/4] bg-gradient-to-br ${prevCard.gradient}`} />
          </div>
        )}

        {/* Upcoming card peek */}
        <div className="absolute inset-0 top-8 rounded-3xl bg-white/40 shadow-sm overflow-hidden z-0"
          style={{ transform: "scale(0.88) rotate(1deg) translateX(12px)", opacity: 0.3 }}>
          <div className={`aspect-[3/4] bg-gradient-to-br ${heroCards[(active + 1) % heroCards.length].gradient}`} />
        </div>

        {/* Main poster card — swipe animation */}
        <div className={`absolute inset-0 top-8 rounded-3xl bg-white shadow-2xl overflow-hidden z-10 card-enter-${swipeDir}`}
          key={active}>
          <div className={`aspect-[3/4] bg-gradient-to-br ${card.gradient} relative flex flex-col justify-end p-6`}>
            <div className="absolute inset-0 banner-overlay opacity-40" />
            <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-sm border border-white/30">
              <span className="text-white text-xs font-semibold">{card.tag}</span>
            </div>
            <div className="relative z-10">
              <p className="text-white/60 text-xs uppercase tracking-wider font-medium">{card.occasion} &middot; {card.genre}</p>
              <p className="text-white font-bold text-2xl mt-1 leading-tight whitespace-pre-line">{card.title}</p>
            </div>
          </div>

          {/* Player bar */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
            <div className="flex-1 h-1 rounded-full bg-black/[0.06]">
              <div className="h-full rounded-full bg-[#FFC629] transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] text-[#999] font-medium">0:10</span>
          </div>
        </div>

        {/* Disc — rotating with dot */}
        <div className="absolute -bottom-1 -left-6 w-[90px] h-[90px] rounded-full bg-white border border-black/[0.06] shadow-xl flex items-center justify-center z-20">
          <div className="w-[65px] h-[65px] rounded-full bg-[#111] flex items-center justify-center relative disc-spin">
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <div className="absolute inset-4 rounded-full border border-white/[0.06]" />
            <div className="w-4 h-4 rounded-full bg-[#FFC629]" />
            <div className="absolute w-2 h-2 rounded-full bg-[#FFC629]" style={{ top: "6px", right: "10px" }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/20" style={{ bottom: "8px", left: "12px" }} />
          </div>
        </div>

        {/* Card indicator dots */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {heroCards.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? "w-5 bg-[#111]" : "w-1.5 bg-[#111]/20"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-black/[0.06] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-[#FAFAFA] transition-colors">
        <span className="text-sm font-semibold text-[#111] pr-4">{q}</span>
        <span className={`text-[#999] text-xl transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-[#666] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [activeMood, setActiveMood] = useState(1);
  const [activePerson, setActivePerson] = useState(0);

  return (
    <div className="min-h-screen bg-[#FAFAF7] relative overflow-hidden">
      {/* ═══ ANNOUNCEMENT BAR ═══ */}
      <div className="announcement-bar py-2 px-4 text-center relative z-[60]">
        <p className="text-sm font-semibold text-[#111]">
          🎧 First song is FREE — no card needed &nbsp;
          <Link href="/dedicate" className="underline font-bold">Create now &rarr;</Link>
        </p>
      </div>

      {/* ═══ NAVBAR ═══ */}
      <nav className="sticky top-0 z-50 px-6 py-3.5 bg-[#FAFAF7]/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFC629] flex items-center justify-center">
              <span className="text-[#111] font-black text-sm">D</span>
            </div>
            <span className="text-xl font-extrabold text-text">damrooh</span>
          </Link>

          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-sm">
              <Link href="/studio" className="px-4 py-2 rounded-full text-sm text-text-secondary hover:text-text hover:bg-black/[0.03] transition-all">Studio</Link>
              <Link href="/dedicate" className="px-4 py-2 rounded-full text-sm text-text-secondary hover:text-text hover:bg-black/[0.03] transition-all">Dedicate</Link>
              <a href="#pricing" className="px-4 py-2 rounded-full text-sm text-text-secondary hover:text-text hover:bg-black/[0.03] transition-all">Pricing</a>
              <Link href="/login" className="px-4 py-2 rounded-full text-sm text-text-secondary hover:text-text hover:bg-black/[0.03] transition-all">Login</Link>
            </div>
          </div>

          <Link href="/dedicate">
            <button className="px-5 py-2.5 rounded-full bg-[#111] text-white text-sm font-semibold hover:bg-[#333] transition-colors cursor-pointer flex items-center gap-2">
              Create a Song <Sparkles className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </nav>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative pt-10 pb-4 px-6 hero-mesh grid-bg">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[70vh]">
            {/* LEFT */}
            <div className="relative rounded-[32px] bg-white border border-black/[0.06] p-10 sm:p-14 flex flex-col justify-center overflow-hidden fade-in">
              <div className="doodle-star absolute top-8 right-10 w-6 h-6" />
              <div className="doodle-heart absolute bottom-12 right-16 w-5 h-5" />
              <div className="doodle-circle absolute top-24 right-6 w-8 h-8" />
              <div className="absolute top-6 right-32 text-3xl">🔥</div>
              <div className="absolute bottom-8 right-8 text-2xl">🎧</div>

              <h1 className="text-[48px] sm:text-[68px] lg:text-[76px] font-extrabold leading-[0.95] tracking-tight">
                Make a<br />song for<br />
                <span className="relative inline-block">
                  someone.
                  <span className="doodle-underline absolute -bottom-2 left-0" />
                </span>
              </h1>

              <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-[380px]">
                Not a text. Not a reel.<br />
                A full song with their name on it.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dedicate">
                  <button className="px-7 py-4 rounded-2xl bg-[#FFC629] text-[#111] font-bold text-base hover:bg-[#FFD04D] transition-all cursor-pointer flex items-center gap-2.5 shadow-[0_8px_32px_rgba(255,198,41,0.3)]">
                    <Music className="w-5 h-5" />
                    Dedicate Now
                  </button>
                </Link>
                <Link href="/studio">
                  <button className="px-7 py-4 rounded-2xl bg-white text-text font-semibold text-base border-2 border-black/[0.08] hover:border-black/20 transition-all cursor-pointer flex items-center gap-2.5">
                    <Zap className="w-5 h-5" />
                    Try Studio
                  </button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["🧑‍🎤", "👩‍🎨", "🧑‍💻", "👩‍🦱"].map((emoji, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-[#FFC629]/30 border-2 border-white flex items-center justify-center text-sm">{emoji}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 text-[#FFC629] fill-[#FFC629]" />)}
                  </div>
                  <span className="text-xs text-[#999]">12k+ songs created today</span>
                </div>
              </div>
            </div>

            {/* RIGHT — Interactive card carousel */}
            <HeroCardCarousel />
          </div>
        </div>
      </section>

      {/* ═══ TICKER 1 ═══ */}
      <div className="py-5 border-y border-black/[0.04] bg-white">
        <div className="ticker-wrap">
          <div className="ticker-content">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-semibold text-[#555] whitespace-nowrap">
                {item}<span className="w-1.5 h-1.5 rounded-full bg-[#FFC629]" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 2. DEDICATION FLOW ═══ */}
      <section className="relative py-24 px-6 dot-bg">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <p className="text-sm font-bold text-[#FFC629] uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Takes 10 seconds.<br />
              <span className="relative inline-block">Hits forever.<span className="doodle-underline absolute -bottom-2 left-0" /></span>
            </h2>
          </div>

          <div className="max-w-lg mx-auto scroll-reveal">
            <div className="rounded-[32px] bg-white border border-black/[0.06] shadow-xl overflow-hidden">
              <div className="p-8 space-y-6">
                <div>
                  <p className="text-xs font-bold text-[#999] uppercase tracking-widest mb-4">Who&apos;s it for?</p>
                  <div className="flex gap-2">
                    {[{ emoji: "💕", label: "Partner" }, { emoji: "😈", label: "Crush" }, { emoji: "👀", label: "Ex" }, { emoji: "🤝", label: "Friend" }, { emoji: "🙏", label: "Parent" }].map((p, i) => (
                      <button key={p.label} onClick={() => setActivePerson(i)} className={`flex-1 flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all cursor-pointer ${activePerson === i ? "bg-[#FFC629] text-[#111] shadow-lg font-bold" : "bg-[#F5F5F0] text-text hover:bg-[#EDEDEA]"}`}>
                        <span className="text-xl">{p.emoji}</span>
                        <span className="text-[10px] font-semibold">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#999] uppercase tracking-widest mb-4">Pick a mood</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ label: "Romantic", emoji: "🥰" }, { label: "Savage", emoji: "😈" }, { label: "Funny", emoji: "😂" }, { label: "Nostalgic", emoji: "🥺" }, { label: "Energetic", emoji: "⚡" }].map((mood, i) => (
                      <button key={mood.label} onClick={() => setActiveMood(i)} className={`px-4 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all flex items-center gap-1.5 ${activeMood === i ? "bg-[#FFC629] text-[#111] shadow-md font-bold" : "bg-[#F5F5F0] text-[#666] hover:bg-[#EDEDEA]"}`}>
                        <span>{mood.emoji}</span> {mood.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#999] uppercase tracking-widest mb-4">Add a name</p>
                  <input type="text" placeholder="e.g. Priya, Bro, Papa..." className="w-full px-5 py-4 rounded-2xl bg-[#F5F5F0] text-text placeholder:text-[#BBB] text-base focus:outline-none focus:ring-2 focus:ring-[#FFC629]/40 border-0" />
                </div>
              </div>
              <div className="px-8 py-6 bg-[#FFF8E1] border-t border-[#FFC629]/20 flex items-center gap-3">
                <button className="w-12 h-12 rounded-2xl bg-white border border-black/[0.08] flex items-center justify-center hover:bg-[#F5F5F0] transition-colors cursor-pointer">
                  <Shuffle className="w-5 h-5 text-[#999]" />
                </button>
                <Link href="/dedicate" className="flex-1">
                  <button className="w-full py-4 rounded-2xl bg-[#111] text-white font-bold text-base hover:bg-[#333] transition-colors cursor-pointer flex items-center justify-center gap-2.5">
                    <Heart className="w-5 h-5" /> Dedicate <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white border border-black/[0.06] shadow-sm text-sm">
                <span className="text-[#666]">🎵 3 songs</span>
                <span className="w-1 h-1 rounded-full bg-[#DDD]" />
                <span className="text-[#666]">🖼️ Poster</span>
                <span className="w-1 h-1 rounded-full bg-[#DDD]" />
                <span className="text-[#666]">📝 Lyrics</span>
                <span className="w-1 h-1 rounded-full bg-[#DDD]" />
                <span className="text-[#FFC629] font-bold">FREE first song</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. OUTPUT PREVIEW ═══ */}
      <section className="relative py-24 px-6 mesh-gradient-hero">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-[32px] bg-[#FFF4D6] p-8 sm:p-10 h-full flex items-center justify-center relative overflow-hidden scroll-reveal">
              <div className="doodle-star absolute top-6 right-8 w-6 h-6" />
              <div className="absolute bottom-6 left-6 text-2xl" style={{ transform: "rotate(-8deg)" }}>✨</div>
              <div className="w-full max-w-[320px]">
                <div className="rounded-3xl bg-white shadow-xl overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-rose-300 via-pink-400 to-violet-500 relative flex items-center justify-center">
                    <div className="absolute inset-0 banner-overlay opacity-30" />
                    <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-sm border border-white/30">
                      <span className="text-white text-xs font-semibold">For Priya</span>
                    </div>
                    <div className="relative z-10 text-center">
                      <Heart className="w-14 h-14 text-white/80 mx-auto mb-2" />
                      <p className="text-white font-bold text-2xl">Tere Liye</p>
                      <p className="text-white/50 text-sm mt-1">Romantic &middot; Bollywood</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {/* Static player UI instead of DiscPlayer component */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#333] transition-colors">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 rounded-full bg-black/[0.06]">
                          <div className="w-0 h-full rounded-full bg-[#FFC629]" />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-[#999]">0:00</span>
                          <span className="text-[10px] text-[#FFC629] font-medium">Free 10s</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F9F9F6] p-4">
                      <p className="text-[#666] text-sm italic">&quot;tere bina ye dil mera, kuch bhi nahi kehta...&quot;</p>
                    </div>
                    <Link href="/login">
                      <button className="w-full py-3.5 rounded-2xl bg-[#111] text-white font-semibold text-sm hover:bg-[#333] transition-colors cursor-pointer flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" /> Unlock full song &middot; &#8377;19
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white border border-black/[0.06] p-10 sm:p-14 flex flex-col justify-center relative overflow-hidden scroll-reveal">
              <div className="doodle-squiggle absolute top-8 right-8" />
              <p className="text-sm font-bold text-[#FFC629] uppercase tracking-widest mb-4">Trust builder</p>
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[0.95]">This is what<br />you send.</h2>
              <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-[380px]">Press play. Hear a 10-second preview. If they love it (they will), unlock the full song.</p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: "🎵", text: "3 unique tracks per dedication" },
                  { icon: "🖼️", text: "Custom poster with their name" },
                  { icon: "📝", text: "AI-written lyrics that hit different" },
                  { icon: "🔗", text: "Beautiful share link" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[#555] text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <span className="px-4 py-2 rounded-full bg-[#FFC629]/20 text-sm font-bold text-[#111] border border-[#FFC629]/30">This hits harder than a message 🔥</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER 2 ═══ */}
      <div className="py-4 bg-[#111]">
        <div className="ticker-wrap">
          <div className="ticker-content-reverse">
            {[...tickerItems2, ...tickerItems2].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-semibold text-white/60 whitespace-nowrap">
                {item}<span className="w-1.5 h-1.5 rounded-full bg-[#FFC629]" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 4. TESTIMONIALS — Ticker rows ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14 scroll-reveal">
            <p className="text-sm font-bold text-[#FFC629] uppercase tracking-widest mb-4">Love letters</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Don&apos;t take our word.<br />
              <span className="relative inline-block">Take theirs.<span className="doodle-underline absolute -bottom-2 left-0" /></span>
            </h2>
          </div>
        </div>

        {/* Row 1 — left to right */}
        <div className="ticker-wrap mb-5">
          <div className="ticker-testimonial">
            {[...testimonialRow1, ...testimonialRow1].map((t, i) => (
              <div key={i} className={`inline-flex shrink-0 w-[320px] rounded-2xl ${t.bg} p-5 border border-black/[0.04] mx-2 align-top`}>
                <div>
                  <Quote className="w-4 h-4 text-[#FFC629] mb-2" />
                  <p className="text-[#333] text-sm leading-relaxed font-medium line-clamp-3">{t.text}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm border border-black/[0.04]">{t.avatar}</div>
                    <div>
                      <p className="text-xs font-bold text-[#111]">{t.name}</p>
                      <p className="text-[10px] text-[#999]">{t.handle}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — right to left */}
        <div className="ticker-wrap">
          <div className="ticker-testimonial-reverse">
            {[...testimonialRow2, ...testimonialRow2].map((t, i) => (
              <div key={i} className={`inline-flex shrink-0 w-[320px] rounded-2xl ${t.bg} p-5 border border-black/[0.04] mx-2 align-top`}>
                <div>
                  <Quote className="w-4 h-4 text-[#FFC629] mb-2" />
                  <p className="text-[#333] text-sm leading-relaxed font-medium line-clamp-3">{t.text}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm border border-black/[0.04]">{t.avatar}</div>
                    <div>
                      <p className="text-xs font-bold text-[#111]">{t.name}</p>
                      <p className="text-[10px] text-[#999]">{t.handle}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. UGC VIDEO — Ticker ═══ */}
      <section className="relative py-24 bg-[#111] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14 scroll-reveal">
            <p className="text-sm font-bold text-[#FFC629] uppercase tracking-widest mb-4">Reactions</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">Real people.<br />Real reactions.</h2>
            <p className="text-white/40 text-lg mt-3">This is what happens when they hear their song.</p>
          </div>
        </div>

        <div className="ticker-wrap">
          <div className="ticker-ugc">
            {[...ugcVideos, ...ugcVideos].map((v, i) => (
              <div key={i} className="inline-block shrink-0 w-[220px] mx-2 align-top cursor-pointer group">
                <div className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${v.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 banner-overlay opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">{v.reaction}</span>
                      <span className="text-white/50 text-[10px]">{v.views} views</span>
                    </div>
                    <p className="text-white font-semibold text-xs leading-tight">{v.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. PRICING ═══ */}
      <section id="pricing" className="relative py-24 px-6 dot-bg">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <p className="text-sm font-bold text-[#FFC629] uppercase tracking-widest mb-4">Simple pricing</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight">No subscriptions.<br />Just coins.</h2>
            <p className="text-[#999] text-lg mt-3">1 coin = &#8377;1. That&apos;s it.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { emoji: "🎵", title: "Generate", desc: "3 unique songs", cost: COIN_COSTS.generate, bg: "bg-[#E8FFE8]" },
              { emoji: "🔓", title: "Download", desc: "Full HD song", cost: COIN_COSTS.download, bg: "bg-[#FFF4D6]", tag: "Most Popular" },
              { emoji: "💝", title: "Full Pack", desc: "Songs + poster + share", cost: COIN_COSTS.fullPack, bg: "bg-[#FFE8F0]" },
            ].map((tier) => (
              <div key={tier.title} className={`relative rounded-[28px] ${tier.bg} p-7 text-center hover:shadow-xl hover:-translate-y-2 transition-all border border-black/[0.04]`}>
                {tier.tag && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FFC629] text-[#111] text-[10px] font-black uppercase tracking-wider whitespace-nowrap">{tier.tag}</div>}
                <span className="text-5xl">{tier.emoji}</span>
                <h3 className="text-xl font-extrabold mt-4">{tier.title}</h3>
                <p className="text-[#666] text-sm mt-1">{tier.desc}</p>
                <p className="text-4xl font-black mt-5">{tier.cost} <span className="text-sm font-normal text-[#999]">coins</span></p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/coins">
              <button className="px-6 py-3 rounded-full bg-white border border-black/[0.08] text-sm font-semibold text-text hover:border-black/20 transition-colors cursor-pointer inline-flex items-center gap-2">
                View all packages <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 7. STUDIO ═══ */}
      <section className="relative py-24 px-6 mesh-gradient-2">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-[32px] bg-[#111] text-white p-10 sm:p-14 flex flex-col justify-center relative overflow-hidden grid-bg-dark scroll-reveal">
              <div className="absolute top-8 right-10 text-3xl opacity-40">⚡</div>
              <div className="absolute bottom-10 right-8 text-2xl opacity-30">🎛️</div>
              <p className="text-xs font-bold text-[#FFC629] uppercase tracking-widest mb-4">For power users</p>
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[0.95]">Want more<br />control?</h2>
              <p className="mt-6 text-lg text-white/40 leading-relaxed max-w-[380px]">Write your own vibe. Fine-tune your sound. Remix endlessly.</p>
              <div className="mt-8">
                <Link href="/studio">
                  <button className="px-7 py-4 rounded-2xl bg-[#FFC629] text-[#111] font-bold text-base hover:bg-[#FFD04D] transition-colors cursor-pointer flex items-center gap-2.5">
                    <Zap className="w-5 h-5" /> Open Studio
                  </button>
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] bg-white border border-black/[0.06] p-8 space-y-5 scroll-reveal">
              <div>
                <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Prompt</label>
                <div className="mt-3 w-full px-5 py-4 rounded-2xl bg-[#F5F5F0] text-[#555] text-sm">Dancing alone at midnight, feeling alive...</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Pop", "Energetic", "English", "Female"].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-[#111] text-white text-xs font-bold">{tag}</span>
                ))}
              </div>
              <div className="rounded-2xl bg-[#FFF4D6] p-5 border border-[#FFC629]/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center shrink-0"><Play className="w-5 h-5 text-white ml-0.5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text">Midnight Pulse</p>
                    <p className="text-xs text-[#999]">Pop &middot; Energetic</p>
                    <div className="mt-2 h-1 rounded-full bg-[#FFC629]/30"><div className="w-2/3 h-full rounded-full bg-[#FFC629]" /></div>
                  </div>
                  <span className="text-xs text-[#999] font-medium">0:42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. SHARE ═══ */}
      <section className="relative py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-[32px] bg-gradient-to-br from-[#FFC629]/30 to-[#FFE8F0] p-8 sm:p-10 flex items-center justify-center relative overflow-hidden order-2 lg:order-1 scroll-reveal">
              <div className="absolute top-6 right-8 text-2xl" style={{ transform: "rotate(12deg)" }}>💌</div>
              <div className="absolute bottom-8 left-6 text-2xl" style={{ transform: "rotate(-8deg)" }}>🔥</div>
              <div className="doodle-heart absolute top-20 left-10 w-5 h-5" />
              <div className="w-full max-w-[300px]">
                <div className="rounded-3xl bg-white shadow-xl overflow-hidden" style={{ transform: "rotate(-1deg)" }}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-pink-300 to-violet-400 relative flex items-center justify-center">
                    <div className="absolute inset-0 banner-overlay opacity-30" />
                    <div className="relative z-10 text-center">
                      <Heart className="w-10 h-10 text-white/80 mx-auto mb-2" />
                      <p className="text-white font-bold text-lg">Priya</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-[#555] text-sm italic">&quot;Ansh made this for you 💕&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center shrink-0"><Play className="w-4 h-4 text-white ml-0.5" /></div>
                      <div className="flex-1 h-1 rounded-full bg-black/[0.06]"><div className="w-1/3 h-full rounded-full bg-[#FFC629]" /></div>
                      <span className="text-[10px] text-[#999]">0:10</span>
                    </div>
                    <div className="py-3 rounded-2xl bg-[#FFC629] text-[#111] text-sm font-bold text-center">Unlock Full Song</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white border border-black/[0.06] p-10 sm:p-14 flex flex-col justify-center order-1 lg:order-2 relative overflow-hidden scroll-reveal">
              <div className="doodle-squiggle absolute top-10 right-8" />
              <p className="text-sm font-bold text-[#FFC629] uppercase tracking-widest mb-4">Viral loop</p>
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[0.95]">Send it.<br />Watch them<br />react.</h2>
              <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-[380px]">Every Damrooh comes with a share link. Free preview. Full unlock when they&apos;re hooked.</p>
              <div className="mt-8 space-y-3 text-sm text-[#555]">
                <div className="flex items-center gap-3"><span className="text-lg">🎧</span> Free 10-second preview</div>
                <div className="flex items-center gap-3"><span className="text-lg">🔗</span> One-tap share anywhere</div>
                <div className="flex items-center gap-3"><span className="text-lg">🔥</span> They make their own &rarr; viral loop</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER 3 ═══ */}
      <div className="py-4 bg-[#FFC629]">
        <div className="ticker-wrap">
          <div className="ticker-content-slow">
            {[...Array(4)].flatMap(() => [
              "Don't text. Dedicate. 🎧",
              "Say it with a song. 🎵",
              "This hits harder than a message. 🔥",
              "Someone's waiting for this. 💕",
              "Make it personal. Make it a Damrooh. ✨",
            ]).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-8 text-base font-bold text-[#111] whitespace-nowrap">
                {item}<span className="text-xl">&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 9. FINAL CTA ═══ */}
      <section className="relative py-28 px-6 mesh-gradient-hero grid-bg">
        <div className="max-w-[1200px] mx-auto text-center relative">
          <div className="absolute top-0 left-[10%] text-4xl">🎵</div>
          <div className="absolute top-8 right-[15%] text-3xl">💕</div>
          <div className="absolute bottom-0 left-[20%] text-3xl">🔥</div>
          <div className="absolute bottom-4 right-[10%] text-2xl">✨</div>
          <div className="doodle-star absolute top-4 left-[30%] w-8 h-8" />
          <div className="doodle-heart absolute bottom-8 right-[25%] w-6 h-6" />

          <div className="scroll-reveal">
            <h2 className="text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-tight leading-[0.95]">
              Someone&apos;s waiting<br />
              <span className="relative inline-block">for this.<span className="doodle-underline absolute -bottom-2 left-0 w-full" /></span>
            </h2>
            <p className="text-[#999] text-xl mt-6 font-medium">Don&apos;t text. Dedicate.</p>
            <div className="mt-10">
              <Link href="/dedicate">
                <button className="px-10 py-5 rounded-2xl bg-[#FFC629] text-[#111] font-bold text-lg hover:bg-[#FFD04D] transition-colors cursor-pointer inline-flex items-center gap-3 shadow-[0_12px_40px_rgba(255,198,41,0.3)]">
                  <Music className="w-6 h-6" /> Create Your Song
                </button>
              </Link>
            </div>
            <p className="text-[#BBB] text-sm mt-6">First song is free. No card needed.</p>
          </div>
        </div>
      </section>

      {/* ═══ TRENDING SHOWCASE (Suno-style) ═══ */}
      <section className="relative py-24 px-6 bg-[#111]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Mind blowing<br />song quality
            </h2>
            <p className="text-white/40 text-lg mt-4 max-w-xl mx-auto">
              Whether it&apos;s a birthday wish or a love confession — Damrooh makes studio-quality songs accessible to everyone
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { title: "Happy Birthday Meera", user: "ansh_creates", plays: "248K", likes: "10K", gradient: "from-amber-400 to-rose-500" },
              { title: "25th Anniversary Surprise", user: "priya_music", plays: "562K", likes: "84K", gradient: "from-rose-400 to-violet-600" },
              { title: "Apology — She Forgave Me", user: "raj_beats", plays: "1.4M", likes: "213K", gradient: "from-sky-400 to-indigo-600" },
              { title: "Farewell Song", user: "neha_vibes", plays: "891K", likes: "127K", gradient: "from-emerald-400 to-teal-600" },
              { title: "Proposal Song — YES!", user: "karan_damrooh", plays: "3.2M", likes: "456K", gradient: "from-pink-400 to-red-600" },
              { title: "Thank You Papa", user: "simran_mel", plays: "2.1M", likes: "312K", gradient: "from-violet-400 to-indigo-600" },
              { title: "Savage Breakup Track", user: "dev_music", plays: "1.8M", likes: "89K", gradient: "from-orange-400 to-red-600" },
            ].map((song, i) => (
              <div key={i} className="shrink-0 w-[200px] cursor-pointer group">
                <div className={`aspect-square rounded-2xl bg-gradient-to-br ${song.gradient} relative overflow-hidden mb-3`}>
                  <div className="absolute inset-0 banner-overlay opacity-40" />
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <span className="text-white/70 text-[10px] flex items-center gap-1"><Play className="w-2.5 h-2.5" />{song.plays}</span>
                    <span className="text-white/70 text-[10px] flex items-center gap-1"><Heart className="w-2.5 h-2.5" />{song.likes}</span>
                  </div>
                </div>
                <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                <p className="text-white/40 text-xs">@{song.user}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EVERYTHING YOU NEED (Feature grid) ═══ */}
      <section className="relative py-24 px-6 bg-[#111]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-14 scroll-reveal">
            Everything you need to<br />make music your way
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              {
                title: "Instant song creation",
                desc: "Turn any moment into a personalized song instantly — from birthdays to breakups. Express what words can't. First song is free.",
                icon: "🎵",
              },
              {
                title: "AI-powered lyrics & music",
                desc: "Access our AI song generator to create unique tracks with custom lyrics, poster art, and shareable links — all in under 60 seconds.",
                icon: "🤖",
              },
              {
                title: "Share it with the world",
                desc: "Make music that matters to you, then share it with people who'll feel it too. Beautiful share links with free previews built in.",
                icon: "🔗",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/[0.08] p-7 hover:border-white/[0.15] transition-colors">
                <p className="text-white font-bold text-lg mb-2">{f.title}</p>
                <p className="text-white/40 text-sm leading-relaxed mb-6">{f.desc}</p>
                <div className="text-4xl">{f.icon}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Dedication-first design", desc: "Built for sending songs to people you love. Not just generating audio — creating moments." },
              { title: "Full ownership", desc: "Songs you create are yours to keep and share however you want. Download HD audio, share links, no strings." },
              { title: "Studio for power users", desc: "Fine-tune your sound with genre, mood, language, voice, and tempo controls. Go deeper when you want to." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/[0.08] p-7 hover:border-white/[0.15] transition-colors">
                <p className="text-white font-bold text-lg mb-2">{f.title}</p>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ APP CTA (Suno-style gradient banner) ═══ */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #FFC629 0%, #FF6B6B 50%, #7B61FF 100%)" }}>
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4">The #1 AI music dedication app</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Where you can create, share<br />and dedicate from anywhere
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
            Create personalized songs, share beautiful dedication links, and make moments that last — free forever.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/login">
              <button className="px-8 py-4 rounded-2xl bg-white text-[#111] font-bold text-base hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-2.5 shadow-xl">
                <Music className="w-5 h-5" />
                Start Creating Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently asked questions</h2>
            <p className="text-[#999] mt-2">Everything you need to know about making music with Damrooh.</p>
          </div>
          <div className="space-y-3">
            <FaqItem q="How does Damrooh work?" a="Enter a name, pick a mood, and hit Create. Our AI writes unique lyrics, composes 3 different tracks, and generates a poster — all in under 60 seconds. You can preview for free and unlock the full song with coins." />
            <FaqItem q="Do I need any music experience?" a="None at all. Damrooh is built for everyone — not musicians. Just describe a feeling or pick a preset, and the AI handles everything. If you want more control, Studio mode lets you fine-tune genre, tempo, voice, and more." />
            <FaqItem q="Is Damrooh free to use?" a="Yes! Your first song is completely free. After that, songs cost just 6 coins (₹6). You get 20 free coins on signup. No subscription required — just buy coins when you need them." />
            <FaqItem q="How is Damrooh different from other AI music tools?" a="Damrooh is built for dedication — making songs for people you love. It's not a generic AI tool. Every song comes with a beautiful share link, custom poster, and lyrics. It's ChatGPT for music meets Canva for music." />
            <FaqItem q="Can I share the songs I create?" a="Absolutely. Every song gets a beautiful share link. The recipient gets a free 10-second preview, and can unlock the full song. Perfect for WhatsApp, Instagram, or any platform." />
            <FaqItem q="What languages are supported?" a="Damrooh currently supports Hindi, English, Hinglish (mixed), and Punjabi. We're adding more languages regularly based on user demand." />
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-6 border-t border-black/[0.04] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#FFC629] flex items-center justify-center">
                  <span className="text-[#111] font-black text-[10px]">D</span>
                </div>
                <span className="text-sm font-bold text-text">damrooh</span>
              </div>
              <p className="text-xs text-[#999] leading-relaxed">Create personalized songs and dedicate them to the people you love.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3">Product</p>
              <div className="space-y-2 text-sm text-[#666]">
                <Link href="/create" className="block hover:text-text transition-colors">Create</Link>
                <Link href="/studio" className="block hover:text-text transition-colors">Studio</Link>
                <Link href="/coins" className="block hover:text-text transition-colors">Pricing</Link>
                <Link href="/community" className="block hover:text-text transition-colors">Community</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3">Company</p>
              <div className="space-y-2 text-sm text-[#666]">
                <span className="block">About</span>
                <span className="block">Blog</span>
                <span className="block">Careers</span>
                <span className="block">Contact</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3">Legal</p>
              <div className="space-y-2 text-sm text-[#666]">
                <span className="block">Terms of Service</span>
                <span className="block">Privacy Policy</span>
                <span className="block">Community Guidelines</span>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-black/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#BBB] text-xs">&copy; 2026 Damrooh. Made with feeling. Powered by AI.</p>
            <div className="flex items-center gap-4 text-[#CCC] text-xs">
              <span>Twitter</span>
              <span>Instagram</span>
              <span>Discord</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
