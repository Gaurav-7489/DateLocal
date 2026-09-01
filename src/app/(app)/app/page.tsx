import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUniversityEmail, universityConfig } from "@/config/university";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { calculateAge } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Compass, Heart, MessageSquare, User, BarChart3, Eye, ShieldCheck, CheckCircle2, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { count: matchCount }, { count: likesReceived }, { count: sentMessages }, { count: profileViews }] = await Promise.all([
    supabase.from("profiles").select(`display_name, date_of_birth, department, academic_year, bio, profile_completed, ghost_mode, profile_photos(storage_path, is_primary, display_order)`).eq("id", user.id).maybeSingle(),
    supabase.from("matches").select("id", { count: "exact", head: true }).or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("liked_id", user.id),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("sender_id", user.id),
    supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("viewed_id", user.id),
  ]);

  const displayName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Student";
  const photos = [...(profile?.profile_photos ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order);
  const photoUrl = getProfilePhotoUrl(photos[0]?.storage_path, 320);
  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const complete = Boolean(profile?.profile_completed);
  const verified = isUniversityEmail(user.email);

  const stats = [
    { label: "Matches", value: matchCount ?? 0, href: routes.matches, icon: Heart, tone: "text-rose-600 bg-rose-50 border-rose-100" },
    { label: "Likes received", value: likesReceived ?? 0, href: routes.dashboard, icon: Heart, tone: "text-orange-600 bg-orange-50 border-orange-100" },
    { label: "Profile views", value: profileViews ?? 0, href: routes.profileViews, icon: Eye, tone: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Messages sent", value: sentMessages ?? 0, href: routes.messages, icon: MessageSquare, tone: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  const nav = [
    { href: routes.discover, title: "Discover", description: "Meet students on your campus", icon: Compass },
    { href: routes.matches, title: "Matches", description: "Your mutual connections", icon: Heart },
    { href: routes.messages, title: "Chats", description: "Continue your conversations", icon: MessageSquare },
    { href: routes.profileViews, title: "Profile views", description: "See who checked you out", icon: Eye },
    { href: routes.profile, title: "My profile", description: "View what others see", icon: User },
    { href: routes.dashboard, title: "Activity", description: "Personal tracking", icon: BarChart3 },
  ];

  return (
    <main className="mx-auto max-w-2xl px-3.5 py-4 pb-24 font-sans">
      <section className="rounded-[2rem] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {verified && <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><ShieldCheck className="h-3 w-3" /> Campus verified</span>}
            <h1 className="text-2xl font-black tracking-tight text-foreground">Welcome back, {displayName}</h1>
            <p className="mt-1 text-xs text-muted-foreground">Your {universityConfig.appName} campus hub</p>
          </div>
          <Link href={routes.settings} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground" aria-label="Settings">•••</Link>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/40 p-2.5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {photoUrl ? <Image src={photoUrl} alt={displayName} fill className="object-cover" sizes="56px" /> : <div className="flex h-full items-center justify-center text-lg font-black text-emerald-700">{displayName.charAt(0).toUpperCase()}</div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5"><p className="truncate text-sm font-black text-foreground">{displayName}{age !== null ? `, ${age}` : ""}</p><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /></div>
            <p className="truncate text-[10px] text-muted-foreground">{profile?.department || "Student"} · {profile?.academic_year || "Campus"}</p>
          </div>
          <Link href={routes.profile} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-bold text-foreground">View</Link>
        </div>

        {!complete && <Link href={routes.profileSetup} className="mt-3 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-bold text-emerald-800"><span>Finish your profile to start matching</span><ArrowUpRight className="h-4 w-4" /></Link>}
        {complete && <Link href={routes.discover} className="mt-3 block"><Button variant="primary" size="md" className="w-full gap-2"><Compass className="h-4 w-4" /> Start discovering</Button></Link>}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon, tone }) => <Link key={label} href={href} className={`rounded-2xl border p-3 ${tone} transition-transform active:scale-[.98]`}><Icon className="h-4 w-4" /><p className="mt-2 text-xl font-black">{value}</p><p className="text-[9px] font-bold opacity-70">{label}</p></Link>)}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between"><h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Your space</h2><Link href={routes.dashboard} className="text-[10px] font-bold text-emerald-600">Activity →</Link></div>
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          {nav.map(({ href, title, description, icon: Icon }, index) => <Link key={href} href={href} className={`flex items-center gap-3 p-3.5 transition-colors hover:bg-muted/40 active:bg-muted/60 ${index ? "border-t border-border/70" : ""}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-black text-foreground">{title}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{description}</p></div><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></Link>)}
        </div>
      </section>
    </main>
  );
}
