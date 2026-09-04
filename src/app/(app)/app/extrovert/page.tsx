import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Check, Eye, Ghost, Heart, Lock, RotateCcw, Search, ShieldCheck, Sparkles, Star, TrendingUp, Zap, Gift } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { DateBuExtrovertCheckout } from "@/components/payments/datebu-extrovert-checkout";
import { DateBuShop } from "@/components/payments/datebu-shop";

export const metadata: Metadata = { title: "Beyond | Extrovert" };
export const dynamic = "force-dynamic";

const features = [
  { icon: TrendingUp, title: "More profile reach", description: "Get additional discovery priority while recommendations remain relevant." },
  { icon: Eye, title: "See who viewed you", description: "Unlock the people behind your profile views." },
  { icon: Heart, title: "See who liked you", description: "See the identities behind incoming likes." },
  { icon: BarChart3, title: "Activity insights", description: "Track likes, matches, passes and profile activity." },
  { icon: Ghost, title: "Ghost Mode", description: "Browse without appearing in profile-view activity." },
  { icon: RotateCcw, title: "Rewind", description: "Bring back a recent passed profile." },
  { icon: Search, title: "Advanced discovery", description: "Use deeper dating preferences and controls." },
  { icon: Zap, title: "10 daily likes", description: "Paid Beyond members get a larger daily like allowance." },
  { icon: Star, title: "Priority discovery", description: "Receive additional discovery priority." },
];

export default async function BeyondPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: subscription }, { data: identity }] = await Promise.all([
    user ? supabase.from("subscriptions").select("plan,status,current_period_end").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    user ? supabase.from("extrovert_profiles").select("gender").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const paid = subscription?.plan === "pro" && ["active", "trialing"].includes(subscription.status) && !!subscription.current_period_end && new Date(subscription.current_period_end).getTime() > Date.now();
  const active = Boolean(paid);

  return (
    <main className="mx-auto max-w-md px-3.5 py-4 pb-28 font-sans">
      <div className="flex items-center gap-3 px-1">
        <Link href={routes.app} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs active:scale-95" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link>
        <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">EXTROVERT</p><h1 className="text-xl font-black tracking-tight">Beyond</h1></div>
      </div>
      <section className="mt-4 rounded-[2rem] border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-violet-700"><Sparkles className="h-3.5 w-3.5" />Beyond</div>
        <h2 className="mt-2 text-3xl font-black tracking-tight">More from your Extrovert experience.</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Beyond is the optional premium layer inside Extrovert. Your core social and dating identity stays the same.</p>
        {active ? <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-100/70 p-3"><p className="text-xs font-black text-violet-900">Beyond is active</p></div> : <DateBuExtrovertCheckout email={user?.email} />}
      </section>
      <section className="mt-5 rounded-[2rem] border border-border bg-card p-4"><p className="text-[9px] font-black uppercase tracking-[.16em] text-emerald-600">One-time extras</p><h2 className="mt-1 text-xl font-black">Super Likes & extras</h2><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Super Likes are available separately from Beyond.</p><DateBuShop /></section>
      <section className="mt-4 rounded-[2rem] border border-border bg-card p-4"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-600" /><h2 className="text-base font-black">Beyond features</h2></div><div className="mt-4 space-y-2.5">{features.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-2xl border border-border/70 bg-muted/15 p-3"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="text-xs font-black">{title}</h3>{!active && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}</div><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{description}</p></div></div></article>)}</div></section>
      <section className="mt-4 rounded-[2rem] border border-emerald-200/70 bg-emerald-50/50 p-4"><div className="flex items-center gap-2"><Star className="h-4 w-4 text-orange-500" /><h2 className="text-base font-black">Super Like is for everyone</h2></div><p className="mt-2 text-[10px] leading-4 text-muted-foreground">Anyone can send Super Likes. Premium access does not change the core safety or identity model.</p></section>
      <section className="mt-4 rounded-[2rem] border border-border bg-muted/20 p-4 text-center"><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Free stays useful</p><p className="mt-2 text-xs font-bold"><Check className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />Discover, match, chat and safety stay available.</p><p className="mt-1 text-[9px] text-muted-foreground">Beyond adds optional premium controls; it does not replace the core Extrovert experience.</p></section>
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />Extrovert · Connect your vibe, friends and more</div>
    </main>
  );
}
