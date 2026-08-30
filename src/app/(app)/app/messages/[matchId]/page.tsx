import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { isUuid } from "@/lib/validation";
import ChatClient from "./chat-client";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Chat | DateBu",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    matchId: string;
  }>;
};

export default async function ChatPage({ params }: Props) {
  const { matchId } = await params;

  if (!isUuid(matchId)) {
    notFound();
  }

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

  // Load the other user's profile with full badges & prompt info
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      department,
      academic_year,
      relationship_goal,
      campus_residency,
      campus_hangout,
      zodiac,
      prompt_question,
      prompt_answer,
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
    .order("created_at", { ascending: false })
    .limit(100);

  if (messagesError) {
    console.error("Failed to load messages:", messagesError);
  }

  const photos = [...(profile.profile_photos ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const photoPath = photos[0]?.storage_path;
  const photoUrl = getProfilePhotoUrl(photoPath, 160);

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] max-w-2xl flex-col px-2 sm:px-4 font-sans overflow-hidden pb-20 md:pb-4">
      {/* Sleek Top Navigation Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-border/80 bg-background/80 backdrop-blur-md py-2.5 px-1 z-20">
        <div className="flex items-center gap-3">
          <Link
            href={routes.messages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-2xs active:scale-95 transition-all"
            aria-label="Back to messages"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-emerald-500/40 bg-zinc-900 shadow-xs">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={profile.display_name ?? "Partner"}
                fill
                priority
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 text-sm">
                {profile.display_name?.charAt(0) ?? "?"}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-foreground text-sm tracking-tight">
                {profile.display_name || "DateBu Student"}
              </h1>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[200px] sm:max-w-none">
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
        otherProfile={profile}
        otherPhotoUrl={photoUrl}
        initialMessages={[...(messages ?? [])].reverse()}
      />
    </div>
  );
}