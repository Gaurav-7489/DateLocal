import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart, HeartHandshake, MessageCircle, ShieldCheck, Users, MapPin, Link2, Activity } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Admin Dashboard | DateLocal", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function getMetrics() {
  const db = createAdminClient();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const iso = since.toISOString();
  const now = new Date().toISOString();
  const [users, completed, likesToday, matchesToday, messagesToday, reports, extrovertUsers, extrovertVerified, extrovertAreas, socialConnections, bridgePending, subscriptions] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("profile_completed", true),
    db.from("likes").select("id", { count: "exact", head: true }).gte("created_at", iso),
    db.from("matches").select("id", { count: "exact", head: true }).gte("created_at", iso),
    db.from("messages").select("id", { count: "exact", head: true }).gte("created_at", iso),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("extrovert_profiles").select("id", { count: "exact", head: true }).eq("profile_completed", true),
    db.from("extrovert_profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified"),
    db.from("extrovert_areas").select("id", { count: "exact", head: true }),
    db.from("extrovert_connections").select("id", { count: "exact", head: true }).eq("status", "accepted"),
    db.from("extrovert_datelocal_auth_bridges").select("id", { count: "exact", head: true }).is("consumed_at", null).gt("expires_at", now),
    db.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
  ]);
  return { users: users.count ?? 0, completed: completed.count ?? 0, likesToday: likesToday.count ?? 0, matchesToday: matchesToday.count ?? 0, messagesToday: messagesToday.count ?? 0, reports: reports.count ?? 0, extrovertUsers: extrovertUsers.count ?? 0, extrovertVerified: extrovertVerified.count ?? 0, extrovertAreas: extrovertAreas.count ?? 0, socialConnections: socialConnections.count ?? 0, bridgePending: bridgePending.count ?? 0, subscriptions: subscriptions.count ?? 0, syncedAt: new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()) };
}

function Metric({ label, value, detail, Icon }: { label: string; value: number; detail: string; Icon: typeof Users }) {
  return <article className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs"><div className="flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{label}</p><Icon className="h-3.5 w-3.5 text-zinc-400" /></div><p className="mt-2 text-xl font-black tabular-nums">{value.toLocaleString("en-IN")}</p><p className="mt-0.5 text-[8px] text-zinc-400">{detail}</p></article>;
}

export default async function AdminPage() {
  const admin = await requireAdmin();
  const m = await getMetrics();
  const completion = m.users ? Math.round((m.completed / m.users) * 100) : 0;
  const identityCoverage = m.users ? Math.round((m.extrovertUsers / m.users) * 100) : 0;
  const verificationRate = m.extrovertUsers ? Math.round((m.extrovertVerified / m.extrovertUsers) * 100) : 0;
  return <main className="min-h-screen bg-zinc-50 text-zinc-950 font-sans">
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95"><div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><Link href={routes.app} aria-label="Back to DateLocal" className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500"><ArrowLeft className="h-4 w-4" /></Link><div className="h-5 w-px bg-zinc-200" /><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-emerald-600">DateLocal</p><h1 className="text-sm font-black">Admin Dashboard</h1></div></div><span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[9px] font-bold text-zinc-600">{admin.role}</span></div></header>
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-7 sm:px-6">
      <section><p className="text-[9px] font-black uppercase tracking-[.16em] text-emerald-600">Live overview</p><h2 className="mt-1 text-2xl font-black tracking-tight">Dating + identity health</h2><p className="mt-1 text-[10px] text-zinc-500">Direct Supabase counts · synced {m.syncedAt}</p></section>
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" aria-label="Live dating metrics"><Metric label="Dating users" value={m.users} detail={`${completion}% profiles complete`} Icon={Users} /><Metric label="Likes today" value={m.likesToday} detail="new dating likes" Icon={Heart} /><Metric label="Matches today" value={m.matchesToday} detail="new dating matches" Icon={HeartHandshake} /><Metric label="Messages today" value={m.messagesToday} detail="dating messages" Icon={MessageCircle} /><Metric label="Reports" value={m.reports} detail="pending safety review" Icon={ShieldCheck} /></section>
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs"><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-emerald-600" /><div><h3 className="text-sm font-black">Extrovert ↔ DateLocal</h3><p className="text-[9px] text-zinc-500">Extrovert owns identity, verification and social data. DateLocal owns dating data.</p></div></div><div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4"><Metric label="Extrovert identities" value={m.extrovertUsers} detail={`${identityCoverage}% of dating users`} Icon={Users} /><Metric label="Face verified" value={m.extrovertVerified} detail={`${verificationRate}% of identities`} Icon={ShieldCheck} /><Metric label="Social connections" value={m.socialConnections} detail="accepted social links" Icon={Users} /><Metric label="Local areas" value={m.extrovertAreas} detail="configured areas" Icon={MapPin} /></div><div className="mt-3 flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2.5"><div><p className="text-[10px] font-bold">Active identity handoffs</p><p className="text-[8px] text-zinc-500">Unconsumed and not expired</p></div><span className="text-sm font-black tabular-nums">{m.bridgePending}</span></div></section>
      <section className="grid gap-2.5 sm:grid-cols-3"><div className="rounded-2xl border border-zinc-200 bg-white p-4"><Activity className="h-4 w-4 text-zinc-500" /><p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-zinc-500">Today</p><p className="mt-1 text-sm font-black">{m.likesToday + m.matchesToday + m.messagesToday} dating events</p><p className="mt-1 text-[9px] text-zinc-500">Likes, matches and messages.</p></div><div className="rounded-2xl border border-zinc-200 bg-white p-4"><Users className="h-4 w-4 text-zinc-500" /><p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-zinc-500">Identity coverage</p><p className="mt-1 text-sm font-black">{identityCoverage}% linked</p><p className="mt-1 text-[9px] text-zinc-500">Dating profiles backed by Extrovert.</p></div><div className="rounded-2xl border border-zinc-200 bg-white p-4"><Heart className="h-4 w-4 text-zinc-500" /><p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-zinc-500">Subscriptions</p><p className="mt-1 text-sm font-black">{m.subscriptions} active</p><p className="mt-1 text-[9px] text-zinc-500">Dating subscription records.</p></div></section>
      <p className="border-t border-zinc-200 pt-4 text-center text-[8px] text-zinc-400">DateLocal admin · Every metric is read from Supabase on request.</p>
    </div>
  </main>;
}
