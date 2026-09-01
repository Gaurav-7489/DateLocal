import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, Eye, Heart, MessageCircle, RotateCcw, Sparkles, Lock, TrendingUp } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Your Activity | DateBu" };
export const dynamic = "force-dynamic";

export default async function PersonalDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const [{ data: subscription }, { data: likeStatus }, { data: profile }] = await Promise.all([
    supabase.from("subscriptions").select("plan,status,current_period_end").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("get_like_status"),
    supabase.from("profiles").select("display_name, profile_completed").eq("id", user.id).maybeSingle(),
  ]);
  const isPro = subscription?.plan === "pro" && ["active", "trialing"].includes(subscription.status) && !!subscription.current_period_end && new Date(subscription.current_period_end).getTime() > Date.now();

  if (!isPro) return <main className="mx-auto max-w-md px-3.5 py-4 pb-24 font-sans"><div className="flex items-center gap-3 px-1"><Link href={routes.app} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-2xs active:scale-95" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Personal tracking</p><h1 className="text-xl font-black text-foreground">Your activity</h1></div></div><section className="mt-4 overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm"><Lock className="h-5 w-5" /></div><h2 className="mt-4 text-lg font-black text-foreground">Personal insights are an Extrovert feature</h2><p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Free DateBu stays fully usable for dating. Extrovert unlocks your activity, who viewed you, and who liked you.</p><Link href={routes.extrovert} className="mt-5 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-emerald-600/20">Explore Extrovert</Link></section></main>;

  const todayUsed = likeStatus?.[0]?.daily_used ?? 0;
  const dailyLimit = likeStatus?.[0]?.daily_limit ?? 10;
  const starterRemaining = likeStatus?.[0]?.starter_remaining ?? 0;
  const purchased = likeStatus?.[0]?.purchased_remaining ?? 0;
  const dailyRemaining = Math.max(0, dailyLimit - todayUsed);
  const likesRemainingLabel = starterRemaining > 0 ? `${starterRemaining} starter likes left` : `${dailyRemaining} of ${dailyLimit} daily likes left`;
  const todayProgress = starterRemaining > 0 ? 0 : Math.min(100, (todayUsed / dailyLimit) * 100);

  const [{ count: likesSent }, { count: likesReceived }, { count: matches }, { count: passes }, { count: profileViews }] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("liker_id", user.id),
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("liked_id", user.id),
    supabase.from("matches").select("id", { count: "exact", head: true }).or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase.from("passes").select("id", { count: "exact", head: true }).eq("passer_id", user.id),
    supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("viewed_id", user.id),
  ]);
  const stats = [
    { label: "Likes sent", value: likesSent ?? 0, icon: Heart, className: "text-rose-600 bg-rose-50" },
    { label: "Likes received", value: likesReceived ?? 0, icon: Sparkles, className: "text-orange-600 bg-orange-50" },
    { label: "Matches", value: matches ?? 0, icon: MessageCircle, className: "text-emerald-600 bg-emerald-50" },
    { label: "Profile views", value: profileViews ?? 0, icon: Eye, className: "text-blue-600 bg-blue-50" },
    { label: "Passed", value: passes ?? 0, icon: RotateCcw, className: "text-zinc-600 bg-zinc-100" },
  ];

  return <main className="mx-auto max-w-md px-3.5 py-4 font-sans pb-24 space-y-4"><div className="flex items-center gap-3 px-1"><Link href={routes.app} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-2xs active:scale-95" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Extrovert insights</p><h1 className="text-xl font-black tracking-tight text-foreground">{profile?.display_name || "Your activity"}</h1></div></div><section className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><BarChart3 className="h-4 w-4" /></div><div><h2 className="text-sm font-black text-foreground">Your DateBu activity</h2><p className="text-[10px] text-muted-foreground">Real activity from your account.</p></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon, className }) => <div key={label} className="rounded-2xl border border-border/70 bg-muted/20 p-3"><div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${className}`}><Icon className="h-4 w-4" /></div><p className="text-xl font-black text-foreground">{value}</p><p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">{label}</p></div>)}</div></section><section className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Likes</p><p className="mt-1 text-sm font-black text-emerald-950">{likesRemainingLabel}</p>{purchased > 0 && <p className="mt-1 text-[9px] font-semibold text-emerald-800">+{purchased} purchased likes in your wallet</p>}</div><div className="text-right"><p className="text-2xl font-black text-emerald-700">{todayUsed}/{dailyLimit}</p><p className="text-[9px] font-semibold text-emerald-700/70">today</p></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-emerald-600 transition-[width] duration-500" style={{ width: `${todayProgress}%` }} /></div><p className="mt-2 text-[10px] leading-relaxed text-emerald-800">Extrovert gives 10 likes/day. Your starter allowance is separate.</p></section><section className="rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><TrendingUp className="h-4 w-4" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Extrovert reach</p><h2 className="mt-0.5 text-sm font-black text-foreground">Up to 25% more profile reach</h2><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Your Extrovert reach benefit is active in eligible discovery placements. Keep an eye on your profile views here to see how your account is performing.</p></div></div><span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-700">ACTIVE</span></div><Link href={routes.extrovert} className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-violet-700">View Extrovert benefits <span aria-hidden="true">→</span></Link></section><section className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Profile status</p><p className="mt-2 text-sm font-black text-foreground">{profile?.profile_completed ? "Profile is live" : "Finish your profile"}</p></div><Link href={profile?.profile_completed ? routes.profile : routes.profileSetup} className="rounded-full bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white active:scale-95">{profile?.profile_completed ? "View profile" : "Complete"}</Link></div></section></main>;
}
