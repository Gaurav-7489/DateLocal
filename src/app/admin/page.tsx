import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
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
  Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Executive Dashboard",
  robots: { index: false, follow: false },
};

// 1. DATA FETCHING FUNCTION
// Replace these static numbers with your actual Supabase/DB queries later.
async function fetchPlatformMetrics() {
  // Example: const { count } = await supabase.from('users').select('*', { count: 'exact' });
  return {
    totalUsers: 2845,
    pendingVerifications: 34,
    activeReports: 12,
    matchesToday: 312,
    lastUpdated: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
  };
}

const adminSections = [
  {
    href: routes.admin.users,
    label: "Student Directory",
    description: "Manage accounts, profiles, and access",
    icon: Users,
  },
  {
    href: routes.admin.verification,
    label: "Verification Queue",
    description: "Review pending university IDs",
    icon: ShieldCheck,
  },
  {
    href: routes.admin.reports,
    label: "Trust & Safety",
    description: "Review and resolve user reports",
    icon: Flag,
  },
  {
    href: routes.admin.moderation,
    label: "Content Moderation",
    description: "Handle strikes and account actions",
    icon: Scale,
  },
  {
    href: routes.admin.analytics,
    label: "Growth Analytics",
    description: "Platform engagement and metrics",
    icon: LineChart,
  },
  {
    href: routes.admin.settings,
    label: "Platform Settings",
    description: "Configure algorithms and limits",
    icon: Settings,
  },
  {
    href: routes.admin.auditLogs,
    label: "System Audit Logs",
    description: "Administrative action history",
    icon: ScrollText,
  },
];

export default async function AdminPage() {
  const admin = await requireAdmin();
  const metrics = await fetchPlatformMetrics();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans relative overflow-hidden">
      
      {/* Soothing Golden Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-100/60 via-amber-50/30 to-transparent rounded-full blur-[120px]" />
      </div>

      {/* Premium Top Navigation */}
      <header className="relative z-10 border-b border-zinc-200/60 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link 
              href={routes.app}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all active:scale-95 shadow-sm"
              title="Return to App"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div className="h-6 w-px bg-zinc-200" />
            
            <span className="flex items-center gap-2 text-sm font-bold tracking-widest text-zinc-800 uppercase">
              <Crown className="w-4 h-4 text-amber-500" />
              Executive Control
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/60 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-700 shadow-sm">
              Level: {admin.role}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:py-20 sm:px-6">
        
        {/* Breathable Hero Section */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-950">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-transparent bg-clip-text">
                Admin.
              </span>
            </h1>
            <p className="text-sm sm:text-base font-medium text-zinc-500 max-w-xl leading-relaxed">
              Here is your high-level overview of DateBu. All systems are operating normally. Data was last synced at <span className="text-zinc-800 font-bold">{metrics.lastUpdated}</span>.
            </p>
          </div>
        </div>

        {/* Real-time Data Metrics Row */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-zinc-900">Platform Metrics</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Metric Card 1 */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-200/80 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Students</p>
              </div>
              <p className="text-3xl font-black text-zinc-900">{metrics.totalUsers.toLocaleString()}</p>
              <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% this week
              </p>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-200/80 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pending Verification</p>
              </div>
              <p className="text-3xl font-black text-zinc-900">{metrics.pendingVerifications}</p>
              <p className="text-xs font-semibold text-amber-600 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Action required
              </p>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-200/80 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Reports</p>
              </div>
              <p className="text-3xl font-black text-zinc-900">{metrics.activeReports}</p>
              <p className="text-xs font-semibold text-zinc-500 mt-2">
                Awaiting review
              </p>
            </div>

            {/* Metric Card 4 */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-200/80 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Matches Today</p>
              </div>
              <p className="text-3xl font-black text-zinc-900">{metrics.matchesToday}</p>
              <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +5% vs yesterday
              </p>
            </div>

          </div>
        </div>

        {/* Management Modules Grid */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-zinc-900">Management Modules</h2>
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => {
              const Icon = section.icon;
              
              return (
                <Link
                  key={section.label}
                  href={section.href}
                  className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-200/80 hover:shadow-[0_12px_40px_rgba(245,158,11,0.08)] overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-500 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100 transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-lg font-extrabold text-zinc-900 group-hover:text-amber-700 transition-colors">
                      {section.label}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-zinc-500 group-hover:text-zinc-700 transition-colors leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                  
                  {/* Bottom indicator arrow */}
                  <div className="mt-6 flex items-center justify-end">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
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