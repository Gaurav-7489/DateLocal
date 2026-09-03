import { NextResponse } from "next/server";
import { routes } from "@/config/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const bridge = requestUrl.searchParams.get("bridge");
  const requestedNext = requestUrl.searchParams.get("next");

  // Extrovert OAuth/login returns here with a one-time DateLocal bridge.
  // Give the client a tiny visual handoff state before consuming the bridge.
  if (bridge === "1" && code) {
    const handoff = new URL("/auth/handoff", requestUrl.origin);
    handoff.searchParams.set("code", code);
    return NextResponse.redirect(handoff);
  }

  if (!code) return NextResponse.redirect(new URL(routes.login, requestUrl.origin));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(new URL(`${routes.login}?error=verification_failed`, requestUrl.origin));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(routes.login, requestUrl.origin));

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile completion check failed:", profileError.message);
    return NextResponse.redirect(new URL(routes.profileSetup, requestUrl.origin));
  }

  if (!profile?.profile_completed) return NextResponse.redirect(new URL(routes.profileSetup, requestUrl.origin));

  const targetPath = requestedNext?.startsWith("/") ? requestedNext : routes.app;
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}
