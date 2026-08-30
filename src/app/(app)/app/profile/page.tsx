import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUniversityEmail, universityConfig } from "@/config/university";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { calculateAge } from "@/lib/utils";
import {
  ShieldCheck,
  Edit,
  Settings,
  Sparkles,
  SlidersHorizontal,
  Eye,
  EyeOff,
  User,
} from "lucide-react";

export const metadata: Metadata = { title: "Your Profile" };

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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

  const isCompleted = Boolean(profile?.profile_completed);

  const photos = [...(profile?.profile_photos ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const photoPath = photos[0]?.storage_path;
  const photoUrl = getProfilePhotoUrl(photoPath, 640);

  const interests =
    profile?.profile_interests?.flatMap((pi) => {
      if (!pi.interests) return [];
      return Array.isArray(pi.interests) ? pi.interests : [pi.interests];
    }) ?? [];

  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const isVerifiedUser = isUniversityEmail(user.email);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Your Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage how others on campus see your profile
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={routes.profileSetup} prefetch={true}>
            <Button variant="primary" size="md" className="gap-1.5">
              <Edit className="w-4 h-4" />
              {isCompleted ? "Edit Profile" : "Set Up Profile"}
            </Button>
          </Link>
          <Link href={routes.settings} prefetch={true}>
            <Button variant="secondary" size="md" className="gap-1.5">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {!isCompleted ? (
        /* Profile completion prompt */
        <Card className="border-emerald-200 bg-emerald-50/60 p-6 text-center sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Your profile isn&apos;t set up yet
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complete your profile details, upload a photo, and set your dating preferences to start discovering and matching with peers at {universityConfig.name}.
              </p>
            </div>
            <Link href={routes.profileSetup} prefetch={true}>
              <Button variant="primary" size="md">
                Set up profile now
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Completed Profile View */
        <div className="space-y-6">
          {/* Main Card */}
          <Card className="overflow-hidden p-6 border-border">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Photo */}
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 shrink-0 overflow-hidden rounded-3xl border-2 border-emerald-500 bg-muted shadow-sm mx-auto sm:mx-0">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={profile?.display_name ?? "Profile"}
                    fill
                    className="object-contain bg-white p-1"
                    sizes="176px"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-muted text-muted-foreground">
                    <User className="h-12 w-12 stroke-1" />
                    <span className="text-[10px] mt-1">No photo yet</span>
                  </div>
                )}
              </div>

              {/* Bio & Details */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">
                      {profile?.display_name}
                      {age !== null && (
                        <span className="ml-2 font-normal text-muted-foreground text-lg">
                          {age}
                        </span>
                      )}
                    </h2>
                    {isVerifiedUser && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-emerald-700">
                    {profile?.department} • {profile?.academic_year}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    Gender: {profile?.gender}
                  </p>
                </div>

                {profile?.bio ? (
                  <div className="rounded-2xl bg-muted/50 p-3.5 text-sm text-foreground leading-relaxed">
                    &ldquo;{profile.bio}&rdquo;
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No bio provided. Add a bio to tell others about yourself!
                  </p>
                )}

                {/* Interests */}
                {interests.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map((interest) => (
                        <span
                          key={interest.id}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200"
                        >
                          {interest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Preferences & Privacy Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dating Preferences Card */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                Dating Preferences
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span>Interested in:</span>
                  <span className="font-semibold text-foreground capitalize">
                    {preferences?.interested_in?.join(", ") || "Everyone"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span>Age range:</span>
                  <span className="font-semibold text-foreground">
                    {preferences?.min_age ?? 18} – {preferences?.max_age ?? 25} yrs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Preferred Dept:</span>
                  <span className="font-semibold text-foreground">
                    {preferences?.preferred_department || "Any department"}
                  </span>
                </div>
              </div>
              <Link href={routes.profileSetup} prefetch={true} className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Change Preferences
                </Button>
              </Link>
            </Card>

            {/* Privacy & Ghost Mode Card */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                {profile?.ghost_mode ? (
                  <EyeOff className="w-4 h-4 text-amber-600" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-600" />
                )}
                Discovery Visibility
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {profile?.ghost_mode
                  ? "Ghost mode is currently ON. You are hidden from public discovery. Existing matches can still message you."
                  : "Your profile is active and visible to matching campus peers based on your preferences."}
              </p>
              <div className="pt-1">
                <Link href={routes.settings} prefetch={true}>
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    {profile?.ghost_mode ? "Disable Ghost Mode" : "Manage in Settings"}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Account Info card */}
      <Card className="p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Account Verification
        </h3>
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-foreground">{user.email}</p>
            <p className="text-muted-foreground">{universityConfig.name}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Single Sign-On Verified
          </span>
        </div>
      </Card>
    </div>
  );
}