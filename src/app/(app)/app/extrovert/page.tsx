import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DateBuExtrovertCheckout } from "@/components/payments/datebu-extrovert-checkout";
import { Card } from "@/components/ui/card";
import { Lock, ShieldCheck, Sparkles, Zap, Users, MessageCircle, type LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "DateBu Extrovert" };

export const dynamic = "force-dynamic";

export default async function ExtrovertPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = subscription?.status === "active" && subscription.plan !== "free";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          <Sparkles className="h-3.5 w-3.5" />
          Premium Features
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
          Unlock DateBu Extrovert
        </h1>
        <p className="text-sm text-zinc-600">
          Free accounts get 5 likes. DateBu Extrovert unlocks every campus mode and unlimited likes.
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-950">Exclusive access</h2>
            <p className="text-xs text-zinc-600">
              {isPremium
                ? "Your premium subscription is active. You already have access to the locked features."
                : "Choose a plan below to unlock premium features and keep your experience private."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-zinc-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Ghost Mode
            </div>
            Hide from discovery during exam week or when you want privacy.
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-zinc-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Blind Date
            </div>
            Extra matchmaking experiments with a premium campus-only twist.
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-zinc-900">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              Coming Soon
            </div>
            Random Rush, Vibe Matcher, Study Buddies and other modes are still in development.
          </div>
          {([
            ["Blind Date", "A photo-free matching experience is coming soon.", Sparkles],
            ["Random Rush", "Fast campus matching windows are coming soon.", Zap],
            ["Vibe Matcher", "Match by shared energy and interests. Coming soon.", Users],
            ["Study Buddy", "Find focused campus partners. Coming soon.", Users],
            ["Blind Mode", "Meet people without seeing profile photos first.", Zap],
            ["Quick Chat", "Start lightweight conversations with active students.", MessageCircle],
          ] as [string, string, LucideIcon][]).map(([title, description, Icon]) => (
            <div key={String(title)} className={`rounded-2xl border p-3 text-xs ${isPremium ? "border-emerald-200 bg-emerald-50/50 text-zinc-700" : "border-zinc-200 bg-zinc-100/80 text-zinc-500"}`}>
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-zinc-900">
                {!isPremium && <Lock className="h-3.5 w-3.5" />}
                <Icon className="h-3.5 w-3.5 text-emerald-600" />
                {String(title)}
              </div>
              {String(description)}
              {!isPremium && <p className="mt-1 font-semibold text-amber-700">Locked on Free</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <DateBuExtrovertCheckout
          email={user.email ?? undefined}
          name={user.user_metadata?.full_name || user.user_metadata?.name || undefined}
        />
      </Card>
    </div>
  );
}
