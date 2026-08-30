"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Sparkles
} from "lucide-react";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { createClient } from "@/lib/supabase/client";

interface LoginSlide {
  image: string;
  tag: string;
  caption: string;
  glowColor: string;
}

const LOGIN_STORIES: LoginSlide[] = [
  {
    image: "/images/buphoto.jpeg",
    tag: "Campus Life",
    caption: "Welcome back to your community",
    glowColor: "rgba(37, 99, 235, 0.22)", // Soft Sapphire Blue
  },
  {
    image: "/images/buphoto.jpeg",
    tag: "Central Library & Labs",
    caption: "Catch up with study buddies and friends",
    glowColor: "rgba(99, 102, 241, 0.20)", // Soft Indigo
  },
  {
    image: "/images/buphoto.jpeg",
    tag: "Cafeteria & Student Lawn",
    caption: "Plan canteen chai breaks between classes",
    glowColor: "rgba(245, 158, 11, 0.18)", // Warm Amber
  },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [greeting, setGreeting] = useState("Welcome back!");

  // Story cycle (7s slow loop)
  useEffect(() => {
    if (LOGIN_STORIES.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % LOGIN_STORIES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Time-aware greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Morning lecture rush? ☕");
    else if (hour >= 12 && hour < 17) setGreeting("Cafeteria chai break? 🥪");
    else if (hour >= 17 && hour < 22) setGreeting("Evening lawn meetup? 🎸");
    else setGreeting("Late night library grind? 🌙");
  }, []);

  const activeStory = LOGIN_STORIES[activeStoryIndex]!;
  const isHidingEyes = isFocusedPassword && !showPassword;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      const message = authError.message.toLowerCase().includes("email not confirmed")
        ? "Your email is not verified yet. Check your inbox for the verification link, then try again."
        : authError.message.toLowerCase().includes("invalid login credentials")
          ? "That email or password is incorrect. Check both fields or use Forgot password."
          : `We couldn't sign you in: ${authError.message}`;
      setError(message);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#f8fafc] text-zinc-900 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden antialiased">
      
      {/* ================= BACKGROUND GLOW ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{
            backgroundColor: activeStory.glowColor,
            scale: isFocusedPassword ? 1.15 : 1,
          }}
          transition={{ duration: 3.2, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full blur-[150px]"
        />
      </div>

      {/* Top Floating App Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-xs">
            {universityConfig.shortName[0]}
          </div>
          <span className="font-extrabold text-xs tracking-tight text-zinc-950">
            {universityConfig.appName}
          </span>
        </Link>

        <Link
          href={routes.register}
          className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all"
        >
          Create Account
        </Link>
      </header>

      {/* Main Mobile Login Screen */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-sm mx-auto w-full">
        
        {/* ================= STORYTELLING CAMPUS BANNER ================= */}
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
                src={activeStory.image}
                alt={activeStory.tag}
                fill
                priority
                className="object-cover object-center filter brightness-[0.93]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-white/20 to-black/30" />
            </motion.div>
          </AnimatePresence>

          {/* Story Progress Indicators */}
          <div className="absolute top-2.5 left-3 right-3 flex gap-1 z-20">
            {LOGIN_STORIES.map((_, idx) => (
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

          {/* Location Badge & Time Greeting */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-start gap-0.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-blue-700 shadow-xs border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-600" />
              {greeting}
            </div>
            <p className="text-[11px] text-zinc-700 font-medium truncate">
              {activeStory.caption}
            </p>
          </div>
        </div>

        {/* ================= CAT MASCOT ================= */}
        <div className="relative -mb-6 flex justify-center z-20 pointer-events-none">
          <LoginCat 
            isHidingEyes={isHidingEyes} 
            isPeeking={showPassword && isFocusedPassword} 
          />
        </div>

        {/* ================= SOLID, CLEAN FORM CARD ================= */}
        <div className="relative w-full rounded-3xl border border-zinc-200/90 bg-white/95 pt-8 px-5 pb-6 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
          
          <form onSubmit={handleLogin} className="space-y-3.5">
            
            <div className="text-center space-y-1 pb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700">
                <ShieldCheck className="w-3 h-3" /> Student Portal Access
              </div>
              <h1 className="text-lg font-black text-zinc-950 tracking-tight">
                Welcome Back
              </h1>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label 
                htmlFor="email"
                className="text-[11px] font-semibold text-zinc-700 flex items-center justify-between"
              >
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-600" />
                  Campus Email
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  @{universityConfig.emailDomain.replace(/^@/, "")}
                </span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocusedPassword(false)}
                placeholder={`username@${universityConfig.emailDomain.replace(/^@/, "")}`}
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password"
                  className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1"
                >
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
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocusedPassword(true)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Error Notice */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px]"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign In to Campus <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>

            <div className="text-center">
              <Link href={routes.resetPassword} className="text-[11px] font-semibold text-blue-700 hover:underline">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-zinc-500">
                New to {universityConfig.appName}?{" "}
                <Link
                  href={routes.register}
                  className="font-bold text-blue-600 hover:text-blue-700 active:underline"
                >
                  Join now
                </Link>
              </p>
            </div>

          </form>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-3 text-center text-[10px] text-zinc-400">
        © 2026 {universityConfig.appName} • Campus Community
      </footer>

    </div>
  );
}

// ---------------- CLEAN CAT MASCOT ----------------

function LoginCat({ 
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

        {/* Electric Blue Eyes */}
        <motion.ellipse
          cx="52"
          cy="56"
          rx="6.5"
          ry="7.5"
          fill="#2563eb"
          animate={{ scaleY: isHidingEyes ? 0.08 : isPeeking ? 1.3 : 1 }}
          transition={{ duration: 0.15 }}
        />
        <motion.ellipse
          cx="88"
          cy="56"
          rx="6.5"
          ry="7.5"
          fill="#2563eb"
          animate={{ scaleY: isHidingEyes ? 0.08 : isPeeking ? 1.3 : 1 }}
          transition={{ duration: 0.15 }}
        />

        {!isHidingEyes && (
          <>
            <circle cx="54" cy="54" r="2.2" fill="#ffffff" />
            <circle cx="90" cy="54" r="2.2" fill="#ffffff" />
          </>
        )}

        {/* Snout & Pink Nose */}
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
          <ellipse cx="50" cy="58" rx="11" ry="12" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
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
          <ellipse cx="90" cy="58" rx="11" ry="12" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
          <circle cx="90" cy="56" r="4" fill="#f43f5e" opacity="0.65" />
          <circle cx="83" cy="51" r="1.5" fill="#f43f5e" opacity="0.65" />
          <circle cx="90" cy="48" r="1.5" fill="#f43f5e" opacity="0.65" />
          <circle cx="97" cy="51" r="1.5" fill="#f43f5e" opacity="0.65" />
        </motion.g>

      </svg>
    </div>
  );
}