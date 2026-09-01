import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye, ShieldCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { calculateAge } from "@/lib/utils";

type ProfileViewDb = { from: (table: "profile_views") => { select: (columns: string) => { eq: (column: string, value: string) => { order: (column: string, options: { ascending: boolean }) => { limit: (count: number) => Promise<{ data: { viewer_id: string; created_at: string }[] | null }> } } } } };

export const metadata: Metadata = { title: "Profile Views | DateBu" };
export const dynamic = "force-dynamic";

export default async function ProfileViewsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const { data: rawViews } = await (supabase as unknown as ProfileViewDb).from("profile_views").select("viewer_id, created_at").eq("viewed_id", user.id).order("created_at", { ascending: false }).limit(100);
  const seen = new Set<string>();
  const views = (rawViews ?? []).filter((view) => { if (seen.has(view.viewer_id)) return false; seen.add(view.viewer_id); return true; });
  const viewerIds = views.map((view) => view.viewer_id);
  const { data: profiles } = viewerIds.length ? await supabase.from("profiles").select("id, display_name, date_of_birth, department, academic_year, profile_completed, ghost_mode, profile_photos(storage_path, is_primary, display_order)").in("id", viewerIds).eq("profile_completed", true).eq("ghost_mode", false) : { data: [] as never[] };
  const byId = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <main className="mx-auto max-w-md px-3.5 py-4 pb-24 font-sans">
      <div className="flex items-center gap-3 px-1"><Link href={routes.profile} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs active:scale-95" aria-label="Back to profile"><ArrowLeft className="h-4 w-4" /></Link><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Your audience</p><h1 className="text-xl font-black text-foreground">Profile views</h1></div></div>
      <section className="mt-4 rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-xs"><Eye className="h-5 w-5" /></div><div><p className="text-sm font-black text-emerald-950">People who checked you out</p><p className="text-[10px] text-emerald-800/80">Recent unique visitors to your profile.</p></div></div></section>
      <div className="mt-4 space-y-2">
        {views.map((view) => { const profile = byId.get(view.viewer_id); if (!profile) return null; const photos = [...(profile.profile_photos ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order); const photo = getProfilePhotoUrl(photos[0]?.storage_path, 160); const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null; return <Link key={view.viewer_id} href={`${routes.profileView}/${view.viewer_id}`} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 transition-[transform,border-color] duration-150 hover:border-emerald-300 active:scale-[.99]"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-muted">{photo ? <Image src={photo} alt={profile.display_name ?? "Student"} fill className="object-cover" sizes="56px" /> : <div className="flex h-full items-center justify-center text-lg font-black text-emerald-700">{profile.display_name?.charAt(0) ?? "?"}</div>}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate text-sm font-black text-foreground">{profile.display_name}{age !== null ? `, ${age}` : ""}</p><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" /></div><p className="truncate text-[10px] text-muted-foreground">{profile.department} · {profile.academic_year}</p><p className="mt-1 text-[9px] font-semibold text-emerald-600">Viewed your profile</p></div></Link>; })}
        {viewerIds.length === 0 && <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Eye className="h-5 w-5" /></div><p className="mt-3 text-sm font-black text-foreground">No profile views yet</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">As students open your profile, their visits will appear here.</p><Link href={routes.discover} className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Open Discover</Link></div>}
      </div>
    </main>
  );
}
