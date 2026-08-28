import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import DiscoverClient from "./discover-client";

export const metadata: Metadata = {
  title: "Discover",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DiscoverPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get profiles the current user has already liked.
  const { data: likes, error: likesError } = await supabase
    .from("likes")
    .select("liked_id")
    .eq("liker_id", user.id);

  if (likesError) {
    console.error("Failed to load liked profiles:", likesError);

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load your Discover history right now. Please try
          again.
        </p>
      </div>
    );
  }

  // Get profiles the current user has already passed.
  const { data: passes, error: passesError } = await supabase
    .from("passes")
    .select("passed_id")
    .eq("passer_id", user.id);

  if (passesError) {
    console.error("Failed to load passed profiles:", passesError);

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load your Discover history right now. Please try
          again.
        </p>
      </div>
    );
  }

  // Combine all profiles the user has already interacted with.
  const interactedProfileIds = new Set([
    ...(likes ?? []).map((like) => like.liked_id),
    ...(passes ?? []).map((pass) => pass.passed_id),
  ]);

    const excludedProfileIds = Array.from(interactedProfileIds);

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
    .neq("id", user.id);

  // Don't show profiles we've already interacted with.
  if (excludedProfileIds.length > 0) {
    profilesQuery = profilesQuery.not(
      "id",
      "in",
      `(${excludedProfileIds.join(",")})`,
    );
  }

  const { data: profiles, error } = await profilesQuery
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load discover profiles:", error);

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load profiles right now. Please try again.
        </p>
      </div>
    );
  }

  // Remove profiles the current user has already liked or passed.
  const availableProfiles = (profiles ?? []).filter(
    (profile) => !interactedProfileIds.has(profile.id),
  );

  const profilesWithPhotoUrls = await Promise.all(
    availableProfiles.map(async (profile) => {
      const photos = [...(profile.profile_photos ?? [])].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;

        return a.display_order - b.display_order;
      });

      const photoPath = photos[0]?.storage_path;

      if (!photoPath) {
        return {
          ...profile,
          profile_photo_url: null,
        };
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("profile-photos")
          .createSignedUrl(photoPath, 60 * 60);

      if (signedUrlError) {
        console.error(
          "Failed to create profile photo URL:",
          signedUrlError,
        );

        return {
          ...profile,
          profile_photo_url: null,
        };
      }

      return {
        ...profile,
        profile_photo_url: signedUrlData.signedUrl,
      };
    }),
  );

  return <DiscoverClient profiles={profilesWithPhotoUrls} />;
}