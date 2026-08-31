import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function FaceVerificationPage() {
  return (
    <main className="min-h-[100dvh] bg-[#f7fbf9] px-4 py-6 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-[28px] border border-zinc-200/90 bg-white p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-7 w-7" strokeWidth={2} />
          </div>

          <div className="mt-5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Coming soon
          </div>

          <h1 className="mt-3 text-2xl font-black tracking-tight">
            Face verification
          </h1>

          <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-zinc-600">
            We&apos;re still polishing the camera verification system. It&apos;s temporarily disabled while we make it reliable across devices.
          </p>

          <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left">
            <p className="text-xs font-bold text-zinc-900">For now</p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Your DateBu account only needs a confirmed email and completed profile to continue.
            </p>
          </div>

          <Link
            href="/app"
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            Continue to DateBu
          </Link>

          <Link
            href="/app/settings"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </section>
      </div>
    </main>
  );
}
