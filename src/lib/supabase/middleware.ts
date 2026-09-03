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
      return isLocal
        ? ["localhost", "127.0.0.1"].includes(hostname)
        : !["localhost", "127.0.0.1"].includes(hostname);
    } catch {
      return false;
    }
  });

  return preferred || configured[0] || "http://localhost:3000";
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === routes.login || pathname === routes.register;
  const isAppRoute = pathname === routes.app || pathname.startsWith("/app/");
  const isAdminRoute = pathname === routes.admin.root || pathname.startsWith("/admin/");
  const isFaceVerifyRoute = pathname === routes.verifyFace;

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
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;

  if (!userId && (isAppRoute || isAdminRoute || isFaceVerifyRoute)) {
    return NextResponse.redirect(new URL(routes.login, request.url));
  }

  if (!userId) return supabaseResponse;

  if (isAppRoute || isAdminRoute || isFaceVerifyRoute) {
    const { data: extrovertProfile } = await supabase
      .from("extrovert_profiles")
      .select("profile_completed, trust_state")
      .eq("id", userId)
      .maybeSingle();

    const extrovertAuthorized = Boolean(
      extrovertProfile?.profile_completed && extrovertProfile.trust_state !== "banned",
    );

    if (!extrovertAuthorized) {
      const extrovert = getExtrovertOrigin(request);
      const returnTo = `${request.nextUrl.origin}/auth/callback`;
      const redirectUrl = `${extrovert}/auth/datelocal?returnTo=${encodeURIComponent(returnTo)}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    const hasAdminAccess =
      isSuperAdminUser(userId) || Boolean(profile?.role && ADMIN_ROLES.includes(profile.role));
    if (!hasAdminAccess) return NextResponse.redirect(new URL(routes.app, request.url));
  }

  if (isAuthRoute) return NextResponse.redirect(new URL(routes.app, request.url));

  return supabaseResponse;
}
