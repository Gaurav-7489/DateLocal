import type { Metadata } from "next";
import { Clock3, Heart, Sparkles, Zap, ShieldCheck, Users, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "DateBu Extrovert | Coming Soon",
};

export default function ExtrovertPage() {
  return (
    <div className="mx-auto max-w-md px-3.5 py-5 space-y-4 font-sans select-none pb-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/40 dark:via-card dark:to-teal-950/30">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          DateBu Mode
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">
          Extrovert
        </h1>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <Clock3 className="h-3.5 w-3.5" /> Coming soon
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          DateBu currently gives every free account <strong className="text-foreground">10 likes per day</strong>. Extrovert is a future mode and does not change your current limits yet.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-foreground">What&apos;s planned</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {[
            [Heart, "More ways to connect"],
            [ShieldCheck, "Extra privacy controls"],
            [Users, "New matching modes"],
            [MessageCircle, "Richer conversations"],
          ].map(([Icon, label]) => {
            const FeatureIcon = Icon as typeof Heart;
            return (
              <div key={label as string} className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                <FeatureIcon className="h-4 w-4 text-emerald-600" />
                <p className="mt-2 text-[10px] font-bold leading-4 text-foreground">{label as string}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 text-center shadow-sm">
        <p className="text-[11px] font-semibold text-muted-foreground">
          No payment is required for this mode right now. We&apos;ll enable it here when it is ready.
        </p>
      </div>
    </div>
  );
}
