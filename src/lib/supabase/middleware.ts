import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { ADMIN_ROLES } from "@/types/roles";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Bypass static assets and image/model assets.
  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|wasm|bin|ico)$/)
  ) {
    return supabaseResponse;
  }

  const isAuthRoute =
    pathname === routes.login ||
    pathname === routes.register ||
    pathname === routes.verify;

  const isAppRoute =
    pathname === routes.app || pathname.startsWith("/app/");

  const isAdminRoute =
    pathname === routes.admin.root || pathname.startsWith("/admin/");

  const isOnboardingRoute = pathname === routes.profileSetup;
  const isFaceVerifyRoute = pathname === routes.verifyFace;

  // Unauthenticated users may not access the app, admin area, or the
  // placeholder face-verification page.
  if (!user && (isAppRoute || isAdminRoute || isFaceVerifyRoute)) {
    const redirectUrl = new URL(routes.login, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  if (user) {
    // Step 1: Supabase email confirmation is required first.
    const isEmailConfirmed = Boolean(
      user.email_confirmed_at || user.confirmed_at
    );

    if (!isEmailConfirmed) {
      if (pathname !== routes.verify && !pathname.startsWith("/auth/callback")) {
        const redirectUrl = new URL(routes.verify, request.url);
        redirectUrl.searchParams.set("email", user.email || "");
        const redirectResponse = NextResponse.redirect(redirectUrl);

        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
        });

        return redirectResponse;
      }
      return supabaseResponse;
    }

    // Step 2: Profile + primary photo are required before entering the app.
    const [profileResult, primaryPhotoResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("profile_completed, role")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("profile_photos")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_primary", true)
        .maybeSingle(),
    ]);

    const profile = profileResult.data;
    const isProfileComplete = Boolean(profile?.profile_completed);
    const hasPrimaryPhoto = Boolean(primaryPhotoResult.data?.id);

    // Admin route protection.
    if (isAdminRoute) {
      const role = profile?.role;
      const hasAdminAccess = !!role && ADMIN_ROLES.includes(role);

      if (!hasAdminAccess) {
        const redirectResponse = NextResponse.redirect(
          new URL(routes.app, request.url)
        );
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        return redirectResponse;
      }
    }

    // Profile setup remains open so users can finish or edit their profile.
    if (!isProfileComplete || !hasPrimaryPhoto) {
      if (
        (isAppRoute && !isOnboardingRoute) ||
        isFaceVerifyRoute ||
        isAuthRoute
      ) {
        const redirectResponse = NextResponse.redirect(
          new URL(routes.profileSetup, request.url)
        );

        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
        });

        return redirectResponse;
      }

      return supabaseResponse;
    }

    // Camera/face verification is intentionally not part of onboarding yet.
    // /verify/face remains available only as a Coming Soon placeholder.
    if (isAuthRoute) {
      const redirectResponse = NextResponse.redirect(
        new URL(routes.app, request.url)
      );
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
