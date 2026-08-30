import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DateBuExtrovertCheckout } from "@/components/payments/datebu-extrovert-checkout";
import { 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Users, 
  MessageCircle, 
  Flame, 
  CheckCircle2, 
  Infinity 
} from "lucide-react";

export const metadata: Metadata = { 
  title: "DateBu Extrovert | Premium" 
};

export const dynamic = "force-dynamic";

export default async function ExtrovertPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = subscription?.status === "active" && subscription.plan !== "free";

  return (
    <div className="mx-auto max-w-md px-3.5 py-4 space-y-4 font-sans select-none pb-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-950/20 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-black text-emerald-600 uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Premium Club
          </span>
          {isPremium ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <CheckCircle2 className="w-3 h-3" /> Active Member
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground border border-border/60">
              Free Tier
            </span>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            DateBu Extrovert
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Free accounts get 10 daily likes. Unlock unlimited campus swipes, exam-week privacy, and exclusive modes.
          </p>
        </div>
      </div>

      {/* Feature Perks Bento Grid */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Exclusive Perks
          </span>
          <span className="text-[10px] font-bold text-emerald-600">
            {isPremium ? "All Unlocked" : "6 Features"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Unlimited Likes */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Infinity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Unlimited Likes</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Never run out of campus likes or miss a connection.
            </p>
          </div>

          {/* Ghost Mode */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Ghost Mode</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Hide your profile during exam weeks with 1 tap.
            </p>
          </div>

          {/* Random Rush */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">Random Rush</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Fast live campus matching windows.
            </p>
          </div>

          {/* Vibe Matcher */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Vibe Matcher</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Pair up by tea spots &amp; weekend energy.
            </p>
          </div>

          {/* Study Buddy */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">Study Buddy</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Match with partners from your department.
            </p>
          </div>

          {/* Quick Chat */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <MessageCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Quick Chat</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Lightweight chat with active students.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Section */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
        <DateBuExtrovertCheckout
          email={user.email ?? undefined}
          name={user.user_metadata?.full_name || user.user_metadata?.name || undefined}
        />
      </div>
    </div>
  );
}
