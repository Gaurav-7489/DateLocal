/**
 * Supabase admin client — SERVER-ONLY.
 *
 * Uses SERVICE_ROLE key which BYPASSES ALL RLS.
 * Must NEVER be imported from client components.
 *
 * The "server-only" import causes a build error if any client
 * component tries to import this module.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL for admin operations.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
