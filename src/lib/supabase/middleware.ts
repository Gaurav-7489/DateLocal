import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { ADMIN_ROLES, isSuperAdminUser } from "@/types/roles";

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
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

  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|wasm|bin|ico)$/)
  ) {
    return supabaseResponse;
  }

  // Auth pages are only login/register now. The old email-verification page is
  // intentionally no longer part of the authentication gate because DateBu
  // currently accepts Google authentication and university-email accounts with
  // Supabase Confirm Email disabled.
  const isAuthRoute = pathname === routes.login || pathname === routes.register;
  const isAppRoute = pathname === routes.app || pathname.startsWith("/app/");
  const isAdminRoute = pathname === routes.admin.root || pathname.startsWith("/admin/");
  const isOnboardingRoute = pathname === routes.profileSetup;
  const isFaceVerifyRoute = pathname === routes.verifyFace;

  if (!user && (isAppRoute || isAdminRoute || isFaceVerifyRoute)) {
    const redirectUrl = new URL(routes.login, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  if (user) {
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

    if (isAdminRoute) {
      const hasAdminAccess =
        isSuperAdminUser(user.id) ||
        Boolean(profile?.role && ADMIN_ROLES.includes(profile.role));

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

    // Both supported authentication methods enter the same onboarding gate.
    // New Google users and new university-email users are sent to profile setup
    // until they have completed their profile and added a primary photo.
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
