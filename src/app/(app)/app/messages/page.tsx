import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { MessageSquare, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Messages",
};

export const dynamic = "force-dynamic";

function formatTimestamp(isoString?: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
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

  // Load blocked user IDs
  const { data: blocksCreated } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id);

  const { data: blocksReceived } = await supabase
    .from("blocks")
    .select("blocker_id")
    .eq("blocked_id", user.id);

  const blockedUserIds = new Set<string>([
    ...(blocksCreated ?? []).map((b) => b.blocked_id),
    ...(blocksReceived ?? []).map((b) => b.blocker_id),
  ]);

  // Load the current user's matches
  const { data: rawMatches, error: matchesError } = await supabase
    .from("matches")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (matchesError) {
    console.error("Failed to load matches:", matchesError);
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load your conversations right now.
        </p>
      </div>
    );
  }

  // Exclude blocked users
  const matches = (rawMatches ?? []).filter((m) => {
    const otherId = m.user_a === user.id ? m.user_b : m.user_a;
    return !blockedUserIds.has(otherId);
  });

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          icon="💬"
          title="No conversations yet"
          description="Messages from your matches will appear here. Match with other students to start chatting."
        >
          <Link href={routes.discover}>
            <Button variant="primary" size="md">
              Find Students
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const otherUserIds = matches.map((match) =>
    match.user_a === user.id ? match.user_b : match.user_a,
  );

  // Load the profiles of the matched students
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      department,
      academic_year,
      profile_photos (
        storage_path,
        display_order,
        is_primary
      )
    `)
    .in("id", otherUserIds);

  if (profilesError) {
    console.error("Failed to load matched profiles:", profilesError);
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  // Load latest messages for these matches
  const { data: messages } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, content, created_at")
    .in("match_id", matches.map((m) => m.id))
    .order("created_at", { ascending: false });

  const latestMessageMap = new Map<
    string,
    {
      content: string;
      sender_id: string;
      created_at: string;
    }
  >();

  for (const message of messages ?? []) {
    if (!latestMessageMap.has(message.match_id)) {
      latestMessageMap.set(message.match_id, message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Messages
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Direct conversations with your verified matches
          </p>
        </div>

        <Link href={routes.matches}>
          <Button variant="outline" size="sm">
            View All Matches
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {matches.map((match) => {
          const otherUserId =
            match.user_a === user.id ? match.user_b : match.user_a;
          const profile = profileMap.get(otherUserId);

          if (!profile) return null;

          const photos = [...(profile.profile_photos ?? [])].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return a.display_order - b.display_order;
          });

          const photoPath = photos[0]?.storage_path;
          const photoUrl = photoPath
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${photoPath}`
            : null;

          const latestMessage = latestMessageMap.get(match.id);

          return (
            <Link
              key={match.id}
              href={`${routes.messages}/${match.id}`}
              className="block"
            >
              <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 transition-all hover:bg-muted/60 hover:shadow-sm">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-muted border border-border">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={profile.display_name ?? "Student"}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <User className="h-6 w-6 stroke-1" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-bold text-foreground text-sm">
                        {profile.display_name || "DateBu Student"}
                      </h2>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200 font-medium hidden sm:inline-block">
                        {profile.department}
                      </span>
                    </div>

                    {latestMessage && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimestamp(latestMessage.created_at)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {latestMessage ? (
                      latestMessage.sender_id === user.id ? (
                        <span className="text-foreground">
                          You: {latestMessage.content}
                        </span>
                      ) : (
                        latestMessage.content
                      )
                    ) : (
                      <span className="text-emerald-600 font-medium">
                        ✨ Start the conversation...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
