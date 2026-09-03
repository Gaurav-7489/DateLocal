import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { ProfileSetupForm } from "./profile-setup-form";
import { IdentityFieldsLock } from "./components/identity-fields-lock";

export const metadata: Metadata = { title: "Dating Profile | DateLocal" };
export const dynamic = "force-dynamic";

export default async function ProfileSetupPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const [{ data: interests }, { data: existingProfile }, { data: existingPhotos }, { data: existingPi }, { data: existingPreferences }, { data: identity }] = await Promise.all([
    supabase.from("interests").select("id, name").order("name"),
    supabase.from("profiles").select("display_name,date_of_birth,gender,department,academic_year,bio,campus_residency,campus_hangout,relationship_goal,zodiac,sleep_habit,caffeine_pref,weekend_vibe,prompt_question,prompt_answer").eq("id", user.id).maybeSingle(),
    supabase.from("profile_photos").select("storage_path, display_order, is_primary").eq("profile_id", user.id).order("display_order", { ascending: true }),
    supabase.from("profile_interests").select("interest_id").eq("profile_id", user.id),
    supabase.from("dating_preferences").select("interested_in, min_age, max_age, preferred_department").eq("user_id", user.id).maybeSingle(),
    supabase.from("extrovert_profiles").select("display_name,date_of_birth,gender,department,academic_year").eq("id", user.id).maybeSingle(),
  ]);

  if (!identity) redirect(`${routes.login}?error=extrovert_identity_required`);
  const existingPhotoPaths = (existingPhotos ?? []).map((photo) => photo.storage_path);
  const existingPhotoUrls = existingPhotoPaths.flatMap((path) => { const url = getProfilePhotoUrl(path, 320); return url ? [url] : []; });
  const existingInterestIds = (existingPi ?? []).map((row) => row.interest_id);

  return <div className="mx-auto max-w-2xl px-4 py-7 pb-24">
    <div className="mb-6"><div className="flex items-center justify-between"><div><span className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">DateLocal</span><h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Dating profile</h1></div><Link href={routes.profile} className="text-xs font-semibold text-muted-foreground">Back</Link></div><p className="mt-2 text-sm leading-6 text-muted-foreground">Everything below is for your dating experience. Your shared identity is supplied by Extrovert.</p></div>
    <IdentityFieldsLock values={{ displayName: identity.display_name ?? "", dateOfBirth: identity.date_of_birth ?? "", gender: identity.gender ?? "", department: identity.department ?? existingProfile?.department ?? "", academicYear: identity.academic_year ?? existingProfile?.academic_year ?? "" }} />
    <ProfileSetupForm userId={user.id} interests={interests ?? []} existingProfile={existingProfile} existingPhotoUrls={existingPhotoUrls} existingPhotoPaths={existingPhotoPaths} existingInterestIds={existingInterestIds} existingPreferences={existingPreferences} />
  </div>;
}
