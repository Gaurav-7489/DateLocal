import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const bridgeCode = requestUrl.searchParams.get("code");
  const isBridge = requestUrl.searchParams.get("bridge") === "1";

  if (!isBridge || !bridgeCode) {
    const extrovert = (process.env.EXTROVERT_URL || "http://localhost:3000").replace(/\/$/, "");
    const returnTo = `${requestUrl.origin}/auth/callback`;
    return NextResponse.redirect(
      `${extrovert}/auth/datebu?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  const extrovert = (process.env.EXTROVERT_URL || "http://localhost:3000").replace(/\/$/, "");
  const bridgeSecret = process.env.EXTROVERT_DATEBU_BRIDGE_SECRET;

  if (!bridgeSecret) {
    console.error("EXTROVERT_DATEBU_BRIDGE_SECRET is not configured");
    return NextResponse.redirect(new URL(`${routes.login}?error=configuration`, requestUrl.origin));
  }

  const returnTo = `${requestUrl.origin}/auth/callback`;
  const exchangeResponse = await fetch(`${extrovert}/api/auth/datebu/exchange`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-extrovert-bridge-secret": bridgeSecret,
    },
    body: JSON.stringify({ code: bridgeCode, returnTo }),
    cache: "no-store",
  });

  if (!exchangeResponse.ok) {
    console.error("Extrovert auth bridge exchange failed", exchangeResponse.status);
    return NextResponse.redirect(new URL(`${routes.login}?error=verification_failed`, requestUrl.origin));
  }

  const payload = await exchangeResponse.json() as {
    user_id?: string;
    access_token?: string;
    refresh_token?: string;
  };

  if (!payload.user_id || !payload.access_token || !payload.refresh_token) {
    return NextResponse.redirect(new URL(`${routes.login}?error=verification_failed`, requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });

  if (sessionError) {
    console.error("DateBu session bootstrap failed:", sessionError.message);
    return NextResponse.redirect(new URL(`${routes.login}?error=session_failed`, requestUrl.origin));
  }

  // Extrovert is the source of truth for identity. DateBu keeps a local
  // projection only because its existing dating queries expect public.profiles.
  const { data: extrovertProfile } = await supabase
    .from("extrovert_profiles")
    .select("id, display_name, date_of_birth, gender, bio, profile_completed, verification_status, area_verification_status, trust_state")
    .eq("id", payload.user_id)
    .maybeSingle();

  const authorized = Boolean(
    extrovertProfile?.profile_completed &&
      extrovertProfile.verification_status === "verified" &&
      extrovertProfile.area_verification_status === "verified" &&
      extrovertProfile.trust_state !== "banned",
  );

  if (!authorized) {
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.redirect(new URL(`${routes.login}?error=extrovert_verification_required`, requestUrl.origin));
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("department, academic_year, ghost_mode")
    .eq("id", payload.user_id)
    .maybeSingle();

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: payload.user_id,
      display_name: extrovertProfile.display_name,
      date_of_birth: extrovertProfile.date_of_birth,
      gender: extrovertProfile.gender,
      department: existingProfile?.department || "General",
      academic_year: existingProfile?.academic_year || "postgraduate",
      bio: extrovertProfile.bio,
      profile_completed: true,
      ghost_mode: existingProfile?.ghost_mode ?? false,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (profileError) {
    console.error("DateBu identity projection failed:", profileError.message);
    return NextResponse.redirect(new URL(`${routes.login}?error=profile_sync_failed`, requestUrl.origin));
  }

  const { error: preferenceError } = await supabase
    .from("dating_preferences")
    .upsert({ user_id: payload.user_id }, { onConflict: "user_id", ignoreDuplicates: true });

  if (preferenceError) {
    console.error("DateBu preference bootstrap failed:", preferenceError.message);
  }

  return NextResponse.redirect(new URL(routes.app, requestUrl.origin));
}
