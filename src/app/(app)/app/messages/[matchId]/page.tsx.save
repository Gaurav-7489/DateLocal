import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import ChatClient from "./chat-client";

export const metadata: Metadata = {
  title: "Chat",
};

type Props = {
  params: Promise<{
    matchId: string;
  }>;
};

export default async function ChatPage({ params }: Props) {
  const { matchId } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Make sure this match belongs to the current user.
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", matchId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (matchError || !match) {
    notFound();
  }

  const otherUserId =
    match.user_a === user.id ? match.user_b : match.user_a;

  // Load the other user's profile.
  const { data: profile, error: profileError } = await supabase
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
    .eq("id", otherUserId)
    .maybeSingle();

  if (profileError || !profile) {
    notFound();
  }

  // Load existing messages.
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Failed to load messages:", messagesError);
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

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-3xl flex-col px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={routes.matches}
          className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          Back
        </Link>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="font-semibold text-foreground">
              {profile.display_name || "DateBu student"}
            </h1>

            <p className="text-xs text-muted-foreground">
              {profile.department || "Student"}
              {profile.academic_year
                ? ` • ${profile.academic_year}`
                : ""}
            </p>
          </div>
        </div>
      </div>

      <ChatClient
        matchId={matchId}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  );
}
