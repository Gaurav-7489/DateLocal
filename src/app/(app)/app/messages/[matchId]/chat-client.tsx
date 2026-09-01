"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "../actions";
import { blockUser, reportUser } from "../../discover/actions";
import { routes } from "@/config/routes";
import {
  Send,
  MoreVertical,
  Flag,
  UserX,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  MapPin,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ProfileData = {
  id: string;
  display_name: string | null;
  department: string | null;
  academic_year: string | null;
  relationship_goal?: string | null;
  campus_residency?: string | null;
  campus_hangout?: string | null;
  zodiac?: string | null;
  prompt_question?: string | null;
  prompt_answer?: string | null;
};

type Props = {
  matchId: string;
  currentUserId: string;
  otherUserId: string;
  otherProfile: ProfileData;
  otherPhotoUrl: string | null;
  initialMessages: Message[];
};

function formatMessageTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function triggerHaptic(pattern: number[] = [15]) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
}

export default function ChatClient({
  matchId,
  currentUserId,
  otherUserId,
  otherProfile,
  otherPhotoUrl,
  initialMessages,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => {
    const seen = new Set<string>();
    return initialMessages.filter((message) => {
      if (seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
  });
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate behavior");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const icebreakers = [
    "☕ Canteen chai after lecture?",
    "How is the semester treating you so far?",
    otherProfile.campus_hangout ? `Down to catch up at ${otherProfile.campus_hangout}?` : "What is your favorite spot on campus?",
    "Studying for midterms or chilling today?",
  ];

  // Subscribe once per conversation. The send action and realtime event can race,
  // so the message state below always deduplicates by the database message id.
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat_${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e?: React.FormEvent<HTMLFormElement>, textToSend?: string) {
    if (e) e.preventDefault();
    const text = (textToSend ?? content).trim();
    if (!text || loading) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    triggerHaptic([20]);
    setContent("");
    setLoading(true);
    setError("");

    try {
      const result = await sendMessage(matchId, text);

      if (result.error) {
        setError(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }

      if (result.message) {
        setMessages((prev) => {
          // Realtime may have already inserted the persisted message while the
          // server action was still resolving. Remove both the optimistic copy
          // and any realtime copy, then keep exactly one canonical message.
          const withoutCopies = prev.filter(
            (m) => m.id !== tempId && m.id !== result.message!.id
          );
          return [...withoutCopies, result.message!];
        });
      }
    } catch {
      setError("Failed to deliver message. Please retry.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  }

  function handleQuickIcebreaker(chip: string) {
    setContent(chip);
    inputRef.current?.focus();
  }

  async function handleBlock() {
    setMenuOpen(false);
    if (!confirm(`Are you sure you want to block ${otherProfile.display_name}?`)) return;

    const result = await blockUser(otherUserId);
    if (result.error) {
      setError(result.error);
      return;
    }

    startTransition(() => {
      router.push(routes.messages);
      router.refresh();
    });
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReportSubmitting(true);

    const result = await reportUser(otherUserId, reportReason, reportDetails);
    setReportSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setReportModalOpen(false);
    startTransition(() => {
      router.push(routes.messages);
      router.refresh();
    });
  }

  return (
    <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-background font-sans">
      {/* Top Menu Dropdown */}
      <div className="absolute top-2 right-2 z-30">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground shadow-2xs active:scale-95"
          aria-label="Safety menu"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-xl space-y-0.5 z-40">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setReportModalOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
            >
              <Flag className="w-3.5 h-3.5" /> Report User
            </button>
            <button
              type="button"
              onClick={handleBlock}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            >
              <UserX className="w-3.5 h-3.5" /> Block User
            </button>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 space-y-3.5 overflow-y-auto px-3 py-3 no-scrollbar">
        {/* Match Info Intro */}
        <div className="mx-auto max-w-sm rounded-3xl border border-border/80 bg-card p-4 text-center shadow-2xs space-y-2.5">
          <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-full border-2 border-emerald-500/50 bg-zinc-950">
            {otherPhotoUrl ? (
              <Image
                src={otherPhotoUrl}
                alt={otherProfile.display_name ?? "Match"}
                fill
                priority
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 text-base">
                {otherProfile.display_name?.charAt(0) ?? "?"}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-black text-foreground">
              Matched with {otherProfile.display_name?.split(" ")[0]}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {otherProfile.department}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
            {otherProfile.relationship_goal && (
              <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[9px] font-bold text-rose-700">
                {otherProfile.relationship_goal}
              </span>
            )}
            {otherProfile.campus_residency && (
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                <MapPin className="w-2.5 h-2.5" /> {otherProfile.campus_residency}
              </span>
            )}
            {otherProfile.campus_hangout && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-900">
                <Coffee className="w-2.5 h-2.5" /> {otherProfile.campus_hangout}
              </span>
            )}
          </div>

          {otherProfile.prompt_question && otherProfile.prompt_answer && (
            <div className="rounded-2xl bg-muted/40 p-2.5 text-left border border-border/60">
              <span className="text-[9px] font-bold text-emerald-700 block">
                {otherProfile.prompt_question}
              </span>
              <p className="text-xs text-foreground mt-0.5 leading-snug">
                &ldquo;{otherProfile.prompt_answer}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Message Bubbles */}
        {messages.map((message, idx) => {
          const isMine = message.sender_id === currentUserId;
          const prevMsg = messages[idx - 1];
          const isSameSender = prevMsg && prevMsg.sender_id === message.sender_id;

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                  isMine
                    ? "bg-emerald-600 text-white rounded-2xl rounded-br-xs"
                    : "bg-card border border-border/80 text-foreground rounded-2xl rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>

              {!isSameSender && (
                <span className="mt-0.5 px-1.5 text-[9px] font-medium text-muted-foreground">
                  {formatMessageTime(message.created_at)}
                </span>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="flex items-center gap-2 border-t border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Icebreaker Chips */}
      {messages.length < 3 && (
        <div className="shrink-0 flex gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-border/40 bg-muted/20 no-scrollbar">
          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Icebreakers:
          </span>
          {icebreakers.map((chip) => (
            <button
              type="button"
              key={chip}
              onClick={() => handleQuickIcebreaker(chip)}
              className="shrink-0 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-foreground hover:border-emerald-500 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="shrink-0 flex items-center gap-2 border-t border-border/80 bg-card p-2.5"
      >
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          placeholder={`Message ${otherProfile.display_name?.split(" ")[0]}...`}
          disabled={loading}
          className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white transition active:scale-95 disabled:opacity-40"
          aria-label="Send"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-rose-600" />
                Report {otherProfile.display_name}
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-2.5">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background p-2 text-xs outline-none"
              >
                <option value="Inappropriate behavior">Inappropriate messages or harassment</option>
                <option value="Fake profile">Fake or impersonated profile</option>
                <option value="Spam">Spam or solicitations</option>
                <option value="Other">Other safety concern</option>
              </select>

              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Details..."
                className="w-full resize-none rounded-xl border border-border bg-background p-2 text-xs outline-none"
              />

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setReportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={reportSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {reportSubmitting ? "Submitting..." : "Report & Block"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
