import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

const PRODUCTION_EXTROVERT_URL = "https://extrovert-ten.vercel.app";

function getExtrovertUrl() {
  const configured = process.env.EXTROVERT_URL?.replace(/\/$/, "");
  const isVercel = process.env.VERCEL === "1";
  if (configured && !(isVercel && /^https?:\/\/localhost(?::\d+)?$/i.test(configured))) return configured;
  return isVercel ? PRODUCTION_EXTROVERT_URL : "http://localhost:3000";
}

function ageFromDob(dob: string | null) {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const month = now.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const bridgeCode = requestUrl.searchParams.get("code")?.trim();
  const isBridge = requestUrl.searchParams.get("bridge") === "1";
  const extrovert = getExtrovertUrl();
  const expectedReturnTo = `${requestUrl.origin}/auth/callback`;

  if (!isBridge || !bridgeCode) {
    return NextResponse.redirect(`${extrovert}/auth/datelocal?returnTo=${encodeURIComponent(expectedReturnTo)}`);
  }

  const codeHash = createHash("sha256").update(bridgeCode).digest("hex");
  const admin = createAdminClient();
  const { data: bridge } = await admin
    .from("extrovert_datelocal_auth_bridges")
    .select("id,user_id,access_token,refresh_token,return_to,expires_at,consumed_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (!bridge || bridge.consumed_at || new Date(bridge.expires_at).getTime() <= Date.now() || bridge.return_to !== expectedReturnTo) {
    return NextResponse.redirect(new URL(`${routes.login}?error=verification_failed`, requestUrl.origin));
  }

  // Consume the bridge before creating the local session. The conditional
  // delete makes the code single-use even if two callback requests race.
  const { data: consumed, error: consumeError } = await admin
    .from("extrovert_datelocal_auth_bridges")
    .delete()
    .eq("id", bridge.id)
    .is("consumed_at", null)
    .select("id");

  if (consumeError || !consumed?.length) {
    return NextResponse.redirect(new URL(`${routes.login}?error=verification_failed`, requestUrl.origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error: sessionError } = await supabase.auth.setSession({ access_token: bridge.access_token, refresh_token: bridge.refresh_token });
  if (sessionError) return NextResponse.redirect(new URL(`${routes.login}?error=session_failed`, requestUrl.origin));

  const { data: extrovertProfile } = await supabase
    .from("extrovert_profiles")
    .select("id, display_name, date_of_birth, gender, bio, profile_completed, verification_status, area_verification_status, trust_state")
    .eq("id", bridge.user_id)
    .maybeSingle();
  const age = ageFromDob(extrovertProfile?.date_of_birth ?? null);
  const authorized = Boolean(extrovertProfile?.profile_completed && age !== null && age >= 18 && extrovertProfile.trust_state !== "banned");
  if (!authorized || !extrovertProfile) {
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.redirect(new URL(`${routes.login}?error=extrovert_profile_required`, requestUrl.origin));
  }

  const { data: existingProfile } = await supabase.from("profiles").select("department, academic_year, ghost_mode").eq("id", bridge.user_id).maybeSingle();
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: bridge.user_id,
      display_name: extrovertProfile.display_name,
      date_of_birth: extrovertProfile.date_of_birth,
      gender: extrovertProfile.gender,
      department: existingProfile?.department || "General",
      academic_year: existingProfile?.academic_year || "postgraduate",
      bio: extrovertProfile.bio,
      profile_completed: true,
      ghost_mode: existingProfile?.ghost_mode ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (profileError) return NextResponse.redirect(new URL(`${routes.login}?error=profile_sync_failed`, requestUrl.origin));

  const { error: preferenceError } = await supabase.from("dating_preferences").upsert({ user_id: bridge.user_id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (preferenceError) console.error("DateLocal preference bootstrap failed:", preferenceError.message);

  return NextResponse.redirect(new URL(routes.app, requestUrl.origin));
}
