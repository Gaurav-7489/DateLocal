"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
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

/**
 * Permanently deletes the currently authenticated account.
 * The confirmation word is intentionally checked on the server so the
 * destructive operation cannot be triggered by client-side UI alone.
 */
export async function deleteAccount(confirmation: string) {
  if (confirmation.trim().toLowerCase() !== "delete") {
    return { error: 'Type "delete" exactly to confirm account deletion.' };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Your session has expired. Please sign in again." };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    console.error("Account deletion is not configured: missing Supabase service-role environment variables.");
    return { error: "Account deletion is temporarily unavailable. Please try again later." };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Failed to delete account", {
      userId: user.id,
      message: deleteError.message,
    });
    return { error: "We couldn't delete your account. Nothing was changed." };
  }

  await supabase.auth.signOut();
  redirect(routes.login);
}
