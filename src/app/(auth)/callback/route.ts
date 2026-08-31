import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? routes.profileSetup;

  if (!code) {
    return NextResponse.redirect(new URL(routes.login, requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(
      new URL(`${routes.login}?error=verification_failed`, requestUrl.origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check profile completion and primary photo existence in parallel
    const [profileResult, primaryPhotoResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("profile_photos")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_primary", true)
        .maybeSingle(),
    ]);

    const isProfileComplete = Boolean(profileResult.data?.profile_completed);
    const hasPrimaryPhoto = Boolean(primaryPhotoResult.data?.id);

    // If profile or primary photo is missing, always route to Profile Setup
    if (!isProfileComplete || !hasPrimaryPhoto) {
      return NextResponse.redirect(
        new URL(routes.profileSetup, requestUrl.origin)
      );
    }
  }

  const targetPath = next.startsWith("/") ? next : routes.app;
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}