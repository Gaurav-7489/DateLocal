import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Load the current user's matches.
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, user_a, user_b, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (matchesError) {
    console.error("Failed to load matches:", matchesError);

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load your conversations right now.
        </p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          icon="💬"
          title="No conversations yet"
          description="Messages from your matches will appear here. Match with someone to start chatting."
        >
          <Link href={routes.discover}>
            <Button variant="primary" size="md">
              Find people
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const otherUserIds = matches.map((match) =>
    match.user_a === user.id ? match.user_b : match.user_a,
  );

  // Load the profiles of the people we matched with.
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

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load your conversations.
        </p>
      </div>
    );
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  // Load messages belonging to these matches.
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, content, created_at")
    .in(
      "match_id",
      matches.map((match) => match.id),
    )
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("Failed to load conversation previews:", messagesError);
  }

  // Keep only the newest message for each match.
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Messages
        </h1>

        <p className="mt-2 text-muted-foreground">
          Your conversations with your matches.
        </p>
      </div>

      <div className="space-y-3">
        {matches.map((match) => {
          const otherUserId =
            match.user_a === user.id ? match.user_b : match.user_a;

          const profile = profileMap.get(otherUserId);

          if (!profile) {
            return null;
          }

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
              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4 transition-colors hover:bg-muted">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-foreground">
                    {profile.display_name || "DateBu student"}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {latestMessage
                      ? latestMessage.sender_id === user.id
                        ? `You: ${latestMessage.content}`
                        : latestMessage.content
                      : "Start a conversation"}
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
