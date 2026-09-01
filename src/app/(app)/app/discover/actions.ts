"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUuid } from "@/lib/validation";
import { sendPushToUser } from "@/lib/push/server";

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
  if (!isUuid(profileId)) return { error: "Invalid profile.", matched: false };

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to like someone.", matched: false };
  if (user.id === profileId) return { error: "You cannot like your own profile.", matched: false };

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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("liker_id", user.id)
      .gte("created_at", startOfDay.toISOString());

    if (error) {
      console.error("Like limit check failed:", error);
      return { error: "We couldn't check your like limit. Please try again.", matched: false };
    }

    if ((count ?? 0) >= 10) {
      return {
        error: "You've used all 10 free likes for today. DateBu Extrovert unlocks unlimited likes.",
        matched: false,
      };
    }
  }

  // The database RPC is the single source of truth for the like + mutual-like
  // transaction. Do not insert into likes and then create matches separately.
  const { data: result, error } = await supabase.rpc("like_profile", {
    p_profile_id: profileId,
  });

  if (error) {
    console.error("Like RPC failed:", error);
    const message = error.message || "Couldn't save your like. Please try again.";

    if (message.includes("PROFILE_UNAVAILABLE")) {
      return { error: "That profile is no longer available.", matched: false };
    }
    if (message.includes("USER_UNAVAILABLE")) {
      return { error: "This user is unavailable.", matched: false };
    }
    if (message.includes("AUTH_REQUIRED")) {
      return { error: "You must be logged in to like someone.", matched: false };
    }

    return { error: "Couldn't save your like. Please try again.", matched: false };
  }

  const row = Array.isArray(result) ? result[0] : result;
  const matched = Boolean(row?.matched);
  const matchId = row?.match_id ?? undefined;

  revalidatePath(routes.discover);

  if (matched) {
    revalidatePath(routes.matches);
    revalidatePath(routes.messages);
  }

  // Push notifications are transactional follow-up work. They do not change
  // the like/match result if the push service is unavailable.
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", profileId)
    .maybeSingle();

  const targetName = targetProfile?.display_name || "someone";

  if (matched && matchId) {
    await Promise.all([
      sendPushToUser(profileId, {
        title: "It’s a Match!",
        body: `You and ${targetName === "someone" ? "someone" : "the person you liked"} matched on DateBu.`,
        url: `${routes.messages}/${matchId}`,
        tag: `match-${matchId}`,
      }),
      sendPushToUser(user.id, {
        title: "It’s a Match!",
        body: `You matched with ${targetName}.`,
        url: `${routes.messages}/${matchId}`,
        tag: `match-${matchId}`,
      }),
    ]);
  } else {
    await sendPushToUser(profileId, {
      title: "Someone likes you",
      body: "Someone liked your profile. Open DateBu to see who.",
      url: routes.discover,
      tag: `like-${user.id}`,
    });
  }

  return { error: null, matched, matchId };
}

export async function passProfile(profileId: string): Promise<ActionResult> {
  if (!isUuid(profileId)) return { error: "Invalid profile." };

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to pass someone." };
  if (user.id === profileId) return { error: "You cannot pass your own profile." };

  const { error } = await supabase.from("passes").insert({
    passer_id: user.id,
    passed_id: profileId,
  });

  if (error && error.code !== "23505") {
    console.error("Pass failed:", error);
    return { error: "Couldn't save your pass. Please try again." };
  }

  revalidatePath(routes.discover);
  return { error: null, success: true };
}

export async function resetPassedProfiles(): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in." };

  const { error } = await supabase.from("passes").delete().eq("passer_id", user.id);
  if (error) {
    console.error("Failed to reset passed profiles:", error);
    return { error: "Couldn't bring back passed profiles. Please try again." };
  }

  revalidatePath(routes.discover);
  return { error: null, success: true };
}

export async function blockUser(targetUserId: string): Promise<ActionResult> {
  if (!isUuid(targetUserId)) return { error: "Invalid profile." };

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to block a user." };
  if (user.id === targetUserId) return { error: "You cannot block yourself." };

  const { error } = await supabase.from("blocks").insert({
    blocker_id: user.id,
    blocked_id: targetUserId,
  });

  if (error && error.code !== "23505") {
    console.error("Block failed:", error);
    return { error: "Failed to block user. Please try again." };
  }

  const [userA, userB] = user.id < targetUserId
    ? [user.id, targetUserId]
    : [targetUserId, user.id];

  await supabase.from("matches").delete().eq("user_a", userA).eq("user_b", userB);

  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  revalidatePath(routes.messages);
  revalidatePath(routes.settings);
  return { error: null, success: true };
}

export async function unblockUser(targetUserId: string): Promise<ActionResult> {
  if (!isUuid(targetUserId)) return { error: "Invalid profile." };

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to unblock a user." };

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

  if (error) return { error: "Failed to unblock user." };

  revalidatePath(routes.settings);
  revalidatePath(routes.discover);
  return { error: null, success: true };
}

export async function reportUser(
  targetUserId: string,
  reason: string,
  details?: string,
): Promise<ActionResult> {
  if (!isUuid(targetUserId)) return { error: "Invalid profile." };

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to submit a report." };
  if (user.id === targetUserId) return { error: "You cannot report yourself." };
  if (!reason.trim()) return { error: "Please select or provide a reason for the report." };
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

  await supabase.from("blocks").upsert(
    { blocker_id: user.id, blocked_id: targetUserId },
    { onConflict: "blocker_id,blocked_id" },
  );

  revalidatePath(routes.discover);
  revalidatePath(routes.matches);
  return { error: null, success: true };
}

export async function toggleGhostMode(enabled: boolean): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

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

  if (error) return { error: "Failed to update ghost mode." };

  revalidatePath(routes.settings);
  revalidatePath(routes.profile);
  revalidatePath(routes.app);
  return { error: null, success: true };
}
