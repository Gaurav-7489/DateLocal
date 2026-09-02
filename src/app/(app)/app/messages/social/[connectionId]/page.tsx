import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import SocialChatClient from "./social-chat-client";

export const metadata: Metadata = { title: "Social chat | DateLocal" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ connectionId: string }> };
type Profile = { id: string; display_name: string | null; verification_status: string | null; area_verification_status: string | null };
type Message = { id: string; sender_id: string; ciphertext: string; created_at: string };

export default async function SocialChatPage({ params }: Props) {
  const { connectionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: connection } = await admin.from("extrovert_connections").select("id,requester_id,target_id,status").eq("id", connectionId).eq("status", "accepted").or(`requester_id.eq.${user.id},target_id.eq.${user.id}`).maybeSingle();
  if (!connection) notFound();
  const otherUserId = connection.requester_id === user.id ? connection.target_id : connection.requester_id;

  const { data: membership } = await admin.from("extrovert_conversation_members").select("conversation_id").eq("user_id", user.id);
  const candidateIds = (membership ?? []).map((row) => row.conversation_id);
  let conversationId: string | null = null;
  if (candidateIds.length) {
    const { data: otherMembership } = await admin.from("extrovert_conversation_members").select("conversation_id").in("conversation_id", candidateIds).eq("user_id", otherUserId);
    conversationId = otherMembership?.[0]?.conversation_id ?? null;
  }

  if (!conversationId) {
    const { data: conversation, error: conversationError } = await admin.from("extrovert_conversations").insert({}).select("id").single();
    if (conversationError || !conversation) notFound();
    conversationId = conversation.id;
    const { error: memberError } = await admin.from("extrovert_conversation_members").insert([{ conversation_id: conversationId, user_id: user.id }, { conversation_id: conversationId, user_id: otherUserId }]);
    if (memberError) notFound();
  }

  if (!conversationId) notFound();
  const resolvedConversationId = conversationId;

  const [{ data: profile }, { data: messages }] = await Promise.all([
    admin.from("extrovert_profiles").select("id,display_name,verification_status,area_verification_status").eq("id", otherUserId).maybeSingle(),
    admin.from("extrovert_messages").select("id,sender_id,ciphertext,created_at").eq("conversation_id", resolvedConversationId).order("created_at", { ascending: true }).limit(100),
  ]);
  if (!profile) notFound();

  return <SocialChatClient conversationId={resolvedConversationId} currentUserId={user.id} otherProfile={profile as Profile} initialMessages={(messages ?? []) as Message[]} />;
}
