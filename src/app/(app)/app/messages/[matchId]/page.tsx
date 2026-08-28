import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import ChatClient from "./chat-client";
import { ArrowLeft, User, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Chat",
};

export const dynamic = "force-dynamic";

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
    redirect(routes.login);
  }

  // Ensure this match belongs to the current user
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

  // Check if either user has blocked the other
  const { data: blockRecord } = await supabase
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`)
    .maybeSingle();

  if (blockRecord) {
    redirect(routes.messages);
  }

  // Load the other user's profile
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

  // Load message history
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
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-3xl flex-col px-4 py-3">
      {/* Chat header */}
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <Link
            href={routes.messages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={profile.display_name ?? "Partner"}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <User className="h-5 w-5 stroke-1" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-foreground text-sm">
                {profile.display_name || "DateBu Student"}
              </h1>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {profile.department || "Student"}
              {profile.academic_year ? ` • ${profile.academic_year}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Chat Client */}
      <ChatClient
        matchId={matchId}
        currentUserId={user.id}
        otherUserId={otherUserId}
        otherUserName={profile.display_name || "Student"}
        initialMessages={messages ?? []}
      />
    </div>
  );
}
