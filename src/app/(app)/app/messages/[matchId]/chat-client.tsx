"use client";

import { useState } from "react";
import { sendMessage } from "../actions";
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
  initialMessages: Message[];
};

export default function ChatClient({
  matchId,
  currentUserId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      setMessages((current) => [...current, result.message]);
    }

    setContent("");
    setLoading(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="font-medium text-foreground">
                Start the conversation
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Say hello.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? "bg-uni-primary text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <div className="border-t border-border px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-border p-3"
      >
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={2000}
          placeholder="Write a message..."
          disabled={loading}
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-uni-primary"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || !content.trim()}
        >
          {loading ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
