/**
 * Supabase middleware helper.
 *
 * Responsibilities:
 * - Refresh Supabase auth sessions.
 * - Protect authenticated app routes.
 * - Protect admin routes with server-side role checks.
 * - Enforce Face Verification and Profile onboarding sequence:
 *   Auth -> Face Verification (if enabled) -> Profile Setup -> App
 *
 * Performance:
 * - Executes profile and face verification checks concurrently via Promise.all
 * - Preserves cookie state across all redirect branches
 */

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
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options,
            ),
          );
        },
      },
    },
  );

  /*
   * IMPORTANT:
   * getUser() validates the authenticated user with Supabase.
   * Do not replace this with getSession() for authorization.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname === routes.login ||
    pathname === routes.register ||
    pathname === routes.verify ||
    pathname === routes.verifyFace;

  const isAppRoute =
    pathname === routes.app ||
    pathname.startsWith("/app/");

  const isAdminRoute =
    pathname === routes.admin.root ||
    pathname.startsWith("/admin/");

  const isOnboardingRoute =
    pathname === routes.profileSetup;

  const isProfileRoute =
    pathname === routes.profile;

  const isFaceVerifyRoute =
    pathname === routes.verifyFace;

  /*
   * ---------------------------------------------------------
   * 1. BLOCK UNAUTHENTICATED ACCESS
   * ---------------------------------------------------------
   */

  if (!user && (isAppRoute || isAdminRoute || isFaceVerifyRoute)) {
    const redirectUrl = new URL(
      routes.login,
      request.url,
    );

    const redirectResponse = NextResponse.redirect(redirectUrl);

    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => {
        redirectResponse.cookies.set(
          cookie.name,
          cookie.value,
        );
      });

    return redirectResponse;
  }

  /*
   * ---------------------------------------------------------
   * 2. AUTHENTICATED USER LOGIC
   * ---------------------------------------------------------
   */

  if (user) {
    /*
     * Fetch profile details and face verification status in parallel.
     * Only queries face_verifications if the feature flag is active.
     */
    const [profileResult, faceResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("profile_completed, role")
        .eq("id", user.id)
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

    const isFaceVerified =
      !featureFlags.ENABLE_CAMERA_VERIFICATION ||
      faceResult.data?.status === "verified";

    /*
     * -------------------------------------------------------
     * 3. ADMIN ROUTE PROTECTION
     * -------------------------------------------------------
     */
    if (isAdminRoute) {
      const role = profile?.role;
      const hasAdminAccess = !!role && ADMIN_ROLES.includes(role);

      if (!hasAdminAccess) {
        const redirectResponse = NextResponse.redirect(
          new URL(routes.app, request.url),
        );

        supabaseResponse.cookies
          .getAll()
          .forEach((cookie) => {
            redirectResponse.cookies.set(
              cookie.name,
              cookie.value,
            );
          });

        return redirectResponse;
      }
    }

    /*
     * -------------------------------------------------------
     * 4. AUTH ROUTE REDIRECTS (Already Logged In)
     * -------------------------------------------------------
     */
    if (isAuthRoute) {
      let targetPath: string = routes.app;

      if (!isFaceVerified) {
        targetPath = routes.verifyFace;
      } else if (!isProfileComplete) {
        targetPath = routes.profileSetup;
      }

      if (pathname !== targetPath) {
        const redirectResponse = NextResponse.redirect(
          new URL(targetPath, request.url),
        );

        supabaseResponse.cookies
          .getAll()
          .forEach((cookie) => {
            redirectResponse.cookies.set(
              cookie.name,
              cookie.value,
            );
          });

        return redirectResponse;
      }
    }

    /*
     * -------------------------------------------------------
     * 5. FACE VERIFICATION GATING
     * -------------------------------------------------------
     * If camera verification is required and unverified, block
     * access to main app routes and profile setup.
     */
    if (!isFaceVerified && (isAppRoute || isOnboardingRoute)) {
      const redirectResponse = NextResponse.redirect(
        new URL(routes.verifyFace, request.url),
      );

      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) => {
          redirectResponse.cookies.set(
            cookie.name,
            cookie.value,
          );
        });

      return redirectResponse;
    }

    /*
     * -------------------------------------------------------
     * 6. PROFILE ONBOARDING PROTECTION
     * -------------------------------------------------------
     * Users without completed profile must finish setup.
     */
    if (
      !isProfileComplete &&
      isAppRoute &&
      !isOnboardingRoute &&
      !isProfileRoute
    ) {
      const redirectResponse = NextResponse.redirect(
        new URL(routes.profileSetup, request.url),
      );

      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) => {
          redirectResponse.cookies.set(
            cookie.name,
            cookie.value,
          );
        });

      return redirectResponse;
    }
  }

  /*
   * ---------------------------------------------------------
   * 7. ALLOW REQUEST
   * ---------------------------------------------------------
   */
  return supabaseResponse;
}