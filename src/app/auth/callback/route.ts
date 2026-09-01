import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? routes.app;

  if (!code) {
    return NextResponse.redirect(new URL(routes.login, requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(
      new URL(`${routes.login}?error=verification_failed`, requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [
      { data: profile },
      { count: photoCount },
      { count: interestCount },
      { data: preferences },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("profile_completed, display_name, date_of_birth, gender, department, academic_year")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("profile_photos")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id),
      supabase
        .from("profile_interests")
        .select("interest_id", { count: "exact", head: true })
        .eq("profile_id", user.id),
      supabase
        .from("dating_preferences")
        .select("interested_in, min_age, max_age")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    // Older profiles can contain every setup field but have a stale
    // profile_completed flag. Repair that state during OAuth callback so a
    // successful Google login does not dump a completed user back into setup.
    const profileDataIsComplete = Boolean(
      profile?.display_name &&
        profile.date_of_birth &&
        profile.gender &&
        profile.department &&
        profile.academic_year &&
        (photoCount ?? 0) > 0 &&
        (interestCount ?? 0) > 0 &&
        preferences?.interested_in?.length &&
        preferences.min_age != null &&
        preferences.max_age != null,
    );

    if (profileDataIsComplete && !profile?.profile_completed) {
      const { error: completionError } = await supabase
        .from("profiles")
        .update({
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (completionError) {
        console.error("OAuth profile completion repair failed:", completionError);
      } else {
        profile!.profile_completed = true;
      }
    }

    if (!profile || !profile.profile_completed) {
      return NextResponse.redirect(new URL(routes.profileSetup, requestUrl.origin));
    }
  }

  const targetPath = next.startsWith("/") ? next : routes.app;
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}
