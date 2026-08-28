/**
 * Supabase middleware helper.
 * Refreshes auth session on every request for Server Components
 * and enforces server-side route protection and onboarding redirects.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname === routes.login ||
    pathname === routes.register ||
    pathname === routes.verify;

  const isAppRoute = pathname === routes.app || pathname.startsWith("/app/");
  const isAdminRoute = pathname === routes.admin.root || pathname.startsWith("/admin/");
  const isOnboardingRoute = pathname === routes.profileSetup;
  const isProfileRoute = pathname === routes.profile;

  // 1. Unauthenticated users attempting to access protected app/admin routes
  if (!user && (isAppRoute || isAdminRoute)) {
    const redirectUrl = new URL(routes.login, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy cookies so session refreshes persist
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // 2. Authenticated users
  if (user) {
    // Check profile completion state
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed")
      .eq("id", user.id)
      .maybeSingle();

    const isProfileComplete = Boolean(profile?.profile_completed);

    // If visiting auth routes while logged in
    if (isAuthRoute) {
      const targetUrl = new URL(
        isProfileComplete ? routes.app : routes.profileSetup,
        request.url,
      );
      const redirectResponse = NextResponse.redirect(targetUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    // If accessing main application routes without a completed profile
    // Exception: /app/profile/setup (the form itself) and /app/profile (can see setup CTA)
    if (!isProfileComplete && isAppRoute && !isOnboardingRoute && !isProfileRoute) {
      const redirectUrl = new URL(routes.profileSetup, request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
