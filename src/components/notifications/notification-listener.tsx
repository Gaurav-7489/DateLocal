"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/config/routes";
import { MessageCircle, Sparkles, X } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "message" | "match";
  title: string;
  body: string;
  avatarUrl?: string | null;
  link: string;
}

export function NotificationListener({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [notification, setNotification] = useState<NotificationItem | null>(null);

  const triggerHaptic = (pattern: number[] = [30, 40, 50]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  useEffect(() => {
    const supabase = createClient();

    const messageChannel = supabase
      .channel("global_notifications_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            match_id: string;
            sender_id: string;
            content: string;
          };

          if (newMsg.sender_id === currentUserId) return;
          if (pathname?.includes(`/messages/${newMsg.match_id}`)) return;

          const { data: sender } = await supabase
            .from("profiles")
            .select(`
              display_name,
              profile_photos (
                storage_path,
                is_primary,
                display_order
              )
            `)
            .eq("id", newMsg.sender_id)
            .maybeSingle();

          const senderName = sender?.display_name?.split(" ")[0] || "Someone";
          const photos = [...(sender?.profile_photos ?? [])].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.display_order - b.display_order;
          });

          const avatarUrl = photos[0]?.storage_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${photos[0].storage_path}`
            : null;

          triggerHaptic([25, 50, 25]);
          setNotification({
            id: newMsg.id,
            type: "message",
            title: senderName,
            body: newMsg.content,
            avatarUrl,
            link: `${routes.messages}/${newMsg.match_id}`,
          });
        }
      )
      .subscribe();

    const matchChannel = supabase
      .channel("global_notifications_matches")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `or(user_a.eq.${currentUserId},user_b.eq.${currentUserId})`,
        },
        async (payload) => {
          const match = payload.new as { id: string; user_a: string; user_b: string };
          const otherUserId = match.user_a === currentUserId ? match.user_b : match.user_a;

          const { data: sender } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", otherUserId)
            .maybeSingle();

          const matchName = sender?.display_name || "New Student";

          triggerHaptic([40, 60, 80]);
          setNotification({
            id: match.id,
            type: "match",
            title: "Mutual Match! 🎉",
            body: `You and ${matchName} liked each other!`,
            link: `${routes.messages}/${match.id}`,
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(messageChannel);
      void supabase.removeChannel(matchChannel);
    };
  }, [currentUserId, pathname]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          className="fixed top-4 inset-x-3 z-[9999] mx-auto max-w-sm cursor-pointer"
          onClick={() => {
            router.push(notification.link);
            setNotification(null);
          }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 text-foreground shadow-2xl backdrop-blur-md">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-emerald-500/50 bg-zinc-950">
              {notification.avatarUrl ? (
                <Image
                  src={notification.avatarUrl}
                  alt={notification.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-sm">
                  {notification.type === "match" ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </div>
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
              onClick={(e) => {
                e.stopPropagation();
                setNotification(null);
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
