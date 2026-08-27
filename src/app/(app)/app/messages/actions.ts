"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function sendMessage(matchId: string, content: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
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

  // Verify that the user belongs to this match.
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (matchError || !match) {
    return {
      error: "This conversation is not available.",
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

  return {
    error: null,
    message,
  };
}
