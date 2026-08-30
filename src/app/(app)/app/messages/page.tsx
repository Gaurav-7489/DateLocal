import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import type { Tables } from "@/types/database";
import {
  MessageSquare,
  Compass,
  Flame,
  HeartHandshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Messages | DateBu",
};

export const dynamic = "force-dynamic";

type ProfileRow = Tables<"profiles">;
type MatchRow = Tables<"matches">;
type MessageRow = Tables<"messages">;
type PhotoRow = Tables<"profile_photos">;

function formatTimestamp(isoString?: string | null) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default async function MessagesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Single round-trip parallel fetch
  const [matchesRes, messagesRes, photosRes] = await Promise.all([
    supabase
      .from("matches")
      .select("id, user_a, user_b, created_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase
      .from("messages")
      .select("id, match_id, sender_id, content, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("profile_photos")
      .select("id, profile_id, storage_path, display_order, is_primary, created_at")
      .order("display_order", { ascending: true }),
  ]);

  const matches: MatchRow[] = matchesRes.data ?? [];
  const messages: MessageRow[] = messagesRes.data ?? [];
  const photos: PhotoRow[] = photosRes.data ?? [];

  const matchedUserIds = Array.from(
    new Set(
      matches.map((m) => (m.user_a === user.id ? m.user_b : m.user_a))
    )
  );

  let profiles: ProfileRow[] = [];
  if (matchedUserIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, display_name, department, academic_year, date_of_birth, gender, bio, role, profile_completed, ghost_mode, created_at, updated_at"
      )
      .in("id", matchedUserIds);
    profiles = data ?? [];
  }

  const profileMap = new Map<string, ProfileRow>(
    profiles.map((p) => [p.id, p])
  );

  const photoMap = new Map<string, PhotoRow[]>();
  for (const photo of photos) {
    const current = photoMap.get(photo.profile_id) ?? [];
    current.push(photo);
    photoMap.set(photo.profile_id, current);
  }

  const latestMessageMap = new Map<string, MessageRow>();
  for (const message of messages) {
    if (!latestMessageMap.has(message.match_id)) {
      latestMessageMap.set(message.match_id, message);
    }
  }

  const newMatches: {
    matchId: string;
    profile: ProfileRow;
    photoUrl: string | null;
  }[] = [];

  const activeConversations: {
    match: MatchRow;
    profile: ProfileRow;
    photoUrl: string | null;
    latestMessage: MessageRow;
  }[] = [];

  for (const match of matches) {
    const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;
    const profile = profileMap.get(otherUserId);
    if (!profile) continue;

    const userPhotos = photoMap.get(otherUserId) ?? [];
    const photoUrl = getProfilePhotoUrl(userPhotos[0]?.storage_path, 160);
    const latestMessage = latestMessageMap.get(match.id);

    if (!latestMessage) {
      newMatches.push({ matchId: match.id, profile, photoUrl });
    } else {
      activeConversations.push({
        match,
        profile,
        photoUrl,
        latestMessage,
      });
    }
  }

  activeConversations.sort((a, b) => {
    const timeA = new Date(a.latestMessage.created_at).getTime();
    const timeB = new Date(b.latestMessage.created_at).getTime();
    return timeB - timeA;
  });

  const hasNoActivity = newMatches.length === 0 && activeConversations.length === 0;

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-black tracking-tight text-zinc-950">
              Conversations
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Chat with your mutual campus connections
          </p>
        </div>
        <Link href={routes.discover}>
          <Button size="sm" variant="outline" leftIcon={<Compass className="h-3.5 w-3.5" />}>
            Explore
          </Button>
        </Link>
      </div>

      {hasNoActivity ? (
<EmptyState
  icon={<HeartHandshake className="h-6 w-6 text-emerald-600" />}
  title="No conversations yet"
  description="When you match with someone on campus, your chats and new connections will show up right here."
>
  <Link href={routes.discover}>
    <Button size="sm" leftIcon={<Compass className="h-3.5 w-3.5" />}>
      Start Exploring
    </Button>
  </Link>
</EmptyState>
      ) : (
        <div className="space-y-6">
          {newMatches.length > 0 && (
            <section className="space-y-2.5">
              <div className="flex items-center gap-1.5 px-1">
                <Flame className="h-4 w-4 text-emerald-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600">
                  New Matches ({newMatches.length})
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {newMatches.map((m) => (
                  <Link
                    key={m.matchId}
                    href={`/app/messages/${m.matchId}`}
                    className="group flex w-20 shrink-0 flex-col items-center gap-1.5"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-emerald-500/80 p-0.5 shadow-xs transition group-hover:scale-105">
                      {m.photoUrl ? (
                        <Image
                          src={m.photoUrl}
                          alt={m.profile.display_name}
                          fill
                          className="rounded-[14px] object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-100 text-base font-black text-zinc-700">
                          {m.profile.display_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="w-full truncate text-center text-xs font-bold text-zinc-800">
                      {m.profile.display_name.split(" ")[0]}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {activeConversations.length > 0 && (
            <section className="space-y-2">
              <div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-600">
                Messages
              </div>
              <div className="space-y-1.5">
                {activeConversations.map((c) => {
                  const isSentByMe = c.latestMessage.sender_id === user.id;
                  return (
                    <Link
                      key={c.match.id}
                      href={`/app/messages/${c.match.id}`}
                      className="group flex items-center justify-between rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-2xs transition hover:border-emerald-300 hover:bg-zinc-50/50"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200/80">
                          {c.photoUrl ? (
                            <Image
                              src={c.photoUrl}
                              alt={c.profile.display_name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-black text-zinc-700">
                              {c.profile.display_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3 className="truncate text-xs sm:text-sm font-bold text-zinc-950">
                            {c.profile.display_name}
                          </h3>
                          <p className="truncate text-xs text-zinc-500">
                            {isSentByMe && (
                              <span className="font-semibold text-zinc-700">You: </span>
                            )}
                            {c.latestMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 pl-2 text-[10px] font-semibold text-zinc-400">
                        {formatTimestamp(c.latestMessage.created_at)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}