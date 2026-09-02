"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; display_name: string | null; verification_status: string | null; area_verification_status: string | null };
type Message = { id: string; sender_id: string; ciphertext: string; created_at: string };

export default function SocialChatClient({ conversationId, currentUserId, otherProfile, initialMessages }: { conversationId: string; currentUserId: string; otherProfile: Profile; initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`extrovert-social-${conversationId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "extrovert_messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
      const next = payload.new as Message;
      setMessages((current) => current.some((message) => message.id === next.id) ? current : [...current, next]);
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;
    setSending(true); setError(""); setContent("");
    const supabase = createClient();
    const { data, error: sendError } = await supabase.from("extrovert_messages").insert({ conversation_id: conversationId, sender_id: currentUserId, ciphertext: text }).select("id,sender_id,ciphertext,created_at").single();
    if (sendError) { setError("Could not send message."); setContent(text); } else if (data) setMessages((current) => current.some((message) => message.id === data.id) ? current : [...current, data as Message]);
    setSending(false);
  }

  return <div className="mx-auto flex h-[100dvh] w-full max-w-lg flex-col bg-[var(--bg)]">
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--card)] px-3">
      <Link href="/app/messages?section=social" aria-label="Back to chats" className="grid size-9 place-items-center rounded-full border border-[var(--line)]"><ArrowLeft size={17} /></Link>
      <div className="grid size-9 place-items-center rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]">{otherProfile.display_name?.slice(0, 1).toUpperCase() || "?"}</div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{otherProfile.display_name || "Connection"}</p><p className="flex items-center gap-1 text-[10px] text-[var(--muted)]"><ShieldCheck size={11} /> Extrovert connection</p></div>
    </header>

    <div className="flex-1 overflow-y-auto px-3 py-4">
      <div className="mx-auto mb-5 max-w-xs rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3 text-center"><p className="text-xs font-semibold">Social chat</p><p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">This conversation came from an accepted Extrovert connection. Dating stays separate in DateBu.</p></div>
      <div className="space-y-2">{messages.map((message) => { const mine = message.sender_id === currentUserId; return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${mine ? "rounded-br-sm bg-[var(--fg)] text-white" : "rounded-bl-sm border border-[var(--line)] bg-[var(--card)]"}`}><p className="whitespace-pre-wrap break-words">{message.ciphertext}</p></div></div>; })}</div>
      {error && <p className="mt-3 text-center text-xs text-red-600">{error}</p>}
      <div ref={bottomRef} />
    </div>

    <form onSubmit={send} className="flex shrink-0 items-center gap-2 border-t border-[var(--line)] bg-[var(--card)] p-2.5 pb-[calc(.625rem+env(safe-area-inset-bottom))]"><input value={content} onChange={(e) => setContent(e.target.value)} maxLength={1000} disabled={sending} placeholder={`Message ${otherProfile.display_name?.split(" ")[0] || "them"}...`} className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /><button disabled={sending || !content.trim()} aria-label="Send message" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-white disabled:opacity-40">{sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button></form>
  </div>;
}
