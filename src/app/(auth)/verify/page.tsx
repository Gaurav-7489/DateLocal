"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Inbox,
  Sparkles
} from "lucide-react";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { resendVerificationEmail } from "@/services/auth.service";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#f7fbf9]" />}>
      <VerifyPageWithParams />
    </Suspense>
  );
}

function VerifyPageWithParams() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  return <VerifyPageContent initialEmail={email} />;
}

function VerifyPageContent({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    router.prefetch(routes.login);
    router.prefetch(routes.app);
    router.prefetch("/app/discover");
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || countdown > 0) return;

    setLoading(true);
    setStatus("idle");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const result = await resendVerificationEmail(normalizedEmail);
    setLoading(false);

    if (result.success) {
      setStatus("success");
      setMessage("A new verification link was sent. Check your inbox and spam folder.");
      setCountdown(60);
    } else {
      setStatus("error");
      setMessage(result.error || "We couldn't send a new verification link. Please try again.");
    }
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#f7fbf9] text-zinc-900 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden antialiased">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-emerald-500/15 blur-[140px]" />
      </div>

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
          Sign In
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-sm mx-auto w-full">
        <div className="relative -mb-6 flex justify-center z-20 pointer-events-none">
          <VerifyCatMascot />
        </div>

        <div className="relative w-full rounded-3xl border border-zinc-200/90 bg-white/95 pt-8 px-5 pb-6 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.06)] space-y-4">
          <div className="text-center space-y-1.5 pb-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
              <ShieldCheck className="w-3 h-3" /> Step 1 of 2: Email Verification
            </div>
            <h1 className="text-xl font-black text-zinc-950 tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-xs text-zinc-600 leading-relaxed">
              We sent a verification link to your email address. Open it to confirm your account before continuing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="googlegmail:///"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all shadow-2xs"
            >
              <Inbox className="w-3.5 h-3.5 text-rose-500" /> Open Gmail
            </a>
            <a
              href="mailto:"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-blue-500" /> Open Mail
            </a>
          </div>

          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100/80 p-3.5 space-y-2 text-left">
            <p className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> What to do next
            </p>
            <ol className="text-[11px] text-zinc-600 space-y-1.5 list-decimal pl-4">
              <li>Open the email from <strong>{universityConfig.appName}</strong>.</li>
              <li>Tap the <strong>Confirm My Account</strong> button in the email.</li>
              <li>Come back here and sign in to continue your profile setup.</li>
            </ol>
          </div>

          <Link
            href={routes.login}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            I&apos;ve Verified My Email <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="pt-2 border-t border-zinc-100">
            <p className="text-[11px] font-semibold text-zinc-700 text-center mb-2">
              Didn&apos;t receive the email?
            </p>

            <form onSubmit={handleResend} className="space-y-2">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />

              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{message}</span>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px]"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{message}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim() || countdown > 0}
                className="w-full py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-zinc-700 text-xs font-semibold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Sending link...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" /> Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" /> Send New Verification Link
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-3 text-center text-[10px] text-zinc-400">
        © 2026 {universityConfig.appName}
      </footer>
    </div>
  );
}

function VerifyCatMascot() {
  return (
    <div className="relative w-32 h-24 flex items-center justify-center">
      <svg viewBox="0 0 140 110" className="w-full h-full overflow-visible filter drop-shadow-md">
        <polygon points="30,50 14,14 54,34" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="31,44 21,22 47,33" fill="#f43f5e" opacity="0.3" />
        <polygon points="110,50 126,14 86,34" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="109,44 119,22 93,33" fill="#f43f5e" opacity="0.3" />
        <ellipse cx="70" cy="62" rx="44" ry="36" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" />
        <line x1="26" y1="62" x2="8" y2="58" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="68" x2="10" y2="70" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="114" y1="62" x2="132" y2="58" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="114" y1="68" x2="130" y2="70" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="52" cy="56" rx="6.5" ry="7.5" fill="#10b981" />
        <ellipse cx="88" cy="56" rx="6.5" ry="7.5" fill="#10b981" />
        <circle cx="54" cy="54" r="2.2" fill="#ffffff" />
        <circle cx="90" cy="54" r="2.2" fill="#ffffff" />
        <polygon points="67,68 73,68 70,72" fill="#f43f5e" />
        <path d="M 65 74 Q 70 77 75 74" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <g transform="translate(46, 68)">
          <rect width="48" height="30" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
          <polygon points="2,2 24,18 46,2" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="24" cy="15" r="4" fill="#10b981" />
        </g>
        <ellipse cx="44" cy="80" rx="7" ry="6" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
        <ellipse cx="96" cy="80" rx="7" ry="6" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
