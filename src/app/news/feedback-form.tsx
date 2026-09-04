"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

const MAX = 2000;
const COOLDOWN_MS = 10 * 60 * 1000;
const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim() || "";

export function FeedbackForm() {
  const [isPending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Suggestion");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const remaining = MAX - message.length;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    setStatus(null);
    if (!ENDPOINT) return setStatus({ type: "error", text: "Feedback is temporarily unavailable. Please try again later." });
    if (trimmed.length < 3) return setStatus({ type: "error", text: "Please add a little more detail." });
    if (trimmed.length > MAX) return setStatus({ type: "error", text: `Keep feedback under ${MAX} characters.` });
    const lastSent = Number(localStorage.getItem("datelocal_feedback_last_sent") || 0);
    if (Date.now() - lastSent < COOLDOWN_MS) return setStatus({ type: "error", text: "Thanks — we already received feedback from this device recently. Please try again later." });

    setPending(true);
    try {
      const form = event.currentTarget;
      const data = new FormData(form);
      data.set("message", trimmed);
      data.set("_subject", `DateLocal feedback · ${category}`);
      const response = await fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Feedback service returned an error.");
      localStorage.setItem("datelocal_feedback_last_sent", String(Date.now()));
      setMessage("");
      form.reset();
      setCategory("Suggestion");
      setStatus({ type: "success", text: "Feedback sent. Thanks — we’ll keep it in the queue and review it." });
    } catch {
      setStatus({ type: "error", text: "Couldn’t send feedback right now. Please try again later." });
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={handleSubmit} className="space-y-2.5 pt-1"><input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true"/><div className="grid grid-cols-2 gap-2"><label className="sr-only" htmlFor="feedback-category">Feedback type</label><select id="feedback-category" name="category" value={category} onChange={e=>setCategory(e.target.value)} disabled={isPending} className="col-span-2 rounded-2xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-800 outline-none focus:border-emerald-500"><option>Suggestion</option><option>Bug report</option><option>Something confusing</option><option>Safety concern</option><option>Other</option></select></div><textarea name="message" required minLength={3} maxLength={MAX} rows={4} value={message} onChange={e=>setMessage(e.target.value.slice(0,MAX))} disabled={isPending} placeholder="Tell us what you want to see next..." className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-500 transition-colors disabled:opacity-60"/><div className="flex items-center justify-between gap-2"><span className={`text-[9px] font-semibold ${remaining<200?"text-amber-600":"text-zinc-400"}`}>{remaining} characters remaining</span><button type="submit" disabled={isPending||!message.trim()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-[transform,background-color,opacity] hover:bg-emerald-700 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-3.5 w-3.5"/>{isPending?"Sending…":"Send feedback"}</button></div>{status&&<p className={`flex items-center gap-1.5 text-[10px] font-semibold ${status.type==="success"?"text-emerald-600":"text-rose-600"}`}>{status.type==="success"?<CheckCircle2 className="h-3.5 w-3.5"/>:<AlertCircle className="h-3.5 w-3.5"/>}{status.text}</p>}<p className="text-[9px] leading-4 text-zinc-400">One short submission per device every 10 minutes helps keep the feedback queue manageable.</p></form>;
}
