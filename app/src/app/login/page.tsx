"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Music, ChevronRight, ArrowLeft, Gift,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const slides = [
  { gradient: "from-rose-400 via-pink-500 to-violet-600", emoji: "💕", tag: "For Ayesha", title: "Make a song\nfor someone", sub: "3 songs. Lyrics. Poster. Done." },
  { gradient: "from-amber-400 via-orange-500 to-rose-500", emoji: "🔗", tag: "Share link", title: "Send something\nthey'll remember", sub: "Beautiful share links. Free preview." },
  { gradient: "from-violet-500 via-indigo-500 to-cyan-500", emoji: "🎛️", tag: "Studio mode", title: "Go deeper\nwith full control", sub: "Write your vibe. Pick your sound." },
];

type AuthStep = "entry" | "otp" | "name" | "welcome";
type InputMode = "phone" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("entry");
  const [mode, setMode] = useState<InputMode>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setActiveSlide((p) => (p + 1) % slides.length), 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const isValid = mode === "phone" ? phone.length >= 10 : email.includes("@");

  const handleSendOtp = () => {
    if (!isValid) return;
    setStep("otp");
    setResendTimer(30);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "")) setTimeout(() => setStep("name"), 400);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const maskedContact = mode === "phone"
    ? `+91 ${phone.slice(0, 2)}****${phone.slice(-2)}`
    : email.replace(/(.{2})(.*)(@)/, "$1***$3");

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row">
      {/* ═══ LEFT — Auth ═══ */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-16 flex items-center justify-center order-2 lg:order-1">
        <div className="w-full max-w-[400px]">

          {/* ─── ENTRY ─── */}
          {step === "entry" && (
            <div className="fade-in">
              <Link href="/" className="flex items-center gap-2 mb-10">
                <div className="w-9 h-9 rounded-xl bg-[#FFC629] flex items-center justify-center">
                  <span className="text-[#111] font-black text-sm">D</span>
                </div>
                <span className="text-xl font-extrabold text-text">damrooh</span>
                <span className="text-lg">🎧</span>
              </Link>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Get started</h1>
              <p className="text-[#666] mt-2 mb-8">Make your first song in seconds.</p>

              {/* Toggle: Phone / Email */}
              <div className="flex p-1 rounded-2xl bg-[#F0F0EB] mb-5">
                <button
                  onClick={() => setMode("phone")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    mode === "phone" ? "bg-white text-[#111] shadow-sm" : "text-[#999] hover:text-[#666]"
                  }`}
                >
                  📱 Phone
                </button>
                <button
                  onClick={() => setMode("email")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    mode === "email" ? "bg-white text-[#111] shadow-sm" : "text-[#999] hover:text-[#666]"
                  }`}
                >
                  ✉️ Email
                </button>
              </div>

              {/* Input */}
              {mode === "phone" ? (
                <div className="flex gap-2 mb-4">
                  <div className="w-20 px-3 py-3.5 rounded-xl bg-[#F5F5F0] border border-black/[0.06] text-sm text-center font-semibold text-[#111] shrink-0">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Phone number"
                    autoFocus
                    className="flex-1 px-4 py-3.5 rounded-xl bg-[#F5F5F0] text-[#111] text-sm placeholder:text-[#BBB] focus:outline-none focus:ring-2 focus:ring-[#FFC629]/40 border border-black/[0.06]"
                  />
                </div>
              ) : (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-xl bg-[#F5F5F0] text-[#111] text-sm placeholder:text-[#BBB] focus:outline-none focus:ring-2 focus:ring-[#FFC629]/40 border border-black/[0.06] mb-4"
                />
              )}

              <button
                onClick={handleSendOtp}
                disabled={!isValid}
                className="w-full py-4 rounded-2xl bg-[#111] text-white font-bold text-sm hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/[0.06]" /></div>
                <div className="relative flex justify-center"><span className="px-4 bg-[#FAFAF7] text-xs text-[#BBB] font-medium uppercase tracking-wider">or</span></div>
              </div>

              {/* Social — icon buttons */}
              <div className="flex gap-3">
                <button onClick={() => router.push("/create")} className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white border-2 border-black/[0.06] hover:border-black/10 transition-all cursor-pointer">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-semibold text-[#111]">Google</span>
                </button>

                <button onClick={() => router.push("/create")} className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white border-2 border-black/[0.06] hover:border-black/10 transition-all cursor-pointer">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm font-semibold text-[#111]">Facebook</span>
                </button>
              </div>

              <p className="text-[10px] text-[#BBB] text-center mt-8 leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

          {/* ─── OTP ─── */}
          {step === "otp" && (
            <div className="fade-in">
              <button onClick={() => { setStep("entry"); setOtp(["","","","","",""]); }} className="flex items-center gap-1.5 text-sm text-[#999] hover:text-[#111] transition-colors cursor-pointer mb-8">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <h1 className="text-3xl font-extrabold tracking-tight">Enter code</h1>
              <p className="text-[#666] mt-2 mb-8">
                Sent to <span className="font-semibold text-[#111]">{maskedContact}</span>
              </p>

              <div className="flex gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className={`w-full aspect-square max-w-[56px] text-center text-2xl font-bold rounded-2xl border-2 transition-all focus:outline-none ${
                      digit ? "border-[#FFC629] bg-[#FFF8E1] text-[#111]" : "border-black/[0.06] bg-[#F5F5F0] text-[#111] focus:border-[#FFC629] focus:bg-[#FFF8E1]"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-sm mb-8">
                <button onClick={() => { setStep("entry"); setOtp(["","","","","",""]); }} className="text-[#999] hover:text-[#111] transition-colors cursor-pointer">
                  Change {mode === "phone" ? "number" : "email"}
                </button>
                {resendTimer > 0 ? (
                  <span className="text-[#BBB]">Resend in {resendTimer}s</span>
                ) : (
                  <button onClick={() => setResendTimer(30)} className="text-[#FFC629] font-semibold hover:text-[#E6B000] transition-colors cursor-pointer">Resend code</button>
                )}
              </div>

              <button
                onClick={() => setStep("name")}
                disabled={otp.some((d) => !d)}
                className="w-full py-4 rounded-2xl bg-[#111] text-white font-bold text-sm hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Verify <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── NAME ─── */}
          {step === "name" && (
            <div className="fade-in">
              <div className="w-14 h-14 rounded-2xl bg-[#FFC629]/20 flex items-center justify-center mb-6">
                <span className="text-2xl">👋</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">What should we call you?</h1>
              <p className="text-[#666] mt-2 mb-8">This will show up on your dedications.</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep("welcome"); }}
                className="w-full px-5 py-4 rounded-2xl bg-[#F5F5F0] text-[#111] text-base placeholder:text-[#BBB] focus:outline-none focus:ring-2 focus:ring-[#FFC629]/40 border border-black/[0.06] mb-4"
              />
              <button
                onClick={() => name.trim() && setStep("welcome")}
                disabled={!name.trim()}
                className="w-full py-4 rounded-2xl bg-[#111] text-white font-bold text-sm hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── WELCOME ─── */}
          {step === "welcome" && (
            <div className="fade-in text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#FFC629] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(255,198,41,0.3)]">
                <Gift className="w-10 h-10 text-[#111]" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {name}! 🎉</h1>
              <p className="text-[#666] mt-3 mb-2">You&apos;ve got</p>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFF8E1] border border-[#FFC629]/30 mb-6">
                <span className="text-2xl">🪙</span>
                <span className="text-2xl font-black text-[#111]">20</span>
                <span className="text-sm text-[#666] font-medium">free coins</span>
              </div>
              <p className="text-sm text-[#999] mb-8">Enough for your first song — completely free.</p>
              <button
                onClick={() => router.push("/dedicate")}
                className="w-full py-4 rounded-2xl bg-[#FFC629] text-[#111] font-bold text-base hover:bg-[#FFD04D] transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(255,198,41,0.3)]"
              >
                <Music className="w-5 h-5" /> Make your first dedication
              </button>
              <button onClick={() => router.push("/create")} className="w-full py-3 mt-3 text-sm text-[#999] hover:text-[#111] transition-colors cursor-pointer">
                Skip to dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT — Carousel ═══ */}
      <div className="lg:w-1/2 relative overflow-hidden order-1 lg:order-2 min-h-[240px] lg:min-h-screen">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${activeSlide === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center p-10 sm:p-16 relative`}>
              <div className="absolute inset-0 grid-bg-dark opacity-20" />
              <div className="absolute top-8 left-8 text-3xl" style={{ transform: "rotate(-8deg)" }}>{slide.emoji}</div>
              <div className="absolute bottom-12 right-10 text-2xl" style={{ transform: "rotate(12deg)" }}>✨</div>

              <div className="relative z-10 text-center max-w-md">
                <div className="rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 p-6 mb-8 inline-block">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">{slide.emoji}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/20 inline-block">
                    <span className="text-white text-xs font-semibold">{slide.tag}</span>
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight whitespace-pre-line">{slide.title}</h2>
                <p className="text-white/60 mt-3 text-sm">{slide.sub}</p>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, j) => (
                  <button key={j} onClick={() => setActiveSlide(j)} className={`h-1.5 rounded-full transition-all cursor-pointer ${activeSlide === j ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
