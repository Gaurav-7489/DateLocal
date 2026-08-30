import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { ProfileSetupForm } from "./profile-setup-form";

export const metadata: Metadata = { title: "Profile Setup" };

export const dynamic = "force-dynamic";

export default async function ProfileSetupPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  // All setup data is independent once the authenticated user is known.
  const [
    { data: interests },
    { data: existingProfile },
    { data: existingPhotos },
    { data: existingPi },
    { data: existingPreferences },
  ] = await Promise.all([
    supabase.from("interests").select("id, name").order("name"),
    supabase
      .from("profiles")
      .select(`
        display_name,
        date_of_birth,
        gender,
        department,
        academic_year,
        bio,
        campus_residency,
        campus_hangout,
        relationship_goal,
        zodiac,
        sleep_habit,
        caffeine_pref,
        weekend_vibe,
        prompt_question,
        prompt_answer
      `)
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profile_photos")
      .select("storage_path, display_order, is_primary")
      .eq("profile_id", user.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("profile_interests")
      .select("interest_id")
      .eq("profile_id", user.id),
    supabase
      .from("dating_preferences")
      .select("interested_in, min_age, max_age, preferred_department")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const existingPhotoPaths = (existingPhotos ?? []).map(
    (photo) => photo.storage_path,
  );

  const existingPhotoUrls = existingPhotoPaths.flatMap((path) => {
    const url = getProfilePhotoUrl(path, 320);
    return url ? [url] : [];
  });

  const existingInterestIds = (existingPi ?? []).map((row) => row.interest_id);

  const isEditing = !!existingProfile;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
          {isEditing ? "Edit Profile" : "Profile Setup"}
        </span>
        <h1 className="mt-4 text-2xl font-black text-foreground sm:text-3xl tracking-tight">
          {isEditing ? "Edit Your Profile" : `Create Your ${universityConfig.appName} Profile`}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {isEditing
            ? "Update your student profile and dating preferences below."
            : `Set up your profile to connect with verified ${universityConfig.name} students.`}
        </p>
      </div>

      {/* Form */}
      <ProfileSetupForm
        userId={user.id}
        interests={interests ?? []}
        existingProfile={existingProfile}
        existingPhotoUrls={existingPhotoUrls}
        existingPhotoPaths={existingPhotoPaths}
        existingInterestIds={existingInterestIds}
        existingPreferences={existingPreferences}
      />

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link
          href={routes.profile}
          className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
        >
          ← Back to profile
        </Link>
      </div>
    </div>
  );
}
