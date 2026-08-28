"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

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

  // Check if either user has blocked the other
  const { data: blockRecord } = await supabase
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${profileId}),and(blocker_id.eq.${profileId},blocked_id.eq.${user.id})`)
    .maybeSingle();

  if (blockRecord) {
    return {
      error: "This user is unavailable.",
      matched: false,
    };
  }

  // Ensure target profile exists and is complete
  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id, display_name, profile_completed, ghost_mode")
    .eq("id", profileId)
    .maybeSingle();

  if (targetError || !targetProfile || !targetProfile.profile_completed || targetProfile.ghost_mode) {
    return {
      error: "That profile is no longer available.",
      matched: false,
    };
  }

  // Create the like
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

  // Check whether the other user already liked us
  const { data: reciprocalLike, error: reciprocalError } = await supabase
    .from("likes")
    .select("id")
    .eq("liker_id", profileId)
    .eq("liked_id", user.id)
    .maybeSingle();

  if (reciprocalError) {
    console.error("Match check failed:", reciprocalError);
    return {
      error: null,
      matched: false,
    };
  }

  if (!reciprocalLike) {
    return {
      error: null,
      matched: false,
    };
  }

  // Order UUIDs canonically: user_a < user_b
  const [userA, userB] =
    user.id < profileId ? [user.id, profileId] : [profileId, user.id];

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .insert({
      user_a: userA,
      user_b: userB,
    })
    .select("id")
    .single();

  if (matchError && matchError.code !== "23505") {
    console.error("Match creation failed:", matchError);
    return {
      error: "Mutual like registered, but match record could not be finalized.",
      matched: false,
    };
  }

  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  revalidatePath(routes.messages);

  return {
    error: null,
    matched: true,
    matchId: matchData?.id,
  };
}

export async function passProfile(profileId: string): Promise<ActionResult> {
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

export async function blockUser(targetUserId: string): Promise<ActionResult> {
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