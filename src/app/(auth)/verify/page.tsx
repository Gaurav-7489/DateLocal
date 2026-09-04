"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { resendVerificationEmail } from "@/services/auth.service";

export default function VerifyPage() {
  return <Suspense fallback={<div className="min-h-[100dvh] bg-[#f7fbf9]" />}><VerifyPageWithParams /></Suspense>;
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

  useEffect(() => { router.prefetch(routes.login); }, [router]);
  useEffect(() => { if (countdown <= 0) return; const timer = setInterval(() => setCountdown((value) => value - 1), 1000); return () => clearInterval(timer); }, [countdown]);

  async function handleResend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || countdown > 0) return;
    setLoading(true); setStatus("idle"); setMessage("");
    const result = await resendVerificationEmail(email.trim().toLowerCase());
    setLoading(false);
    if (result.success) { setStatus("success"); setMessage("A new verification link was sent. Check your inbox and spam folder."); setCountdown(60); }
    else { setStatus("error"); setMessage(result.error || "We couldn’t send a new verification link. Please try again."); }
  }

  return <main className="relative min-h-[100dvh] overflow-hidden bg-[#f7fbf9] px-4 py-6 font-sans text-zinc-900 antialiased">
    <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm">
      <Link href="/" className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">{universityConfig.shortName[0]}</div><span className="text-xs font-extrabold tracking-tight">{universityConfig.appName}</span></Link>
      <Link href={routes.login} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">Sign In</Link>
    </header>
    <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-md items-center justify-center py-8">
      <div className="w-full rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Mail className="h-7 w-7" /></div>
        <div className="mt-5 text-center"><div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700"><ShieldCheck className="h-3 w-3" /> Email verification</div><h1 className="mt-3 text-xl font-black tracking-tight text-zinc-950">Check your inbox</h1><p className="mt-2 text-xs leading-relaxed text-zinc-600">Confirm your email to secure your Extrovert account. This is separate from optional identity verification.</p></div>
        {email && <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-center text-xs font-semibold text-zinc-700">{email}</div>}
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5"><p className="flex items-center gap-1 text-[11px] font-bold text-emerald-950"><Sparkles className="h-3 w-3 text-emerald-600" /> What happens next</p><ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[11px] leading-5 text-zinc-600"><li>Open the email from <strong>{universityConfig.appName}</strong>.</li><li>Tap the confirmation link.</li><li>You’ll return to Extrovert.</li><li>Finish your profile setup.</li></ol></div>
        <Link href={routes.login} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-3.5 text-xs font-bold text-zinc-700">Go to Sign In <ArrowRight className="h-3.5 w-3.5" /></Link>
        <div className="mt-4 border-t border-zinc-100 pt-4"><p className="mb-2 text-center text-[11px] font-semibold text-zinc-700">Didn’t receive the email?</p><form onSubmit={handleResend} className="space-y-2"><input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20" />{status !== "idle" && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-1.5 rounded-xl p-2 text-[11px] ${status === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>{status === "success" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}<span>{message}</span></motion.div>}<button type="submit" disabled={loading || !email.trim() || countdown > 0} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 className="h-3 w-3 animate-spin" /> Sending link...</> : countdown > 0 ? <><RefreshCw className="h-3 w-3" /> Resend in {countdown}s</> : <><RefreshCw className="h-3 w-3" /> Send New Verification Link</>}</button></form></div>
      </div>
    </section>
  </main>;
}
