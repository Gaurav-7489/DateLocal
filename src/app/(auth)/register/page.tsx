"use client";

import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2,
  MapPin
} from "lucide-react";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { registerWithEmail } from "@/services/auth.service";

interface StorySlide {
  image: string;
  tag: string;
  caption: string;
  glowColor: string;
}

const CAMPUS_STORIES: StorySlide[] = [
  {
    image: "/images/buphoto.jpeg",
    tag: "Main Campus Courtyard",
    caption: "Where every morning chai & team meetup begins",
    glowColor: "rgba(16, 185, 129, 0.24)",
  },
  {
    image: "/images/buphoto.jpeg",
    tag: "Central Library & Labs",
    caption: "Late afternoon study sessions & hackathon grinds",
    glowColor: "rgba(20, 184, 166, 0.20)",
  },
  {
    image: "/images/buphoto.jpeg",
    tag: "Campus Central Lawn",
    caption: "Connect with classmates from your batch",
    glowColor: "rgba(34, 197, 94, 0.18)",
  },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Auto-advance campus story images (7s slow smooth loop)
  useEffect(() => {
    if (CAMPUS_STORIES.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % CAMPUS_STORIES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const isHidingEyes = isFocusedPassword && !showPassword;
  const currentStory = CAMPUS_STORIES[activeStoryIndex]!;

  // Password rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const strengthScore = [hasMinLength, hasNumber].filter(Boolean).length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDomain = universityConfig.emailDomain
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    if (!normalizedEmail) {
      setError("Please enter your university email address.");
      return;
    }

    if (!normalizedEmail.endsWith(`@${normalizedDomain}`)) {
      setError(`Access limited: Please use your @${normalizedDomain} address.`);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await registerWithEmail(normalizedEmail, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Failed to create account. Please check your credentials.");
      return;
    }

    if (result.needsEmailConfirmation) {
  window.location.href = `${routes.verify}?email=${encodeURIComponent(normalizedEmail)}`;
  return;
}

window.location.href = routes.profileSetup;
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#f7fbf9] text-zinc-900 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden antialiased">
      
      {/* Slow & Smooth Emerald Ambient Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{
            backgroundColor: currentStory.glowColor,
            scale: isFocusedPassword ? 1.15 : 1,
          }}
          transition={{ duration: 3.2, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full blur-[150px]"
        />
      </div>

      {/* Top Floating App Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-black text-white shadow-xs">
            {universityConfig.shortName[0]}
          </div>
          <span className="font-extrabold text-xs tracking-tight text-zinc-950">
            {universityConfig.appName}
          </span>
        </Link>

        <Link
          href={routes.login}
          className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all"
        >
          Log In
        </Link>
      </header>

      {/* Main Registration Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-sm mx-auto w-full">
        
        {/* Storytelling Campus Banner */}
        <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-zinc-200/90 shadow-xs mb-[-18px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStoryIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={currentStory.image}
                alt={currentStory.tag}
                fill
                priority
                className="object-cover object-center filter brightness-[0.93]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f7fbf9] via-white/20 to-black/30" />
            </motion.div>
          </AnimatePresence>

          {/* Story Progress Indicators */}
          <div className="absolute top-2.5 left-3 right-3 flex gap-1 z-20">
            {CAMPUS_STORIES.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full bg-white/40 overflow-hidden backdrop-blur-xs"
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: idx < activeStoryIndex ? "100%" : "0%" }}
                  animate={{ 
                    width: idx === activeStoryIndex ? "100%" : idx < activeStoryIndex ? "100%" : "0%" 
                  }}
                  transition={{ 
                    duration: idx === activeStoryIndex ? 7 : 0.4, 
                    ease: "linear" 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Campus Location Pill & Story Caption */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-start gap-0.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-emerald-700 shadow-xs border border-emerald-200">
              <MapPin className="w-3 h-3 text-emerald-600" />
              {currentStory.tag}
            </div>
            <p className="text-[11px] text-zinc-700 font-medium truncate">
              {currentStory.caption}
            </p>
          </div>
        </div>

        {/* Animated Cat Mascot */}
        <div className="relative -mb-6 flex justify-center z-20 pointer-events-none">
          <StoryCatMascot 
            isHidingEyes={isHidingEyes} 
            isPeeking={showPassword && isFocusedPassword} 
          />
        </div>

        {/* Registration Form Card */}
        <div className="relative w-full rounded-3xl border border-zinc-200/90 bg-white/95 pt-8 px-5 pb-6 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
          
          <form onSubmit={handleSubmit} className="space-y-3.5">
                
                <div className="text-center space-y-1 pb-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                    <ShieldCheck className="w-3 h-3" /> Bahra University Only
                  </div>
                  <h1 className="text-lg font-black text-zinc-950 tracking-tight">
                    Join {universityConfig.appName}
                  </h1>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-600" />
                      Campus Email
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      @{universityConfig.emailDomain.replace(/^@/, "")}
                    </span>
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocusedPassword(false)}
                    placeholder={`username@${universityConfig.emailDomain.replace(/^@/, "")}`}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-orange-600" /> Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 cursor-pointer py-0.5 px-1"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocusedPassword(true)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <div className="flex gap-1 h-1 w-full">
                        <div className={`h-full rounded-full flex-1 transition-all ${strengthScore >= 1 ? "bg-amber-500" : "bg-zinc-200"}`} />
                        <div className={`h-full rounded-full flex-1 transition-all ${strengthScore >= 2 ? "bg-emerald-500" : "bg-zinc-200"}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-blue-600" /> Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setIsFocusedPassword(true)}
                    placeholder="Repeat password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Error Notice */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer mt-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Verify Student Email <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <p className="text-[11px] text-zinc-500">
                    Already registered?{" "}
                    <Link
                      href={routes.login}
                      className="font-bold text-emerald-600 hover:text-emerald-700 active:underline"
                    >
                      Log in here
                    </Link>
                  </p>
                </div>

              </form>

          </div>
        </main>

      {/* Discrete Footer */}
      <footer className="py-3 text-center text-[10px] text-zinc-400">
        © 2026 {universityConfig.appName} • Verified Student Network
      </footer>

    </div>
  );
}

// ---------------- ANIMATED CAT MASCOT ----------------

function StoryCatMascot({ 
  isHidingEyes, 
  isPeeking 
}: { 
  isHidingEyes: boolean; 
  isPeeking: boolean;
}) {
  return (
    <div className="relative w-32 h-24 flex items-center justify-center">
      <svg viewBox="0 0 140 110" className="w-full h-full overflow-visible filter drop-shadow-md">
        
        {/* Left Ear */}
        <polygon points="30,50 14,14 54,34" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="31,44 21,22 47,33" fill="#f43f5e" opacity="0.3" />

        {/* Right Ear */}
        <polygon points="110,50 126,14 86,34" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="109,44 119,22 93,33" fill="#f43f5e" opacity="0.3" />

        {/* Head Base */}
        <ellipse cx="70" cy="62" rx="44" ry="36" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" />

        {/* Whiskers */}
        <line x1="26" y1="62" x2="8" y2="58" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="68" x2="10" y2="70" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="114" y1="62" x2="132" y2="58" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="114" y1="68" x2="130" y2="70" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />

        {/* Emerald Eyes */}
        <motion.ellipse
          cx="52"
          cy="56"
          rx="6.5"
          ry="7.5"
          fill="#10b981"
          animate={{ scaleY: isHidingEyes ? 0.08 : isPeeking ? 1.3 : 1 }}
          transition={{ duration: 0.15 }}
        />
        <motion.ellipse
          cx="88"
          cy="56"
          rx="6.5"
          ry="7.5"
          fill="#10b981"
          animate={{ scaleY: isHidingEyes ? 0.08 : isPeeking ? 1.3 : 1 }}
          transition={{ duration: 0.15 }}
        />

        {!isHidingEyes && (
          <>
            <circle cx="54" cy="54" r="2.2" fill="#ffffff" />
            <circle cx="90" cy="54" r="2.2" fill="#ffffff" />
          </>
        )}

        {/* Snout & Nose */}
        <polygon points="67,68 73,68 70,72" fill="#f43f5e" />
        <path d="M 65 74 Q 70 77 75 74" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Left Paw */}
        <motion.g
          initial={{ y: 45, opacity: 0 }}
          animate={{
            y: isHidingEyes ? 0 : isPeeking ? 18 : 45,
            opacity: isHidingEyes ? 1 : isPeeking ? 0.9 : 0,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
        >
          <ellipse cx="50" cy="58" rx="11" ry="12" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
          <circle cx="50" cy="56" r="4" fill="#f43f5e" opacity="0.65" />
          <circle cx="43" cy="51" r="1.5" fill="#f43f5e" opacity="0.65" />
          <circle cx="50" cy="48" r="1.5" fill="#f43f5e" opacity="0.65" />
          <circle cx="57" cy="51" r="1.5" fill="#f43f5e" opacity="0.65" />
        </motion.g>

        {/* Right Paw */}
        <motion.g
          initial={{ y: 45, opacity: 0 }}
          animate={{
            y: isHidingEyes ? 0 : isPeeking ? 18 : 45,
            opacity: isHidingEyes ? 1 : isPeeking ? 0.9 : 0,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
        >
          <ellipse cx="90" cy="58" rx="11" ry="12" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
          <circle cx="90" cy="56" r="4" fill="#f43f5e" opacity="0.65" />
          <circle cx="83" cy="51" r="1.5" fill="#f43f5e" opacity="0.65" />
          <circle cx="90" cy="48" r="1.5" fill="#f43f5e" opacity="0.65" />
          <circle cx="97" cy="51" r="1.5" fill="#f43f5e" opacity="0.65" />
        </motion.g>

      </svg>
    </div>
  );
}