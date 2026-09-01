import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");

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

  if (!user) {
    return NextResponse.redirect(new URL(routes.login, requestUrl.origin));
  }

  // profile_completed is the single source of truth for setup completion.
  // Do not make login depend on a second photo query: that query is protected
  // by RLS and can incorrectly look empty during an OAuth callback.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile completion check failed:", profileError.message);
    return NextResponse.redirect(new URL(routes.profileSetup, requestUrl.origin));
  }

  if (!profile?.profile_completed) {
    return NextResponse.redirect(new URL(routes.profileSetup, requestUrl.origin));
  }

  const targetPath = requestedNext?.startsWith("/") ? requestedNext : routes.app;
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}
