import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Extrovert -> DateLocal one-time identity handoff.
 *
 * Extrovert owns the identity session. DateLocal only consumes the short-lived
 * bridge and then uses that same Supabase auth identity for dating data.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code) return NextResponse.redirect(new URL("/auth/login?error=missing_handoff", request.url));

  const admin = createAdminClient();
  const codeHash = createHash("sha256").update(code).digest("hex");
  const { data: bridge } = await admin
    .from("extrovert_datebu_auth_bridges")
    .select("id,user_id,access_token,refresh_token,return_to,expires_at,consumed_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (!bridge || bridge.consumed_at || new Date(bridge.expires_at).getTime() <= Date.now()) {
    return NextResponse.redirect(new URL("/auth/login?error=expired_handoff", request.url));
  }

  const returnTo = bridge.return_to.startsWith("/app/messages/social/")
    ? bridge.return_to
    : "/app";

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.setSession({
    access_token: bridge.access_token,
    refresh_token: bridge.refresh_token,
  });
  if (error) return NextResponse.redirect(new URL("/auth/login?error=handoff_failed", request.url));

  await admin
    .from("extrovert_datebu_auth_bridges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", bridge.id)
    .is("consumed_at", null);

  return NextResponse.redirect(new URL(returnTo, request.url));
}
