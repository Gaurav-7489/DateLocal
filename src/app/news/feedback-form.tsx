"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitFeedback } from "./actions";

export function FeedbackForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus(null);

    startTransition(async () => {
      const result = await submitFeedback(data);
      if (result.error) {
        setStatus({ type: "error", text: result.error });
        return;
      }
      setMessage("");
      form.reset();
      setStatus({ type: "success", text: "Feedback sent. Thanks for helping improve DateBu." });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
      <textarea
        name="message"
        required
        minLength={1}
        maxLength={2000}
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={isPending}
        placeholder="Tell us what you want to see next..."
        className="w-full resize-none rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] text-muted-foreground">{message.length}/2000</span>
        <button
          type="submit"
          disabled={isPending || !message.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-[transform,background-color,opacity] hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {isPending ? "Sending…" : "Submit Feedback"}
        </button>
      </div>
      {status && (
        <p className={`flex items-center gap-1.5 text-[10px] font-semibold ${status.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
          {status.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {status.text}
        </p>
      )}
    </form>
  );
}
