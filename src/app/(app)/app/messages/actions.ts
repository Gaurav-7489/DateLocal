"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUuid } from "@/lib/validation";

export type SendMessageResult = {
  error: string | null;
  message?: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
  };
};

export async function sendMessage(
  matchId: string,
  content: string,
): Promise<SendMessageResult> {
  if (!isUuid(matchId)) {
    return { error: "Invalid conversation." };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in to send a message.",
    };
  }

  const text = content.trim();

  if (!text) {
    return {
      error: "Message cannot be empty.",
    };
  }

  if (text.length > 2000) {
    return {
      error: "Message must be 2000 characters or less.",
    };
  }

  // Verify that the user belongs to this match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", matchId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (matchError || !match) {
    return {
      error: "This conversation is no longer available.",
    };
  }

  const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;

  // Verify neither user blocked the other
  const { data: blockRecord } = await supabase
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`)
    .maybeSingle();

  if (blockRecord) {
    return {
      error: "You cannot message this user.",
    };
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: user.id,
      content: text,
    })
    .select("id, sender_id, content, created_at")
    .single();

  if (error) {
    console.error("Send message failed:", error);
    return {
      error: "Couldn't send the message. Please try again.",
    };
  }

  revalidatePath(`${routes.messages}/${matchId}`);
  revalidatePath(routes.messages);

  return {
    error: null,
    message,
  };
}
