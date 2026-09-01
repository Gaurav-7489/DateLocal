import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, ShieldCheck, MapPin } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { calculateAge } from "@/lib/utils";

type ProfileViewDb = { from: (table: "profile_views") => { insert: (values: { viewer_id: string; viewed_id: string }) => Promise<{ error: unknown }> } };

export const metadata: Metadata = { title: "Student Profile | DateBu" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ userId: string }> };

export default async function StudentProfilePage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);
  if (user.id === userId) redirect(routes.profile);

  const { data: profile } = await supabase.from("profiles").select(`id, display_name, date_of_birth, gender, department, academic_year, bio, profile_completed, ghost_mode, campus_residency, relationship_goal, zodiac, sleep_habit, caffeine_pref, weekend_vibe, prompt_question, prompt_answer, profile_photos (id, storage_path, is_primary, display_order), profile_interests (interests (id, name))`).eq("id", userId).eq("profile_completed", true).maybeSingle();
  if (!profile || profile.ghost_mode) notFound();

  await (supabase as unknown as ProfileViewDb).from("profile_views").insert({ viewer_id: user.id, viewed_id: userId });

  const photos = [...(profile.profile_photos ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order);
  const photoUrls = photos.map((photo) => getProfilePhotoUrl(photo.storage_path, 640)).filter(Boolean) as string[];
  const interests = profile.profile_interests?.flatMap((item: { interests?: { id: string; name: string } | { id: string; name: string }[] | null }) => {
    if (!item.interests) return [];
    return Array.isArray(item.interests) ? item.interests : [item.interests];
  }) ?? [];
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  return (
    <main className="mx-auto max-w-md px-3.5 py-4 pb-24 space-y-3.5 font-sans">
      <div className="flex items-center gap-3 px-1"><Link href={routes.discover} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs active:scale-95" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Campus profile</p><h1 className="truncate text-lg font-black text-foreground">{profile.display_name || "Student"}</h1></div></div>
      <section className="overflow-hidden rounded-[2rem] border border-border bg-zinc-950 shadow-xl"><div className="relative aspect-[4/5]">{photoUrls[0] ? <Image src={photoUrls[0]} alt={profile.display_name ?? "Student"} fill priority className="object-cover" sizes="(max-width: 640px) 100vw, 420px" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-800 text-7xl font-black text-white">{profile.display_name?.charAt(0) ?? "?"}</div>}<div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/90" /><div className="absolute left-4 right-4 top-4 flex items-center justify-between"><span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-bold text-emerald-300 backdrop-blur-md"><ShieldCheck className="h-3 w-3" /> Verified student</span><span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">{photoUrls.length} photos</span></div><div className="absolute bottom-4 left-4 right-4 text-white"><div className="flex flex-wrap items-baseline gap-2"><h2 className="text-3xl font-black tracking-tight">{profile.display_name}{age !== null ? `, ${age}` : ""}</h2>{profile.department && <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[9px] font-bold">{profile.department}</span>}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-300">{profile.academic_year && <span>{profile.academic_year}</span>}{profile.gender && <span>• {profile.gender}</span>}{profile.campus_residency && <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{profile.campus_residency}</span>}</div></div></div></section>
      {photoUrls.length > 1 && <div className="grid grid-cols-4 gap-2">{photoUrls.slice(1, 5).map((url, index) => <div key={url} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-zinc-950"><Image src={url} alt={`Photo ${index + 2}`} fill className="object-cover" sizes="100px" /></div>)}</div>}
      {profile.bio && <section className="rounded-3xl border border-border bg-card p-4"><p className="text-sm leading-relaxed text-foreground">“{profile.bio}”</p></section>}
      {profile.prompt_question && profile.prompt_answer && <section className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-4"><p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">{profile.prompt_question}</p><p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">“{profile.prompt_answer}”</p></section>}
      <section className="rounded-3xl border border-border bg-card p-4"><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">About</p><div className="mt-3 flex flex-wrap gap-1.5">{[profile.relationship_goal, profile.zodiac, profile.sleep_habit, profile.caffeine_pref, profile.weekend_vibe, ...interests.map((interest) => interest.name)].filter(Boolean).map((item) => <span key={String(item)} className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-foreground">{item}</span>)}</div></section>
      <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex gap-2 rounded-3xl border border-border/80 bg-background/90 p-2 shadow-xl backdrop-blur-xl"><Link href={routes.discover} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-xs font-bold text-foreground active:scale-[.98]"><Heart className="h-4 w-4 text-rose-500" /> Back to Discover</Link><Link href={routes.matches} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white active:scale-[.98]"><MessageCircle className="h-4 w-4" /> Matches</Link></div>
    </main>
  );
}
