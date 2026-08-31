import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { featureFlags } from "@/config/features";

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
      new URL(`${routes.login}?error=verification_failed`, requestUrl.origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // 1. Biometric verification check if feature flag enabled
    if (featureFlags.ENABLE_CAMERA_VERIFICATION) {
      const { data: faceVerification } = await supabase
        .from("face_verifications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!faceVerification || faceVerification.status !== "verified") {
        return NextResponse.redirect(
          new URL(routes.verifyFace, requestUrl.origin)
        );
      }
    }

    // 2. Profile onboarding completion check
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.profile_completed) {
      return NextResponse.redirect(
        new URL(routes.profileSetup, requestUrl.origin)
      );
    }
  }

  const targetPath = next.startsWith("/") ? next : routes.app;
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}