import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUniversityEmail } from "@/config/university";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { calculateAge } from "@/lib/utils";
import {
  Edit3,
  Settings,
  MapPin,
  ShieldCheck,
  Star,
  SlidersHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";

export const metadata: Metadata = { 
  title: "Profile | DateBu" 
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        date_of_birth,
        gender,
        department,
        academic_year,
        bio,
        profile_completed,
        ghost_mode,
        campus_residency,
        relationship_goal,
        zodiac,
        sleep_habit,
        caffeine_pref,
        weekend_vibe,
        prompt_question,
        prompt_answer,
        profile_photos (
          id,
          storage_path,
          is_primary,
          display_order
        ),
        profile_interests (
          interests (
            id,
            name
          )
        )
      `)
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("dating_preferences")
      .select("interested_in, min_age, max_age, preferred_department")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile || !profile.profile_completed) {
    redirect(routes.profileSetup);
  }

  const photos = [...(profile.profile_photos ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const photoUrls = photos.map((p) => getProfilePhotoUrl(p.storage_path, 480)).filter(Boolean) as string[];

  const interests =
    profile.profile_interests?.flatMap((pi: { interests?: { id: string; name: string } | { id: string; name: string }[] | null }) => {
      if (!pi.interests) return [];
      return Array.isArray(pi.interests) ? pi.interests : [pi.interests];
    }) ?? [];

  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const isVerifiedUser = isUniversityEmail(user.email);

  return (
    <div className="mx-auto max-w-md px-3.5 py-4 space-y-3.5 font-sans select-none pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-black tracking-tight text-foreground">
          Profile
        </h1>

        <div className="flex items-center gap-2">
          <Link
            href={routes.profileSetup}
            prefetch={true}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white active:scale-95 transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <Link
            href={routes.settings}
            prefetch={true}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Identity Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500/60 bg-zinc-900">
            {photoUrls[0] ? (
              <Image
                src={photoUrls[0]}
                alt={profile.display_name ?? "Profile"}
                fill
                priority
                decoding="async"
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 text-lg">
                {profile.display_name?.charAt(0) ?? "?"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-black text-foreground truncate">
                {profile.display_name || "DateBu Student"}
                {age !== null && <span className="font-light text-sm opacity-80">, {age}</span>}
              </h2>
              {isVerifiedUser && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-emerald-700 mt-0.5 truncate">
              {profile.department}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
              <span>{profile.academic_year}</span>
              {profile.gender && <span>• {profile.gender}</span>}
              {profile.campus_residency && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" /> {profile.campus_residency}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-xs text-foreground/90 border-t border-border/50 pt-2.5 leading-relaxed">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}
      </div>

      {/* 6 Deck Photos Grid */}
      <div className="rounded-3xl border border-border/80 bg-card p-3.5 space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Deck Photos ({photoUrls.length}/6)
          </span>
          <Link
            href={routes.profileSetup}
            prefetch={true}
            className="text-[10px] font-bold text-emerald-600 hover:underline"
          >
            Update
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photoUrls.map((url, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/80 bg-zinc-950"
            >
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                decoding="async"
                className="object-cover"
                sizes="(max-width: 640px) 30vw, 140px"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-emerald-600/90 px-1.5 py-0.2 text-[8px] font-bold text-white">
                  <Star className="w-2 h-2 fill-current" /> Main
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Icebreaker Prompt */}
      {profile.prompt_question && profile.prompt_answer && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-1">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-700 block">
            {profile.prompt_question}
          </span>
          <p className="text-xs font-semibold text-foreground leading-snug">
            &ldquo;{profile.prompt_answer}&rdquo;
          </p>
        </div>
      )}

      {/* Badges Flow */}
      <div className="rounded-2xl border border-border/70 bg-card p-3 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
          Habits &amp; Lifestyle
        </span>
        <div className="flex flex-wrap gap-1.5">
          {profile.relationship_goal && (
            <span className="rounded-xl bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-700">
              {profile.relationship_goal}
            </span>
          )}
          {profile.zodiac && (
            <span className="rounded-xl bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-bold text-purple-700">
              {profile.zodiac}
            </span>
          )}
          {profile.sleep_habit && (
            <span className="rounded-xl bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-700">
              {profile.sleep_habit}
            </span>
          )}
          {profile.caffeine_pref && (
            <span className="rounded-xl bg-orange-50 border border-orange-200 px-2.5 py-1 text-[11px] font-bold text-orange-700">
              {profile.caffeine_pref}
            </span>
          )}
          {profile.weekend_vibe && (
            <span className="rounded-xl bg-teal-50 border border-teal-200 px-2.5 py-1 text-[11px] font-bold text-teal-800">
              {profile.weekend_vibe}
            </span>
          )}
        </div>
      </div>

      {/* Interests */}
      {interests.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-3 space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Interests
          </span>
          <div className="flex flex-wrap gap-1">
            {interests.map((interest: { id: string; name: string }) => (
              <span
                key={interest.id}
                className="rounded-full bg-muted/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground border border-border/60"
              >
                {interest.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preferences & Visibility Quick Tiles */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={routes.profileSetup}
          prefetch={true}
          className="rounded-2xl border border-border/70 bg-card p-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
            <SlidersHorizontal className="w-3 h-3 text-emerald-600" /> Matching
          </div>
          <span className="text-xs font-bold text-foreground block truncate">
            {preferences?.interested_in?.join(", ") || "Everyone"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {preferences?.min_age ?? 18}–{preferences?.max_age ?? 25} yrs
          </span>
        </Link>

        <Link
          href={routes.settings}
          prefetch={true}
          className="rounded-2xl border border-border/70 bg-card p-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
            {profile.ghost_mode ? (
              <EyeOff className="w-3 h-3 text-amber-600" />
            ) : (
              <Eye className="w-3 h-3 text-emerald-600" />
            )}
            Visibility
          </div>
          <span className="text-xs font-bold text-foreground block">
            {profile.ghost_mode ? "Ghost Mode" : "Public"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {profile.ghost_mode ? "Hidden from deck" : "Active in Discover"}
          </span>
        </Link>
      </div>
    </div>
  );
}
