"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { isUniversityEmail, universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { signInWithEmail, signInWithGoogle } from "@/services/auth.service";

function GoogleMark() {
  return <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[13px] font-black text-[#4285F4] shadow-sm">G</span>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      setGoogleLoading(false);
      setError(result.error);
    }
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!isUniversityEmail(normalizedEmail)) {
      setError(`Email login is only available for @${universityConfig.emailDomain.replace(/^@/, "")}. Use Google if you have not received your university email.`);
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(normalizedEmail, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.replace(routes.app);
    router.refresh();
  }

  return (
    <main className="min-h-[100dvh] bg-[#f5f9ff] px-4 py-6 text-zinc-950 antialiased">
      <div className="mx-auto w-full max-w-md">
        <Link href={routes.home || "/"} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 active:scale-[.98]" aria-label="Back to campus">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to campus
        </Link>
      </div>
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-md items-center justify-center py-6">
        <section className="w-full rounded-[28px] border border-blue-100 bg-white p-5 shadow-[0_16px_50px_rgba(37,99,235,0.10)] sm:p-7">
          <header className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-sm shadow-blue-600/20">DB</div>
            <h1 className="text-2xl font-black tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-zinc-500">Sign in to your DateBu campus account.</p>
          </header>

          <button type="button" onClick={handleGoogle} disabled={googleLoading || loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-blue-50 hover:border-blue-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <GoogleMark />}
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" /><span>or university email</span><span className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <label className="block text-xs font-bold text-zinc-700">
              <span className="mb-1.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-blue-600" /> University email</span>
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={`student@${universityConfig.emailDomain.replace(/^@/, "")}`} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15" required />
            </label>

            <label className="block text-xs font-bold text-zinc-700">
              <span className="mb-1.5 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-blue-600" /> Password</span>
              <span className="relative block">
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </span>
            </label>

            {error && <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

            <button type="submit" disabled={loading || googleLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-black text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Signing in..." : "Sign in with university email"}
            </button>
          </form>

          <div className="mt-4 flex justify-center gap-4 text-xs font-semibold">
            <Link href={routes.resetPassword} className="text-blue-700 hover:underline">Forgot password?</Link>
            <Link href={routes.register} className="text-emerald-700 hover:underline">Create account</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
