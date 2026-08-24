"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

/**
 * Server action to sign the user out.
 * Clears the Supabase session and redirects to login.
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect(routes.login);
}
