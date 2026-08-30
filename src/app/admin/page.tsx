import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { routes } from "@/config/routes";
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  ShieldCheck, 
  Scale, 
  LineChart, 
  Settings, 
  ScrollText,
  ArrowLeft,
  Crown,
  TrendingUp,
  AlertCircle,
  HeartHandshake,
  Clock,
  Zap
} from "lucide-react";

export const metadata: Metadata = {
  title: "Executive Dashboard | DateBu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function fetchPlatformMetrics() {
  const db = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: pendingVerifications },
    { count: activeReports },
    { count: matchesToday },
    { count: paidSubscriptions }
  ] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("profile_completed", false),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("matches").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    db.from("subscriptions").select("id", { count: "exact", head: true }).eq("plan", "pro").eq("status", "active"),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    pendingVerifications: pendingVerifications ?? 0,
    activeReports: activeReports ?? 0,
    matchesToday: matchesToday ?? 0,
    paidSubscriptions: paidSubscriptions ?? 0,
    lastUpdated: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
  };
}

const adminSections = [
  {
    href: routes.admin.users,
    label: "Student Directory",
    description: "Manage accounts, profiles, and campus verifications",
    icon: Users,
  },
  {
    href: routes.admin.verification,
    label: "Verification Queue",
    description: "Review pending student IDs and college emails",
    icon: ShieldCheck,
  },
  {
    href: routes.admin.reports,
    label: "Trust & Safety",
    description: "Resolve active user reports and harassment flags",
    icon: Flag,
  },
  {
    href: routes.admin.moderation,
    label: "Content Moderation",
    description: "Handle account strikes, bans, and photo reviews",
    icon: Scale,
  },
  {
    href: routes.admin.analytics,
    label: "Growth Analytics",
    description: "Track swipe velocity and engagement rates",
    icon: LineChart,
  },
  {
    href: routes.admin.settings,
    label: "Platform Controls",
    description: "Configure matchmaking algorithms and like limits",
    icon: Settings,
  },
  {
    href: routes.admin.auditLogs,
    label: "System Audit Logs",
    description: "Review administrative action history and security logs",
    icon: ScrollText,
  },
];

export default async function AdminPage() {
  const admin = await requireAdmin();
  const metrics = await fetchPlatformMetrics();

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-zinc-900 font-sans relative overflow-hidden">
      
      {/* Golden Glow Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-100/60 via-amber-50/30 to-transparent rounded-full blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link 
              href={routes.app}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all active:scale-95 shadow-2xs"
              title="Return to App"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div className="h-5 w-px bg-zinc-200" />
            
            <span className="flex items-center gap-2 text-xs font-black tracking-widest text-zinc-800 uppercase">
              <Crown className="w-4 h-4 text-amber-500" />
              Executive Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/60 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-800 shadow-2xs">
              Role: {admin.role}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:py-12 sm:px-6 space-y-12">
        
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
            Platform Overview
          </h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 max-w-xl leading-relaxed">
            Real-time platform vitals across DateBu. Last synced at <span className="text-zinc-800 font-bold">{metrics.lastUpdated}</span>.
          </p>
        </div>

        {/* Real-time Metrics Grid (5 Column Bento) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-700">Platform Metrics</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            {/* 1. Total Students */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-2xs hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Students</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950">{metrics.totalUsers.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Active
              </p>
            </div>

            {/* 2. Pending Verifications */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-2xs hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Pending</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950">{metrics.pendingVerifications}</p>
              <p className="text-[11px] font-bold text-amber-600 mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Review queue
              </p>
            </div>

            {/* 3. Active Reports */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-2xs hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Reports</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950">{metrics.activeReports}</p>
              <p className="text-[11px] font-semibold text-zinc-400 mt-1.5">
                Awaiting resolution
              </p>
            </div>

            {/* 4. Matches Today */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-2xs hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Matches Today</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950">{metrics.matchesToday}</p>
              <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Connections
              </p>
            </div>

            {/* 5. Paid Extrovert Subscriptions */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-2xs hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Zap className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Extrovert</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-950">{metrics.paidSubscriptions}</p>
              <p className="text-[11px] font-bold text-purple-600 mt-1.5">
                Active Premium
              </p>
            </div>

          </div>
        </div>

        {/* Management Modules */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-700">Management Modules</h2>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.label}
                  href={section.href}
                  className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                >
                  <div>
                    <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-600 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <h3 className="text-sm font-black text-zinc-900 group-hover:text-amber-700 transition-colors">
                      {section.label}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500 leading-snug">
                      {section.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-end">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
