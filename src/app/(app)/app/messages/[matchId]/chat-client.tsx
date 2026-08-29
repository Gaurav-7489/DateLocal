"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Props = {
  matchId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  initialMessages: Message[];
};

function formatMessageTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatClient({
  matchId,
  currentUserId,
  otherUserId,
  otherUserName,
  initialMessages,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Safety menu & report state
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate behavior");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Setup Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | undefined;

    async function setupRealtime() {
      // Connect to Realtime channel with authentication
      await supabase.realtime.setAuth();

      channel = supabase
        .channel(`messages:${matchId}`)
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
              if (prev.some((m) => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          },
        )
        .subscribe();
    }

    void setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = content.trim();
    if (!text || loading) return;

    setLoading(true);
    setError("");

    const result = await sendMessage(matchId, text);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === result.message!.id)) {
          return prev;
        }
        return [...prev, result.message!];
      });
    }

    setContent("");
    setLoading(false);
  }

  async function handleBlock() {
    setMenuOpen(false);
    if (!confirm(`Are you sure you want to block ${otherUserName}? This conversation will be removed.`)) {
      return;
    }

    const result = await blockUser(otherUserId);
    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(routes.messages);
    router.refresh();
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
    router.push(routes.messages);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Top action button inside chat */}
      <div className="absolute top-3 right-3 z-10">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card/80 border border-border text-muted-foreground hover:text-foreground shadow-xs backdrop-blur-xs transition"
          aria-label="Conversation safety options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {/* Safety Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-xl space-y-0.5">
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
              <UserX className="w-3.5 h-3.5" /> Block &amp; Unmatch
            </button>
          </div>
        )}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4 sm:p-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xl">
              👋
            </div>
            <p className="font-bold text-foreground text-sm">
              Start the conversation with {otherUserName}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Say hello, ask about their department, or break the ice with campus chai plans!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isMine
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : "bg-card border border-border text-foreground rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                  {formatMessageTime(message.created_at)}
                </span>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error Notice */}
      {error && (
        <div className="flex items-center gap-2 border-t border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Message input */}
      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-border bg-card p-3 sm:p-4"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          placeholder={`Message ${otherUserName}...`}
          disabled={loading}
          className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Send message"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                Report {otherUserName}
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Reason for report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-emerald-500"
                >
                  <option value="Inappropriate messages or harassment">Inappropriate messages or harassment</option>
                  <option value="Fake or impersonated profile">Fake or impersonated profile</option>
                  <option value="Spam, scams or solicitations">Spam, scams or solicitations</option>
                  <option value="Hate speech or abuse">Hate speech or abuse</option>
                  <option value="Other safety concern">Other safety concern</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe what occurred..."
                  className="w-full resize-none rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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