"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUuid } from "@/lib/validation";

export type LikeResult = {
  error: string | null;
  matched: boolean;
  matchId?: string;
};

export type ActionResult = {
  error: string | null;
  success?: boolean;
};

export async function likeProfile(profileId: string): Promise<LikeResult> {
  if (!isUuid(profileId)) {
    return { error: "Invalid profile.", matched: false };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in to like someone.",
      matched: false,
    };
  }

  if (user.id === profileId) {
    return {
      error: "You cannot like your own profile.",
      matched: false,
    };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  const isPremium =
    subscription?.plan === "pro" &&
    subscription.status === "active" &&
    !!subscription.current_period_end &&
    new Date(subscription.current_period_end).getTime() > Date.now();

  if (!isPremium) {
    const { count: likeCount, error: likeCountError } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("liker_id", user.id);
    if (likeCountError) {
      console.error("Like limit check failed:", likeCountError);
      return { error: "We couldn't check your like limit. Please try again.", matched: false };
    }
    if ((likeCount ?? 0) >= 5) {
      return { error: "You've used all 5 free likes. Unlock DateBu Extrovert for unlimited likes.", matched: false };
    }
  }

  // Check if either user has blocked the other
  const { data: blockRecord, error: blockError } = await supabase
    .from("blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${user.id},blocked_id.eq.${profileId}),and(blocker_id.eq.${profileId},blocked_id.eq.${user.id})`,
    )
    .maybeSingle();

  if (blockError) {
    console.error("Block check failed:", blockError);
  }

  if (blockRecord) {
    return {
      error: "This user is unavailable.",
      matched: false,
    };
  }

  // Make sure target profile exists and is available
  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id, display_name, profile_completed, ghost_mode")
    .eq("id", profileId)
    .maybeSingle();

  if (
    targetError ||
    !targetProfile ||
    !targetProfile.profile_completed ||
    targetProfile.ghost_mode
  ) {
    return {
      error: "That profile is no longer available.",
      matched: false,
    };
  }

  // Save our like
  const { error: likeError } = await supabase.from("likes").insert({
    liker_id: user.id,
    liked_id: profileId,
  });

  if (likeError && likeError.code !== "23505") {
    console.error("Like failed:", likeError);

    return {
      error: "Couldn't save your like. Please try again.",
      matched: false,
    };
  }

  // Check whether they already liked us.
  // RLS allows users to read likes they sent OR received.
  const { data: reciprocalLike, error: reciprocalError } = await supabase
    .from("likes")
    .select("id")
    .eq("liker_id", profileId)
    .eq("liked_id", user.id)
    .maybeSingle();

  if (reciprocalError) {
    console.error("Reciprocal like check failed:", reciprocalError);

    return {
      error: "Your like was saved, but we couldn't check for a match.",
      matched: false,
    };
  }

  // No mutual like yet.
  if (!reciprocalLike) {
    revalidatePath(routes.discover);

    return {
      error: null,
      matched: false,
    };
  }

  // Canonical ordering required by matches CHECK constraint.
  const [userA, userB] =
    user.id < profileId
      ? [user.id, profileId]
      : [profileId, user.id];

  // Check whether the match already exists.
  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .maybeSingle();

  if (existingMatchError) {
    console.error("Existing match check failed:", existingMatchError);

    return {
      error: "Mutual like detected, but we couldn't load the match.",
      matched: false,
    };
  }

  // Match already exists.
  if (existingMatch) {
    revalidatePath(routes.discover);
    revalidatePath(routes.matches);
    revalidatePath(routes.messages);

    return {
      error: null,
      matched: true,
      matchId: existingMatch.id,
    };
  }

  // Create the match.
  const { data: newMatch, error: matchError } = await supabase
    .from("matches")
    .insert({
      user_a: userA,
      user_b: userB,
    })
    .select("id")
    .single();

  // Race condition: both sides may create the match at almost
  // exactly the same time. If that happens, fetch the existing one.
  if (matchError) {
    if (matchError.code === "23505") {
      const { data: raceMatch, error: raceMatchError } = await supabase
        .from("matches")
        .select("id")
        .eq("user_a", userA)
        .eq("user_b", userB)
        .maybeSingle();

      if (raceMatchError || !raceMatch) {
        console.error(
          "Match already existed but could not be loaded:",
          raceMatchError,
        );

        return {
          error: "You matched, but we couldn't load the match.",
          matched: false,
        };
      }

      revalidatePath(routes.discover);
      revalidatePath(routes.matches);
      revalidatePath(routes.messages);

      return {
        error: null,
        matched: true,
        matchId: raceMatch.id,
      };
    }

    console.error("Match creation failed:", matchError);

    return {
      error: "Mutual like registered, but match creation failed.",
      matched: false,
    };
  }

  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  revalidatePath(routes.messages);

  return {
    error: null,
    matched: true,
    matchId: newMatch.id,
  };
}

