import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { DatingProfileForm } from "./dating-profile-form";

export const metadata: Metadata = { title: "Dating Profile | DateLocal" };
export const dynamic = "force-dynamic";

export default async function ProfileSetupPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const [{ data: interests }, { data: existingProfile }, { data: existingPhotos }, { data: existingPi }, { data: existingPreferences }, { data: identity }] = await Promise.all([
    supabase.from("interests").select("id, name").order("name"),
    supabase.from("profiles").select("bio,campus_residency,campus_hangout,relationship_goal,zodiac,sleep_habit,caffeine_pref,weekend_vibe,prompt_question,prompt_answer").eq("id", user.id).maybeSingle(),
    supabase.from("profile_photos").select("storage_path, display_order, is_primary").eq("profile_id", user.id).order("display_order", { ascending: true }),
    supabase.from("profile_interests").select("interest_id").eq("profile_id", user.id),
    supabase.from("dating_preferences").select("interested_in, min_age, max_age, preferred_department").eq("user_id", user.id).maybeSingle(),
    supabase.from("extrovert_profiles").select("display_name,date_of_birth,gender,department,academic_year,area_id,verification_status,area_verification_status").eq("id", user.id).maybeSingle(),
  ]);

  if (!identity) redirect(`${routes.login}?error=extrovert_identity_required`);
  const existingPhotoPaths = (existingPhotos ?? []).map((photo) => photo.storage_path);
  const existingPhotoUrls = existingPhotoPaths.flatMap((path) => { const url = getProfilePhotoUrl(path, 320); return url ? [url] : []; });
  const existingInterestIds = (existingPi ?? []).map((row) => row.interest_id);
  const { data: area } = identity.area_id ? await supabase.from("extrovert_areas").select("name").eq("id", identity.area_id).maybeSingle() : { data: null };

  return <div className="mx-auto max-w-2xl px-4 py-6 pb-24 font-sans">
    <header className="mb-5"><div className="flex items-center justify-between"><div><span className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">DateLocal</span><h1 className="mt-1 text-2xl font-black tracking-tight">Build your dating profile</h1></div><Link href={routes.profile} className="text-xs font-semibold text-muted-foreground">Back</Link></div><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">DateLocal handles the dating experience. Your verified identity stays with Extrovert and is reflected here automatically.</p></header>
    <DatingProfileForm userId={user.id} interests={interests ?? []} existingProfile={existingProfile} existingPhotoUrls={existingPhotoUrls} existingPhotoPaths={existingPhotoPaths} existingInterestIds={existingInterestIds} existingPreferences={existingPreferences} identity={{ displayName: identity.display_name ?? "", dateOfBirth: identity.date_of_birth ?? "", gender: identity.gender ?? "", department: identity.department ?? "", academicYear: identity.academic_year ?? "", areaName: area?.name ?? "" }} />
  </div>;
}
