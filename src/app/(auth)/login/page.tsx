import Link from "next/link";
import { Heart, ShieldCheck, MapPin, Users } from "lucide-react";
import { GoogleSignIn } from "./google-sign-in";

export default function LoginPage() {
  return (
    <main className="min-h-[100dvh] bg-white px-5 py-8 font-sans text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-7">
          {/* App logo placeholder — replace this block when the final Extrovert logo is provided. */}
          <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-zinc-950 text-emerald-400 shadow-sm">
            <Heart size={22} fill="currentColor" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">
            EXTROVERT · DATING + SOCIAL
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.055em]">
            Meet people your way.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            Find dates, make friends, and chat with people nearby — all from one Extrovert account.
          </p>
        </div>

        <section className="space-y-2.5" aria-label="About Extrovert">
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black">Dating, friends, or both</p>
              <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
                Choose what you want to use Extrovert for. You can change it later.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black">Your exact location stays private</p>
              <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
                People only see your selected area, never your exact location.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black">Verification is optional</p>
              <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
                You can verify your identity and area when you are ready.
              </p>
            </div>
          </div>
        </section>

        <GoogleSignIn />

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-zinc-400">
          <Link href="/safety">Safety</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="mt-4 text-center text-[9px] leading-4 text-zinc-400">
          Continue with Google to securely sign in to Extrovert.
        </p>
      </div>
    </main>
  );
}
