/**
 * Supabase middleware helper.
 *
 * Responsibilities:
 * - Refresh Supabase auth sessions.
 * - Protect authenticated app routes.
 * - Protect admin routes with server-side role checks.
 * - Enforce profile onboarding.
 *
 * IMPORTANT:
 * The admin check here is an additional security layer.
 * Admin pages/actions must STILL use requireAdmin().
 */

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
    pathname === routes.verify;

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

  /*
   * ---------------------------------------------------------
   * 1. BLOCK UNAUTHENTICATED ACCESS
   * ---------------------------------------------------------
   */

  if (!user && (isAppRoute || isAdminRoute)) {
    const redirectUrl = new URL(
      routes.login,
      request.url,
    );

    const redirectResponse =
      NextResponse.redirect(redirectUrl);

    /*
     * Preserve refreshed Supabase cookies.
     */
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
     * Get profile information needed for authorization
     * and onboarding.
     *
     * This query uses the normal Supabase server client,
     * NOT the service-role client.
     */
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed, role")
      .eq("id", user.id)
      .maybeSingle();

    const isProfileComplete =
      Boolean(profile?.profile_completed);

    /*
     * -------------------------------------------------------
     * 3. ADMIN ROUTE PROTECTION
     * -------------------------------------------------------
     *
     * Never trust:
     * - hidden buttons
     * - frontend state
     * - URL secrecy
     * - user metadata
     * - localStorage
     *
     * The database role is the authority.
     */
    if (isAdminRoute) {
      const role = profile?.role;

      const hasAdminAccess =
        !!role &&
        ADMIN_ROLES.includes(role);

      if (!hasAdminAccess) {
        const redirectResponse =
          NextResponse.redirect(
            new URL(routes.app, request.url),
          );

        /*
         * Preserve refreshed Supabase cookies.
         */
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
     * 4. AUTH ROUTE REDIRECTS
     * -------------------------------------------------------
     */

    if (isAuthRoute) {
      const targetUrl = new URL(
        isProfileComplete
          ? routes.app
          : routes.profileSetup,
        request.url,
      );

      const redirectResponse =
        NextResponse.redirect(targetUrl);

      /*
       * Preserve refreshed Supabase cookies.
       */
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
     * 5. ONBOARDING PROTECTION
     * -------------------------------------------------------
     *
     * Users without a completed profile must finish setup
     * before accessing the main application.
     *
     * Admin routes are already handled above and are NOT
     * redirected by this onboarding check.
     */
    if (
      !isProfileComplete &&
      isAppRoute &&
      !isOnboardingRoute &&
      !isProfileRoute
    ) {
      const redirectUrl = new URL(
        routes.profileSetup,
        request.url,
      );

      const redirectResponse =
        NextResponse.redirect(redirectUrl);

      /*
       * Preserve refreshed Supabase cookies.
       */
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
   * 6. ALLOW REQUEST
   * ---------------------------------------------------------
   */

  return supabaseResponse;
}