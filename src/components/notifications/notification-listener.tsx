"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Keeps realtime channels alive for foreground state while push delivery is
 * handled by the service worker. We intentionally do not render an in-app
 * toast: when the app is backgrounded, the service worker owns the phone
 * notification just like a native messaging app.
 */
export function NotificationListener({ currentUserId }: { currentUserId: string }) {
  useEffect(() => {
    const supabase = createClient();
    const channels = [
      supabase.channel(`global_notifications_messages_${currentUserId}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => undefined,
      ).subscribe(),
      supabase.channel(`global_notifications_matches_a_${currentUserId}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches", filter: `user_a=eq.${currentUserId}` },
        () => undefined,
      ).subscribe(),
      supabase.channel(`global_notifications_matches_b_${currentUserId}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches", filter: `user_b=eq.${currentUserId}` },
        () => undefined,
      ).subscribe(),
      supabase.channel(`global_notifications_likes_${currentUserId}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "likes", filter: `liked_id=eq.${currentUserId}` },
        () => undefined,
      ).subscribe(),
    ];

    return () => {
      for (const channel of channels) void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return null;
}
