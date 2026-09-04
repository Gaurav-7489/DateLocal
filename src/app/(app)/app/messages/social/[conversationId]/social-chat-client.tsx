"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureOwnMessageKey, decryptMessage, encryptMessage } from "@/lib/chat/crypto";
import { sendSocialMessage } from "@/app/(app)/app/social/actions";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  ciphertext: string;
  created_at: string;
  content?: string;
};

const MAX_MESSAGE_LENGTH = 2000;

export default function SocialChatClient({
  initialMessages,
  currentUserId,
  otherUserId,
  otherUserName,
}: {
  initialMessages: Message[];
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}) {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await ensureOwnMessageKey(supabase, currentUserId);
        const hydrated = await Promise.all(initialMessages.map(async message => {
          try { return { ...message, content: await decryptMessage(supabase, currentUserId, otherUserId, conversationId, message.ciphertext) }; }
          catch { return { ...message, content: "Unable to decrypt this message on this device." }; }
        }));
        if (alive) setMessages(hydrated);
        if (alive) setReady(true);
      } catch {
        if (alive) setError("Secure chat could not be initialized on this device.");
      }
    })();
    const channel = supabase.channel(`social_chat_${conversationId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "extrovert_messages", filter: `conversation_id=eq.${conversationId}` }, async payload => {
      const incoming = payload.new as Message;
      if (incoming.sender_id === currentUserId) return;
      const hydrated: Message = { ...incoming, content: "Unable to decrypt this message." };
      try { hydrated.content = await decryptMessage(supabase, currentUserId, otherUserId, conversationId, incoming.ciphertext); } catch {}
      setMessages(prev => prev.some(m => m.id === incoming.id) ? prev : [...prev, hydrated]);
    }).subscribe();
    return () => { alive = false; void supabase.removeChannel(channel); };
  }, [ready, conversationId, currentUserId, otherUserId, supabase, initialMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault(); const text = content.trim(); if (!text || sending || !ready) return;
    if (text.length > MAX_MESSAGE_LENGTH) { setError(`Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`); return; }
    setSending(true); setError(null);
    try {
      const ciphertext = await encryptMessage(supabase, currentUserId, otherUserId, conversationId, text);
      const result = await sendSocialMessage(conversationId, ciphertext);
      if (result.error) throw new Error(result.error);
      setContent("");
      if (result.message) setMessages(prev => [...prev, { ...result.message, content: text }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Message could not be sent.");
    } finally { setSending(false); }
  }

  return <div className="flex min-h-[100dvh] flex-col bg-white">
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-100 bg-white/95 px-4 backdrop-blur">
      <Link href="/app/messages" aria-label="Back" className="pressable rounded-xl p-2"><ArrowLeft className="h-5 w-5" /></Link>
      <div className="min-w-0"><p className="truncate text-sm font-black text-zinc-900">{otherUserName}</p><p className="text-[10px] font-semibold text-zinc-400">Secure social chat</p></div>
    </header>
    <main className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
      {messages.length === 0 && <div className="mx-auto mt-16 max-w-xs text-center"><p className="text-sm font-black text-zinc-900">You’re connected</p><p className="mt-1 text-xs leading-5 text-zinc-500">Start the conversation. Messages are encrypted on your devices.</p></div>}
      {messages.map(message => {
        const own = message.sender_id === currentUserId;
        return <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${own ? "rounded-br-md bg-zinc-950 text-white" : "rounded-bl-md bg-zinc-100 text-zinc-900"}`}>{message.content ?? "Unable to decrypt this message."}</div></div>;
      })}
      <div ref={bottomRef} />
    </main>
    {error && <p role="alert" className="px-4 pb-2 text-xs font-semibold text-red-600">{error}</p>}
    <form onSubmit={handleSend} className="sticky bottom-0 flex gap-2 border-t border-zinc-100 bg-white p-3">
      <input value={content} onChange={event => setContent(event.target.value)} maxLength={MAX_MESSAGE_LENGTH} disabled={!ready || sending} placeholder={ready ? "Write a message…" : "Preparing secure chat…"} className="min-w-0 flex-1 rounded-2xl bg-zinc-100 px-4 py-3 text-sm outline-none ring-0 placeholder:text-zinc-400" />
      <button type="submit" disabled={!ready || sending || !content.trim()} aria-label="Send message" className="pressable flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white disabled:opacity-40">{sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</button>
    </form>
  </div>;
}
