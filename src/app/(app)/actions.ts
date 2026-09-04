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
 * Removes a match for the currently authenticated user.
 * The server verifies that the caller is one of the two matched users,
 * then removes the match and both likes. Messages disappear automatically
 * through the messages.match_id ON DELETE CASCADE constraint.
 */
export async function removeMatch(matchId: string) {
  const normalizedMatchId = matchId.trim();
  if (!normalizedMatchId) return { error: "Invalid match." };

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
    console.error("Match removal is not configured: missing Supabase service-role environment variables.");
    return { error: "We couldn't remove this match right now. Please try again later." };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("id,user_a,user_b")
    .eq("id", normalizedMatchId)
    .maybeSingle();

  if (matchError) {
    console.error("Failed to look up match for removal", matchError.message);
    return { error: "We couldn't remove this match right now. Please try again." };
  }

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    return { error: "This match is no longer available." };
  }

  const { error: deleteMatchError } = await admin
    .from("matches")
    .delete()
    .eq("id", normalizedMatchId);

  if (deleteMatchError) {
    console.error("Failed to remove match", {
      matchId: normalizedMatchId,
      userId: user.id,
      message: deleteMatchError.message,
    });
    return { error: "We couldn't remove this match. Nothing was changed." };
  }

  // Remove the mutual likes too, preventing the deleted match from being
  // immediately recreated by the mutual-like trigger.
  const { error: likesError } = await admin
    .from("likes")
    .delete()
    .or(
      `and(liker_id.eq.${match.user_a},liked_id.eq.${match.user_b}),and(liker_id.eq.${match.user_b},liked_id.eq.${match.user_a})`
    );

  if (likesError) {
    // The match is already gone, so don't report a false rollback. The next
    // interaction can simply create fresh likes if both users choose to.
    console.error("Match removed but mutual likes could not be cleared", {
      matchId: normalizedMatchId,
      message: likesError.message,
    });
  }

  return { success: true };
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
