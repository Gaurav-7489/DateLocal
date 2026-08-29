import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DiscoverClient from "./discover-client";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Discover Students",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return isNaN(age) ? null : age;
}

export default async function DiscoverPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if current user completed their profile
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, profile_completed, ghost_mode")
    .eq("id", user.id)
    .maybeSingle();

  if (!myProfile || !myProfile.profile_completed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Card className="p-8 border-emerald-200 bg-emerald-50/50 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-foreground">
            Complete your profile first
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Before you can discover and swipe on other students, please complete your profile details and dating preferences.
          </p>
          <Link href={routes.profileSetup}>
            <Button variant="primary" size="md" className="gap-2">
              Complete Profile <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Load dating preferences
  const { data: myPrefs } = await supabase
    .from("dating_preferences")
    .select("interested_in, min_age, max_age, preferred_department")
    .eq("user_id", user.id)
    .maybeSingle();

  // 1. Get profiles the user already liked
  const { data: likes } = await supabase
    .from("likes")
    .select("liked_id")
    .eq("liker_id", user.id);

  // 2. Get profiles the user already passed
  const { data: passes } = await supabase
    .from("passes")
    .select("passed_id")
    .eq("passer_id", user.id);

  // 3. Get blocked users (both where current user is blocker or was blocked)
  const { data: blocksCreated } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id);

  const { data: blocksReceived } = await supabase
    .from("blocks")
    .select("blocker_id")
    .eq("blocked_id", user.id);

  const excludedIds = new Set<string>([
    user.id,
    ...(likes ?? []).map((l) => l.liked_id),
    ...(passes ?? []).map((p) => p.passed_id),
    ...(blocksCreated ?? []).map((b) => b.blocked_id),
    ...(blocksReceived ?? []).map((b) => b.blocker_id),
  ]);

  // Query profiles that completed onboarding and are not in ghost mode
  let profilesQuery = supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      date_of_birth,
      gender,
      department,
      academic_year,
      bio,
      ghost_mode,
      profile_photos (
        storage_path,
        display_order,
        is_primary
      ),
      profile_interests (
        interests (
          id,
          name
        )
      )
    `)
    .eq("profile_completed", true)
    .eq("ghost_mode", false)
    .neq("id", user.id);

  const excludedArray = Array.from(excludedIds);
  if (excludedArray.length > 0) {
    profilesQuery = profilesQuery.not("id", "in", `(${excludedArray.join(",")})`);
  }

  // Gender preference filtering
  if (myPrefs?.interested_in && myPrefs.interested_in.length > 0) {
    const wantsMen = myPrefs.interested_in.includes("men");
    const wantsWomen = myPrefs.interested_in.includes("women");
    const wantsEveryone = myPrefs.interested_in.includes("everyone");

    if (!wantsEveryone) {
      if (wantsMen && !wantsWomen) {
        profilesQuery = profilesQuery.in("gender", ["man"]);
      } else if (wantsWomen && !wantsMen) {
        profilesQuery = profilesQuery.in("gender", ["woman"]);
      }
    }
  }

  const { data: rawProfiles, error: profilesError } = await profilesQuery
    .order("created_at", { ascending: false })
    .limit(50);

  if (profilesError) {
    console.error("Failed to load discover profiles:", profilesError);
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load profiles right now. Please try again.
        </p>
      </div>
    );
  }

  // In-memory filter for age range and department preference
  const minAge = myPrefs?.min_age ?? 18;
  const maxAge = myPrefs?.max_age ?? 99;
  const prefDept = myPrefs?.preferred_department?.trim().toLowerCase();

  const filteredProfiles = (rawProfiles ?? []).filter((p) => {
    if (excludedIds.has(p.id)) return false;

    // Age filter
    const age = calculateAge(p.date_of_birth);
    if (age !== null && (age < minAge || age > maxAge)) {
      return false;
    }

    return true;
  });

  // Sort: prioritize preferred department if configured
  if (prefDept) {
    filteredProfiles.sort((a, b) => {
      const aMatch = a.department?.toLowerCase().includes(prefDept) ? 1 : 0;
      const bMatch = b.department?.toLowerCase().includes(prefDept) ? 1 : 0;
      return bMatch - aMatch;
    });
  }

// Resolve URLs for up to 5 profile photos
const profilesWithPhotoUrls = await Promise.all(
  filteredProfiles.map(async (profile) => {
    const photos = [...(profile.profile_photos ?? [])]
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.display_order - b.display_order;
      })
      .slice(0, 5);

    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const { data: signedUrlData } = await supabase.storage
          .from("profile-photos")
          .createSignedUrl(photo.storage_path, 60 * 60);

        const url =
          signedUrlData?.signedUrl ||
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${photo.storage_path}`;

        return {
          ...photo,
          url,
        };
      }),
    );

    return {
      ...profile,
      profile_photo_url: photosWithUrls[0]?.url ?? null,
      profile_photos: photosWithUrls,
    };
  }),
);

  return (
    <DiscoverClient
      profiles={profilesWithPhotoUrls}
      currentUserId={user.id}
    />
  );
}