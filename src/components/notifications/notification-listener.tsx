"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/config/routes";
import { MessageCircle, Sparkles, X } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "message" | "match";
  title: string;
  body: string;
  link: string;
}

export function NotificationListener({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [notification, setNotification] = useState<NotificationItem | null>(null);

  // Keep the current route available to the realtime callback without
  // tearing down and recreating three Supabase channels on every navigation.
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const triggerHaptic = (pattern: number[] = [30, 40, 50]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  useEffect(() => {
    const supabase = createClient();

    const messageChannel = supabase
      .channel(`global_notifications_messages_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            match_id: string;
            sender_id: string;
            content: string;
          };

          if (newMsg.sender_id === currentUserId) return;
          if (pathnameRef.current?.includes(`/messages/${newMsg.match_id}`)) return;

          triggerHaptic([25, 50, 25]);
          setNotification({
            id: newMsg.id,
            type: "message",
            title: "New message",
            body: newMsg.content || "You received a new message.",
            link: `${routes.messages}/${newMsg.match_id}`,
          });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[DateBu] Message realtime subscription failed.");
        }
      });

    const matchUserAChannel = supabase
      .channel(`global_notifications_matches_a_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user_a=eq.${currentUserId}`,
        },
        (payload) => {
          const match = payload.new as { id: string };
          triggerHaptic([40, 60, 80]);
          setNotification({
            id: match.id,
            type: "match",
            title: "It’s a Match!",
            body: "You and another student liked each other.",
            link: `${routes.messages}/${match.id}`,
          });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[DateBu] Match realtime subscription (user_a) failed.");
        }
      });

    const matchUserBChannel = supabase
      .channel(`global_notifications_matches_b_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user_b=eq.${currentUserId}`,
        },
        (payload) => {
          const match = payload.new as { id: string };
          triggerHaptic([40, 60, 80]);
          setNotification({
            id: match.id,
            type: "match",
            title: "It’s a Match!",
            body: "You and another student liked each other.",
            link: `${routes.messages}/${match.id}`,
          });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[DateBu] Match realtime subscription (user_b) failed.");
        }
      });

    return () => {
      void supabase.removeChannel(messageChannel);
      void supabase.removeChannel(matchUserAChannel);
      void supabase.removeChannel(matchUserBChannel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  return (
    <>
      {notification && (
        <div
          role="status"
          className="notification-toast fixed top-4 inset-x-3 z-[9999] mx-auto max-w-sm cursor-pointer"
          onClick={() => {
            router.push(notification.link);
            setNotification(null);
          }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 text-foreground shadow-2xl backdrop-blur-md">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-500/50 bg-emerald-50 text-emerald-700">
              {notification.type === "match" ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black truncate">{notification.title}</span>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[8px] font-bold text-emerald-700">
                  {notification.type === "match" ? "Match" : "Chat"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                {notification.body}
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setNotification(null);
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