export async function passProfile(profileId: string): Promise<ActionResult> {
  if (!isUuid(profileId)) {
    return { error: "Invalid profile." };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in to pass someone.",
    };
  }

  if (user.id === profileId) {
    return {
      error: "You cannot pass your own profile.",
    };
  }

  const { error: passError } = await supabase.from("passes").insert({
    passer_id: user.id,
    passed_id: profileId,
  });

  if (passError && passError.code !== "23505") {
    console.error("Pass failed:", passError);
    return {
      error: "Couldn't save your pass. Please try again.",
    };
  }

  revalidatePath(routes.discover);

  return {
    error: null,
    success: true,
  };
}

export async function resetPassedProfiles(): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  const { error } = await supabase
    .from("passes")
    .delete()
    .eq("passer_id", user.id);

  if (error) {
    console.error("Failed to reset passed profiles:", error);
    return {
      error: "Couldn't bring back passed profiles. Please try again.",
    };
  }

  revalidatePath(routes.discover);

  return {
    error: null,
    success: true,
  };
}

export async function blockUser(targetUserId: string): Promise<ActionResult> {
  if (!isUuid(targetUserId)) {
    return { error: "Invalid profile." };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to block a user." };
  }

  if (user.id === targetUserId) {
    return { error: "You cannot block yourself." };
  }

  // Insert block
  const { error: blockError } = await supabase.from("blocks").insert({
    blocker_id: user.id,
    blocked_id: targetUserId,
  });

  if (blockError && blockError.code !== "23505") {
    console.error("Block failed:", blockError);
    return { error: "Failed to block user. Please try again." };
  }

  // Delete matches between these two users
  const [userA, userB] =
    user.id < targetUserId ? [user.id, targetUserId] : [targetUserId, user.id];

  await supabase
    .from("matches")
    .delete()
    .eq("user_a", userA)
    .eq("user_b", userB);

  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  revalidatePath(routes.messages);
  revalidatePath(routes.settings);

  return { error: null, success: true };
}

export async function unblockUser(targetUserId: string): Promise<ActionResult> {
  if (!isUuid(targetUserId)) {
    return { error: "Invalid profile." };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to unblock a user." };
  }

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

  if (error) {
    return { error: "Failed to unblock user." };
  }

  revalidatePath(routes.settings);
  revalidatePath(routes.discover);

  return { error: null, success: true };
}

export async function reportUser(
  targetUserId: string,
  reason: string,
  details?: string,
): Promise<ActionResult> {
  if (!isUuid(targetUserId)) {
    return { error: "Invalid profile." };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a report." };
  }

  if (user.id === targetUserId) {
    return { error: "You cannot report yourself." };
  }

  if (!reason.trim()) {
    return { error: "Please select or provide a reason for the report." };
  }

  if (reason.trim().length > 120 || (details?.trim().length ?? 0) > 500) {
    return { error: "Report details are too long." };
  }

  const { error: reportError } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: targetUserId,
    reason: reason.trim(),
    details: details?.trim() || null,
  });

  if (reportError) {
    console.error("Report failed:", reportError);
    return { error: "Failed to submit report. Please try again." };
  }

  // Also auto-block the reported user
  await supabase.from("blocks").upsert({
    blocker_id: user.id,
    blocked_id: targetUserId,
  }, { onConflict: "blocker_id,blocked_id" });

  revalidatePath(routes.discover);
  revalidatePath(routes.matches);

  return { error: null, success: true };
}

export async function toggleGhostMode(enabled: boolean): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription || subscription.status !== "active" || subscription.plan === "free") {
    return {
      error: "Ghost Mode is a premium feature. Upgrade from the payment page to unlock it.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ghost_mode: enabled })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to update ghost mode." };
  }

  revalidatePath(routes.settings);
  revalidatePath(routes.profile);
  revalidatePath(routes.app);

  return { error: null, success: true };
}
