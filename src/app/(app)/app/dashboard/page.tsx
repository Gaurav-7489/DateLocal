import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, Eye, Heart, MessageCircle, RotateCcw, Sparkles, Lock, Users, ShieldCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Your Activity | DateLocal" };
export const dynamic = "force-dynamic";

export default async function PersonalDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);
  const userId = user.id;
  const [{ data: subscription }, { data: likeStatus }, { data: profile }, { data: identity }, { count: socialConnections }] = await Promise.all([
    supabase.from("subscriptions").select("plan,status,current_period_end").eq("user_id", userId).maybeSingle(),
    supabase.rpc("get_like_status"),
    supabase.from("profiles").select("display_name,profile_completed").eq("id", userId).maybeSingle(),
    supabase.from("extrovert_profiles").select("display_name,verification_status,area_verification_status").eq("id", userId).maybeSingle(),
    supabase.from("extrovert_connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${userId},target_id.eq.${userId}`).eq("status", "accepted"),
  ]);
  const isPro = subscription?.plan === "pro" && ["active", "trialing"].includes(subscription.status) && !!subscription.current_period_end && new Date(subscription.current_period_end).getTime() > Date.now();
  const todayUsed = likeStatus?.[0]?.daily_used ?? 0;
  const dailyLimit = likeStatus?.[0]?.daily_limit ?? 10;
  const starterRemaining = likeStatus?.[0]?.starter_remaining ?? 0;
  const purchased = likeStatus?.[0]?.purchased_remaining ?? 0;
  const dailyRemaining = Math.max(0, dailyLimit - todayUsed);
  const likesRemainingLabel = starterRemaining > 0 ? `${starterRemaining} starter likes left` : `${dailyRemaining} of ${dailyLimit} daily likes left`;
  const [{ count: likesSent }, { count: likesReceived }, { count: matches }, { count: passes }, { count: profileViews }] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("liker_id", userId),
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("liked_id", userId),
    supabase.from("matches").select("id", { count: "exact", head: true }).or(`user_a.eq.${userId},user_b.eq.${userId}`),
    supabase.from("passes").select("id", { count: "exact", head: true }).eq("passer_id", userId),
    supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("viewed_id", userId),
  ]);
  const stats = [{ label: "Likes sent", value: likesSent ?? 0, icon: Heart }, { label: "Likes received", value: likesReceived ?? 0, icon: Sparkles }, { label: "Matches", value: matches ?? 0, icon: MessageCircle }, { label: "Profile views", value: profileViews ?? 0, icon: Eye }, { label: "Passed", value: passes ?? 0, icon: RotateCcw }];
  return <main className="mx-auto max-w-md px-3.5 py-4 font-sans pb-24 space-y-4"><div className="flex items-center gap-3 px-1"><Link href={routes.app} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-2xs" aria-label="Back"><ArrowLeft className="h-4 w-4"/></Link><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Activity</p><h1 className="text-xl font-black tracking-tight text-foreground">{profile?.display_name||"Your activity"}</h1></div></div>
    <section className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><BarChart3 className="h-4 w-4"/></div><div><h2 className="text-sm font-black">Dating activity</h2><p className="text-[10px] text-muted-foreground">Likes, matches, views and passes from DateLocal.</p></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{stats.map(({label,value,icon:Icon})=><div key={label} className="rounded-2xl border border-border/70 bg-muted/20 p-3"><div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-background"><Icon className="h-4 w-4"/></div><p className="text-xl font-black">{value}</p><p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">{label}</p></div>)}</div></section>
    <section className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Likes</p><p className="mt-1 text-sm font-black text-emerald-950">{likesRemainingLabel}</p>{purchased>0&&<p className="mt-1 text-[9px] font-semibold text-emerald-800">+{purchased} purchased likes in your wallet</p>}</div><div className="text-right"><p className="text-2xl font-black text-emerald-700">{todayUsed}/{dailyLimit}</p><p className="text-[9px] font-semibold text-emerald-700/70">today</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-emerald-600 transition-[width] duration-300" style={{width:`${starterRemaining>0?0:Math.min(100,(todayUsed/dailyLimit)*100)}%`}}/></div></section>
    <section className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Users className="h-4 w-4"/></div><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Social connection</p><h2 className="mt-0.5 text-sm font-black">{socialConnections??0} connected</h2><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Your social graph remains owned by Extrovert. DateLocal only reads the connection context needed for integrated experiences.</p></div></div></section>
    <section className="rounded-3xl border border-emerald-200/70 bg-emerald-50/50 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"/><div><p className="text-xs font-black text-emerald-950">Identity status</p><p className="mt-1 text-[10px] leading-4 text-emerald-800">{identity?.display_name||"Extrovert identity"} · {identity?.verification_status==="verified"?"identity verified":"identity verification pending"} · {identity?.area_verification_status==="verified"?"area verified":"area verification pending"}</p><Link href={routes.extrovert} className="mt-2 inline-flex text-[10px] font-bold text-emerald-700">View Extrovert connection →</Link></div></div></section>
    {!isPro&&<section className="rounded-3xl border border-border bg-card p-5 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Lock className="h-5 w-5"/></div><h2 className="mt-3 text-sm font-black">More personal insights are coming</h2><p className="mx-auto mt-1 max-w-xs text-[10px] leading-4 text-muted-foreground">DateLocal stays focused on dating. Premium benefits will be added separately without moving identity ownership out of Extrovert.</p></section>}
  </main>;
}
