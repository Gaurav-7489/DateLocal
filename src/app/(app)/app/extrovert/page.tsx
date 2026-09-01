import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Check, Eye, Ghost, Heart, Lock, RotateCcw, Search, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { DateBuExtrovertCheckout } from "@/components/payments/datebu-extrovert-checkout";
import { DateBuShop } from "@/components/payments/datebu-shop";

export const metadata: Metadata = { title: "DateBu Extrovert" };
export const dynamic = "force-dynamic";

const features = [
  { icon: TrendingUp, title: "Up to 25% more profile reach", description: "Extrovert gives your profile priority in eligible discovery placements, helping more relevant students get a chance to see you." },
  { icon: Eye, title: "See who viewed you", description: "Free users see the number of profile views. Extrovert reveals the people behind them and lets you open their profiles." },
  { icon: Heart, title: "See who liked you", description: "Know when people are interested. Extrovert unlocks the identities behind your incoming likes." },
  { icon: BarChart3, title: "Personal activity tracker", description: "See likes sent, likes received, matches, passes, profile views and daily usage in your private DateBu dashboard. Your Extrovert benefits are shown there too." },
  { icon: Ghost, title: "Ghost Mode", description: "Browse the campus quietly. When Ghost Mode is on, your profile does not appear in other students' profile-view activity." },
  { icon: RotateCcw, title: "Rewind", description: "Changed your mind after passing someone? Bring your most recent passed profile back and decide again." },
  { icon: Search, title: "Advanced discovery", description: "Use deeper discovery preferences to narrow recommendations without losing the simple swipe experience." },
  { icon: Zap, title: "10 likes every day", description: "Extrovert gives you 10 normal likes per day instead of the free 2-per-day allowance after your starter likes." },
  { icon: Star, title: "Priority discovery", description: "Your profile can receive additional discovery priority while DateBu keeps recommendations relevant and fair." },
];

export default async function ExtrovertPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: subscription } = user
    ? await supabase.from("subscriptions").select("plan,status,current_period_end").eq("user_id", user.id).maybeSingle()
    : { data: null };
  const active = subscription?.plan === "pro" && ["active", "trialing"].includes(subscription.status) && !!subscription.current_period_end && new Date(subscription.current_period_end).getTime() > Date.now();

  return (
    <main className="mx-auto max-w-md px-3.5 py-4 pb-28 font-sans">
      <div className="flex items-center gap-3 px-1">
        <Link href={routes.app} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs active:scale-95" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link>
        <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">DateBu</p><h1 className="text-xl font-black tracking-tight text-foreground">Extrovert</h1></div>
      </div>

      <section className="mt-4 rounded-[2rem] border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-violet-700"><Sparkles className="h-3.5 w-3.5" /> DateBu boosts</div>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">One-time. No commitment.</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Need a little more reach or want to make a move stand out? Buy only what you need. Everything below uses the same UPI checkout.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-white/90 bg-white/80 p-2.5"><Heart className="mx-auto h-4 w-4 text-rose-500" /><p className="mt-1 text-[9px] font-black text-foreground">Likes</p><p className="mt-0.5 text-[8px] text-muted-foreground">More chances</p></div>
          <div className="rounded-2xl border border-white/90 bg-white/80 p-2.5"><Sparkles className="mx-auto h-4 w-4 text-violet-600" /><p className="mt-1 text-[9px] font-black text-foreground">Super Likes</p><p className="mt-0.5 text-[8px] text-muted-foreground">Stand out</p></div>
          <div className="rounded-2xl border border-white/90 bg-white/80 p-2.5"><Zap className="mx-auto h-4 w-4 text-emerald-600" /><p className="mt-1 text-[9px] font-black text-foreground">SuperChats</p><p className="mt-0.5 text-[8px] text-muted-foreground">Message first</p></div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 px-1"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">One-time purchases</p><h2 className="text-xl font-black tracking-tight text-foreground">Pick exactly what you want</h2><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Small packs first. No subscription required.</p></div>
        <DateBuShop />
      </section>

      <section className="mt-6 rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700"><Sparkles className="h-3.5 w-3.5" /> Subscription</div>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">DateBu Extrovert</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">The full premium layer for students who want more visibility, more control and deeper insight into their DateBu activity.</p>
        {active ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-100/70 p-3"><p className="text-xs font-black text-emerald-900">Extrovert is active</p><p className="mt-1 text-[10px] text-emerald-800">Your plan is active until {new Date(subscription?.current_period_end as string).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.</p></div> : <DateBuExtrovertCheckout email={user?.email} />}
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/75 p-3"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Like allowance</p><p className="mt-1 text-sm font-black text-foreground">10 likes / day</p></div><Heart className="h-5 w-5 text-rose-500" /></div><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Free accounts get 7 starter likes once, then 2 likes per day. Purchased likes sit on top of your normal allowance.</p></div>
      </section>

      <section className="mt-4 rounded-[2rem] border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><BarChart3 className="h-4 w-4" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">See the difference</p><h2 className="text-base font-black text-foreground">Your personal tracker</h2></div></div>
        <p className="mt-3 text-[10px] leading-4 text-muted-foreground">Extrovert is not just a badge. Your DateBu dashboard shows your real activity — likes sent and received, matches, passes, profile views and daily usage. It is also where you can see your Extrovert status and reach benefit.</p>
        <Link href={routes.dashboard} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-[10px] font-black text-white active:scale-[.99]"><BarChart3 className="h-3.5 w-3.5" /> Open personal tracker</Link>
      </section>

      <section className="mt-4 rounded-[2rem] border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-4 w-4" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">What's included</p><h2 className="text-base font-black text-foreground">Every Extrovert feature</h2></div></div>
        <div className="mt-4 space-y-2.5">{features.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-2xl border border-border/70 bg-muted/15 p-3"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="text-xs font-black text-foreground">{title}</h3>{!active && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}</div><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{description}</p></div></div></article>)}</div>
      </section>

      <section className="mt-4 rounded-[2rem] border border-border bg-muted/20 p-4 text-center"><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Free stays useful</p><div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-foreground"><Check className="h-3.5 w-3.5 text-emerald-600" /> Discover</div><div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold text-foreground"><Check className="h-3.5 w-3.5 text-emerald-600" /> Match &amp; chat</div><div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold text-foreground"><Check className="h-3.5 w-3.5 text-emerald-600" /> Full profiles &amp; safety</div></section>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> One page · UPI checkout · Razorpay secured</div>
    </main>
  );
}
