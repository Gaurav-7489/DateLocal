import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { ProfileSetupForm } from "./profile-setup-form";

export const metadata: Metadata = { title: "Dating Profile | DateLocal" };
export const dynamic = "force-dynamic";

export default async function ProfileSetupPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const [{ data: interests }, { data: existingProfile }, { data: existingPhotos }, { data: existingPi }, { data: existingPreferences }, { data: identity }, { data: area }] = await Promise.all([
    supabase.from("interests").select("id, name").order("name"),
    supabase.from("profiles").select("bio,campus_residency,campus_hangout,relationship_goal,zodiac,sleep_habit,caffeine_pref,weekend_vibe,prompt_question,prompt_answer").eq("id", user.id).maybeSingle(),
    supabase.from("profile_photos").select("storage_path, display_order, is_primary").eq("profile_id", user.id).order("display_order", { ascending: true }),
    supabase.from("profile_interests").select("interest_id").eq("profile_id", user.id),
    supabase.from("dating_preferences").select("interested_in, min_age, max_age, preferred_department").eq("user_id", user.id).maybeSingle(),
    supabase.from("extrovert_profiles").select("display_name,date_of_birth,gender,department,academic_year,area_id,verification_status,area_verification_status").eq("id", user.id).maybeSingle(),
    supabase.from("extrovert_profiles").select("area_id,extrovert_areas(name)").eq("id", user.id).maybeSingle(),
  ]);

  if (!identity) redirect(`${routes.login}?error=extrovert_identity_required`);

  const existingPhotoPaths = (existingPhotos ?? []).map((photo) => photo.storage_path);
  const existingPhotoUrls = existingPhotoPaths.flatMap((path) => {
    const url = getProfilePhotoUrl(path, 320);
    return url ? [url] : [];
  });
  const existingInterestIds = (existingPi ?? []).map((row) => row.interest_id);
  const areaName = Array.isArray(area?.extrovert_areas) ? area.extrovert_areas[0]?.name : area?.extrovert_areas?.name;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 font-sans">
      <header className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">DateLocal</span>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Build your dating profile</h1>
          </div>
          <Link href={routes.profile} className="text-xs font-semibold text-muted-foreground">Back</Link>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Your Extrovert identity stays yours. DateLocal is where you show your dating vibe, what you enjoy, and what kind of connection you want.</p>
      </header>

      <section className="mb-5 rounded-3xl border border-emerald-200/80 bg-emerald-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 font-black">✓</div>
          <div className="min-w-0">
            <p className="text-sm font-black text-emerald-950">Who you are is managed by Extrovert</p>
            <p className="mt-1 text-[11px] leading-5 text-emerald-900/80">Name, birthday, gender, student identity, local area and verification are locked here. Edit them in Extrovert and DateLocal will stay in sync automatically.</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Name", identity.display_name || "Student"],
            ["Education", identity.department || "Not set"],
            ["Year", identity.academic_year || "Not set"],
            ["Area", areaName || "Not set"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-emerald-200/70 bg-white/80 p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700/70">{label}</p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-emerald-950">{value}</p>
            </div>
          ))}
        </div>
        <Link href={process.env.NEXT_PUBLIC_EXTROVERT_URL || "http://localhost:3000"} className="mt-3 inline-flex text-[10px] font-bold text-emerald-700">Edit shared identity in Extrovert →</Link>
      </section>

      <ProfileSetupForm
        userId={user.id}
        interests={interests ?? []}
        existingProfile={existingProfile}
        existingPhotoUrls={existingPhotoUrls}
        existingPhotoPaths={existingPhotoPaths}
        existingInterestIds={existingInterestIds}
        existingPreferences={existingPreferences}
        identity={{
          displayName: identity.display_name ?? "",
          dateOfBirth: identity.date_of_birth ?? "",
          gender: identity.gender ?? "",
          department: identity.department ?? "",
          academicYear: identity.academic_year ?? "",
        }}
      />
    </div>
  );
}
