import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, MessageCircle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Social Chat | Extrovert" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ conversationId: string }> };

type Message = { id: string; sender_id: string; ciphertext: string; created_at: string };

export default async function SocialChatPage({ params }: Props) {
  const { conversationId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const { data: conversation } = await supabase
    .from("extrovert_conversations")
    .select("id,connection_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation) notFound();

  const { data: membership } = await supabase
    .from("extrovert_conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) notFound();

  const { data: messages } = await supabase
    .from("extrovert_messages")
    .select("id,sender_id,ciphertext,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl flex-col px-3 pb-24 font-sans">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white/95 py-3 backdrop-blur-md">
        <Link href={routes.messages} className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="flex items-center gap-1.5 text-sm font-black"><MessageCircle className="h-4 w-4 text-emerald-600" />Social chat</h1>
          <p className="flex items-center gap-1 text-[10px] text-zinc-500"><LockKeyhole className="h-3 w-3" />Shared Extrovert chat space</p>
        </div>
      </header>
      <section className="flex-1 space-y-2 py-4">
        {(messages as Message[] | null ?? []).map(message => (
          <div key={message.id} className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs ${message.sender_id === user.id ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-900"}`}>
              {message.ciphertext}
            </div>
          </div>
        ))}
        {(!messages || messages.length === 0) && <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-xs text-zinc-500">No messages yet. Start the conversation.</div>}
      </section>
    </main>
  );
}
