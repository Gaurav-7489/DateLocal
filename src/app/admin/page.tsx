import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Flag, Heart, HeartHandshake, LayoutDashboard, LineChart, MessageCircle, Scale, ScrollText, Settings, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Admin Dashboard | DateBu", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function fetchPlatformMetrics() {
  const db = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = today.toISOString();

  const [users, completed, updatedToday, likes, matches, messages, reports, subscriptions, orders, paidOrders, revenue] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("profile_completed", true),
    db.from("profiles").select("id", { count: "exact", head: true }).gte("updated_at", since),
    db.from("likes").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("matches").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("subscriptions").select("id", { count: "exact", head: true }).eq("plan", "pro").in("status", ["active", "trialing"]),
    db.from("shop_orders").select("id", { count: "exact", head: true }),
    db.from("shop_orders").select("id", { count: "exact", head: true }).in("status", ["paid", "fulfilled"]),
    db.from("shop_orders").select("amount_paise").in("status", ["paid", "fulfilled"]),
  ]);

  const revenuePaise = (revenue.data ?? []).reduce((sum, order) => sum + (order.amount_paise ?? 0), 0);
  return {
    totalUsers: users.count ?? 0,
    completedProfiles: completed.count ?? 0,
    updatedToday: updatedToday.count ?? 0,
    likesToday: likes.count ?? 0,
    matchesToday: matches.count ?? 0,
    messagesToday: messages.count ?? 0,
    pendingReports: reports.count ?? 0,
    activeExtrovert: subscriptions.count ?? 0,
    orders: orders.count ?? 0,
    paidOrders: paidOrders.count ?? 0,
    revenuePaise,
    syncedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

const sections = [
  [routes.admin.users, "Student Directory", "Accounts and profiles", Users],
  [routes.admin.verification, "Verification Queue", "Review student verification", ShieldCheck],
  [routes.admin.reports, "Trust & Safety", "Resolve user reports", Flag],
  [routes.admin.moderation, "Content Moderation", "Strikes, bans and photos", Scale],
  [routes.admin.analytics, "Growth Analytics", "Engagement and usage", LineChart],
  [routes.admin.settings, "Platform Controls", "Limits and matchmaking", Settings],
  [routes.admin.auditLogs, "Audit Logs", "Administrative security history", ScrollText],
] as const;

export default async function AdminPage() {
  const admin = await requireAdmin();
  const metrics = await fetchPlatformMetrics();
  const completion = metrics.totalUsers ? Math.round((metrics.completedProfiles / metrics.totalUsers) * 100) : 0;

  const cards = [
    ["Students", metrics.totalUsers, "total profiles", Users],
    ["Completed", metrics.completedProfiles, `${completion}% profile completion`, ShieldCheck],
    ["Active today", metrics.updatedToday, "profiles updated today", BarChart3],
    ["Likes today", metrics.likesToday, "new likes", Heart],
    ["Matches today", metrics.matchesToday, "new matches", HeartHandshake],
    ["Messages today", metrics.messagesToday, "new messages", MessageCircle],
    ["Extrovert", metrics.activeExtrovert, "active plans", Zap],
    ["Pending reports", metrics.pendingReports, "need review", Flag],
    ["Paid orders", metrics.paidOrders, `${metrics.orders} total orders`, Sparkles],
    ["Revenue", `₹${(metrics.revenuePaise / 100).toLocaleString("en-IN")}`, "paid / fulfilled orders", BarChart3],
  ] as const;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 font-sans">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href={routes.app} className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:text-zinc-950" aria-label="Return to app"><ArrowLeft className="h-4 w-4" /></Link>
            <div className="h-5 w-px bg-zinc-200" />
            <div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">DateBu</p><h1 className="text-sm font-black tracking-tight">Admin Dashboard</h1></div>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[9px] font-bold text-zinc-600">{admin.role}</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-7 sm:px-6 sm:py-9">
        <section>
          <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">Overview</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Platform health</h2><p className="mt-1 text-[10px] text-zinc-500">Live database counts · synced {metrics.syncedAt}</p></div><LayoutDashboard className="hidden h-5 w-5 text-zinc-300 sm:block" /></div>
        </section>

        <section aria-label="Platform metrics" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map(([label, value, detail, Icon]) => <article key={label} className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs"><div className="flex items-center justify-between gap-2"><p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{label}</p><Icon className="h-3.5 w-3.5 text-zinc-400" /></div><p className="mt-2 text-xl font-black tracking-tight tabular-nums">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p><p className="mt-0.5 text-[8px] font-medium text-zinc-400">{detail}</p></article>)}
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2"><Settings className="h-4 w-4 text-zinc-500" /><h2 className="text-xs font-black uppercase tracking-wider text-zinc-700">Management</h2></div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map(([href, label, description, Icon]) => <Link key={label} href={href} className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-zinc-300"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-700"><Icon className="h-4 w-4" /></div><div className="min-w-0"><h3 className="text-xs font-black">{label}</h3><p className="mt-0.5 text-[9px] leading-3.5 text-zinc-500">{description}</p></div></Link>)}
          </div>
        </section>

        <p className="border-t border-zinc-200 pt-4 text-center text-[8px] font-medium text-zinc-400">DateBu admin · Counts are queried from the production database on each request.</p>
      </div>
    </main>
  );
}
