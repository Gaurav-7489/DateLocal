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
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-300 bg-white">
     <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
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
      ? "bg-green-600 text-white"
      : "bg-gray-200 text-gray-900"
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
       className="flex shrink-0 gap-2 border-t border-gray-300 bg-white p-3"
      >
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={2000}
          placeholder="Write a message..."
          disabled={loading}
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-green-600"
        />

        <button
  type="submit"
  disabled={loading || !content.trim()}
  className="shrink-0 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? "..." : "Send"}
</button>
      </form>
    </div>
  );
}
