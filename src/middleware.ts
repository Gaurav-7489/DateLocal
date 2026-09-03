import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only run auth/session middleware where it can affect navigation.
  // Public pages and static assets no longer pay the Supabase middleware cost.
  matcher: [
    "/login",
    "/register",
    "/app/:path*",
    "/admin/:path*",
    "/verify",
    "/reset-password",
  ],
};
