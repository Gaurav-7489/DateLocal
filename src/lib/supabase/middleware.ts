import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routes } from "@/config/routes";
import { ADMIN_ROLES, isSuperAdminUser } from "@/types/roles";

function getExtrovertOrigin(request: NextRequest) {
  const configured = (process.env.EXTROVERT_URL || "http://localhost:3000")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const isLocal = ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname);
  const preferred = configured.find((value) => {
    try {
      const hostname = new URL(value).hostname;
      return isLocal ? ["localhost", "127.0.0.1"].includes(hostname) : !["localhost", "127.0.0.1"].includes(hostname);
    } catch {
      return false;
    }
  });

  return preferred || configured[0] || "http://localhost:3000";
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|wasm|bin|ico)$/)) return supabaseResponse;

  const isAuthRoute = pathname === routes.login || pathname === routes.register;
  const isAppRoute = pathname === routes.app || pathname.startsWith("/app/");
  const isAdminRoute = pathname === routes.admin.root || pathname.startsWith("/admin/");
  const isFaceVerifyRoute = pathname === routes.verifyFace;

  if (!user && (isAppRoute || isAdminRoute || isFaceVerifyRoute)) {
    return NextResponse.redirect(new URL(routes.login, request.url));
  }

  if (!user) return supabaseResponse;

  // Extrovert is the identity, human-verification, locality-verification and
  // trust authority. DateLocal never grants access from its own verification state.
  const { data: extrovertProfile } = await supabase
    .from("extrovert_profiles")
    .select("profile_completed, verification_status, area_verification_status, trust_state")
    .eq("id", user.id)
    .maybeSingle();

  const extrovertAuthorized = Boolean(
    extrovertProfile?.profile_completed &&
      extrovertProfile.verification_status === "verified" &&
      extrovertProfile.area_verification_status === "verified" &&
      extrovertProfile.trust_state !== "banned",
  );

  if (isAppRoute || isAdminRoute || isFaceVerifyRoute) {
    if (!extrovertAuthorized) {
      const extrovert = getExtrovertOrigin(request);
      const returnTo = `${request.nextUrl.origin}/auth/callback`;
      const redirectUrl = `${extrovert}/auth/datelocal?returnTo=${encodeURIComponent(returnTo)}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_completed, role")
    .eq("id", user.id)
    .maybeSingle();

  if (isAdminRoute) {
    const hasAdminAccess = isSuperAdminUser(user.id) || Boolean(profile?.role && ADMIN_ROLES.includes(profile.role));
    if (!hasAdminAccess) return NextResponse.redirect(new URL(routes.app, request.url));
  }

  const isProfileComplete = Boolean(profile?.profile_completed);
  if (!isProfileComplete && isAppRoute && !pathname.startsWith(routes.profileSetup)) {
    return NextResponse.redirect(new URL(routes.profileSetup, request.url));
  }

  if (isAuthRoute) return NextResponse.redirect(new URL(routes.app, request.url));

  return supabaseResponse;
}
