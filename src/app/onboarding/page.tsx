import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { saveIdentity } from "./actions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const { data: identity } = await supabase
    .from("extrovert_profiles")
    .select("display_name,date_of_birth,gender,department,academic_year,identity_type,institution_name,field_of_study,job_title,employer_name,role_description,profile_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (identity?.profile_completed) redirect(routes.app);

  const metadata = user.user_metadata ?? {};
  const defaultName = identity?.display_name || metadata.full_name || metadata.name || "";

  return (
    <main className="min-h-[100dvh] bg-white px-5 py-8 font-sans text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">EXTROVERT · FIRST STEP</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Set up your Extrovert identity</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">This is your main account profile. You can add dating details, photos and preferences later.</p>

        <form action={saveIdentity} className="mt-7 space-y-4">
          <label className="block"><span className="text-xs font-bold">Display name</span><input name="display_name" required maxLength={80} defaultValue={defaultName} autoComplete="name" className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500" /></label>
          <label className="block"><span className="text-xs font-bold">Date of birth</span><input name="date_of_birth" required type="date" defaultValue={identity?.date_of_birth ?? ""} className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500" /></label>
          <label className="block"><span className="text-xs font-bold">Gender</span><select name="gender" required defaultValue={identity?.gender ?? ""} className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500"><option value="" disabled>Select gender</option><option value="man">Man</option><option value="woman">Woman</option><option value="non-binary">Non-binary</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></label>
          <label className="block"><span className="text-xs font-bold">I am a</span><select name="identity_type" required defaultValue={identity?.identity_type ?? "student"} className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500"><option value="student">Student</option><option value="professional">Professional</option><option value="other">Other</option></select></label>
          <div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-xs font-bold">Department</span><input name="department" maxLength={100} defaultValue={identity?.department ?? ""} className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500" /></label><label className="block"><span className="text-xs font-bold">Academic year</span><select name="academic_year" defaultValue={identity?.academic_year ?? "postgraduate"} className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"><option value="1st-year">1st year</option><option value="2nd-year">2nd year</option><option value="3rd-year">3rd year</option><option value="4th-year">4th year</option><option value="5th-year">5th year</option><option value="postgraduate">Postgraduate</option></select></label></div>
          <label className="block"><span className="text-xs font-bold">College / university (optional)</span><input name="institution_name" maxLength={160} defaultValue={identity?.institution_name ?? ""} className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500" /></label>
          <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-950 text-sm font-black text-white shadow-lg">Continue to Extrovert</button>
        </form>
        <p className="mt-4 text-center text-[10px] leading-4 text-zinc-400">You must be 18 or older to use Extrovert.</p>
      </div>
    </main>
  );
}
