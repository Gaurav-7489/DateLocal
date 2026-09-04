"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { routes } from "@/config/routes";

type Message = { id: number; role: "bot" | "user"; text: string };

const quickQuestions = [
  "How does verification work?",
  "I have a payment problem",
  "How do I report someone?",
  "How do I delete my account?",
];

function getReply(input: string) {
  const text = input.toLowerCase();
  if (/verif|identity|selfie|area/.test(text)) {
    return "Verification is optional. Identity verification confirms that you are a real person and can add a verified badge. Area verification confirms your selected Extrovert area. Your documents and selfies stay private. If verification fails, you can retry or continue using Extrovert without it.";
  }
  if (/pay|payment|paid|subscription|premium|beyond|refund|razorpay/.test(text)) {
    return "For payment or subscription problems, please use Contact & Feedback so the Extrovert team can check your account. Include what you were charged for and what went wrong. Never send your card number, UPI PIN, password, or OTP.";
  }
  if (/report|block|harass|abuse|unsafe|scam/.test(text)) {
    return "You can report or block a user from their profile or the relevant interaction. If someone is threatening or seriously unsafe, report them and stop engaging. For urgent account or safety help, use Contact & Feedback to reach the team.";
  }
  if (/delete|remove account|close account/.test(text)) {
    return "You can delete your account from Settings. Account deletion is permanent, so make sure you really want to remove your profile and data before confirming.";
  }
  if (/match|like|dating/.test(text)) {
    return "In Dating, you can like or pass on profiles. When two people like each other, it becomes a match and you can start a chat. You can also unmatch or block when needed.";
  }
  if (/social|connect|friend/.test(text)) {
    return "Social is for meeting people and building connections. Send a connection request, and once it is accepted you can chat with that person.";
  }
  if (/password|login|sign in|account/.test(text)) {
    return "For login or account problems, first try signing out and back in. If the problem continues, use Contact & Feedback and describe the exact error without sharing your password or verification codes.";
  }
  return "I can help with common Extrovert questions about verification, Dating, Social, payments, safety, login, and account settings. If your issue is more specific, use Contact & Feedback and the team can take a look.";
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "bot", text: "Hey. I'm Extrovert Support. Ask me a question and I'll help with the common stuff." },
  ]);
  const [input, setInput] = useState("");

  const nextId = useMemo(() => messages.length + 1, [messages.length]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((current) => [
      ...current,
      { id: nextId, role: "user", text: value },
      { id: nextId + 1, role: "bot", text: getReply(value) },
    ]);
    setInput("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col px-3.5 py-4 pb-24 font-sans">
      <div className="flex items-center justify-between">
        <Link href={routes.settings} className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Settings
        </Link>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
          <ShieldCheck className="h-3 w-3" /> Private support
        </div>
      </div>

      <section className="mt-5 rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">EXTROVERT SUPPORT</p>
            <h1 className="text-xl font-black tracking-tight">How can we help?</h1>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Quick answers for common questions. This first version runs without an external AI service, so it is fast and costs nothing to run.</p>
      </section>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {quickQuestions.map((question) => (
          <button key={question} onClick={() => send(question)} className="rounded-full border border-border bg-card px-3 py-2 text-[10px] font-bold shadow-2xs transition active:scale-[.98]">
            {question}
          </button>
        ))}
      </div>

      <section className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-3xl border border-border/80 bg-muted/20 p-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-[11px] leading-5 ${message.role === "user" ? "rounded-br-md bg-emerald-600 text-white" : "rounded-bl-md border border-border bg-card text-foreground"}`}>
              {message.text}
            </div>
          </div>
        ))}
      </section>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
        <MessageCircle className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
        <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs outline-none" placeholder="Ask support something..." aria-label="Support question" />
        <button type="submit" disabled={!input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white disabled:opacity-40" aria-label="Send support question">
          <Send className="h-4 w-4" />
        </button>
      </form>

      <Link href={routes.feedback} className="mt-2 text-center text-[10px] font-bold text-emerald-700">Need a human? Contact the Extrovert team →</Link>
    </main>
  );
}
