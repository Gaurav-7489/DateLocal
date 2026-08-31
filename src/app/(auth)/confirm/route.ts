import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set<EmailOtpType>([
  "email",
  "recovery",
  "email_change",
  "invite",
  "magiclink",
  "signup",
]);

function safeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type") as EmailOtpType | null;
  const type = rawType && ALLOWED_TYPES.has(rawType) ? rawType : null;

  const fallback = type === "recovery" ? routes.resetPassword : routes.verify;
  const next = safeNext(url.searchParams.get("next"), fallback);

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL(`${routes.login}?error=invalid_verification_link`, url.origin),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error("Auth confirmation error:", error.message);
    return NextResponse.redirect(
      new URL(
        `${next}${next.includes("?") ? "&" : "?"}error=verification_failed`,
        url.origin,
      ),
    );
  }

  // Signup/email verification: send the user into the normal profile gate.
  if (type === "email" || type === "signup" || type === "email_change") {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && type !== "email_change") {
      const [{ data: profile }, { data: primaryPhoto }] = await Promise.all([
        supabase
          .from("profiles")
          .select("profile_completed")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("profile_photos")
          .select("id")
          .eq("profile_id", user.id)
          .eq("is_primary", true)
          .maybeSingle(),
      ]);

      if (!profile?.profile_completed || !primaryPhoto?.id) {
        return NextResponse.redirect(new URL(routes.profileSetup, url.origin));
      }
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
