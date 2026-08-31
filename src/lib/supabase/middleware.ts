import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { ADMIN_ROLES } from "@/types/roles";
import { featureFlags } from "@/config/features";

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

  // Bypass static assets and image assets
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

  /*
   * 1. BLOCK UNAUTHENTICATED ACCESS
   */
  if (!user && (isAppRoute || isAdminRoute || isFaceVerifyRoute)) {
    const redirectUrl = new URL(routes.login, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  /*
   * 2. AUTHENTICATED USER LOGIC
   */
  if (user) {
    // 2a. Require Email Confirmation First
    const isEmailConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
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

    // 2b. Parallel Evaluation: Profile, Primary Photo & optional Face Verification
    const [profileResult, primaryPhotoResult, faceResult] = await Promise.all([
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
      featureFlags.ENABLE_CAMERA_VERIFICATION
        ? supabase
            .from("face_verifications")
            .select("status")
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const profile = profileResult.data;
    const isProfileComplete = Boolean(profile?.profile_completed);
    const hasPrimaryPhoto = Boolean(primaryPhotoResult.data?.id);
    const isFaceVerified =
      !featureFlags.ENABLE_CAMERA_VERIFICATION ||
      faceResult.data?.status === "verified";

    // 3. ADMIN ROUTE PROTECTION
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

    // 4. STEP 1: PROFILE + PRIMARY PHOTO
    //
    // Profile setup is always allowed to remain open so users can
    // finish or edit their profile without middleware fighting the form.
    //
    // Incomplete users are blocked from the main application and face
    // verification until the profile and primary photo exist.
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

    // 5. STEP 2: CAMERA VERIFICATION
    //
    // This gate is completely disabled when the feature flag is false.
    // When enabled, the user reaches face verification only after the
    // profile and primary photo have been successfully persisted.
    if (featureFlags.ENABLE_CAMERA_VERIFICATION && !isFaceVerified) {
      if ((isAppRoute && !isOnboardingRoute) || isAuthRoute) {
        if (pathname !== routes.verifyFace) {
          const redirectResponse = NextResponse.redirect(
            new URL(routes.verifyFace, request.url)
          );

          supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
          });

          return redirectResponse;
        }
      }

      return supabaseResponse;
    }

    // 6. FULLY ONBOARDED USERS
    // Prevent re-accessing Auth routes once fully onboarded.
    // The disabled face-verification route stays reachable so its
    // Coming Soon screen can be shown without enabling the feature.
    if (isAuthRoute || (isFaceVerifyRoute && featureFlags.ENABLE_CAMERA_VERIFICATION)) {
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
