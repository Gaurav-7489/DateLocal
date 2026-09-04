"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, MessageSquare, Send } from "lucide-react";
import { routes } from "@/config/routes";

const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

export default function FeedbackPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("_subject", "Extrovert feedback");
    data.set("source", "Extrovert app");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form submission failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center px-4 pb-24">
        <section className="w-full rounded-[2rem] border border-emerald-200 bg-emerald-50 p-7 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">Message sent</p>
          <h1 className="mt-1 text-2xl font-black text-emerald-950">Thanks for reaching out.</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-emerald-800">Your feedback has been sent to the Extrovert team.</p>
          <div className="mt-6 grid gap-2">
            <Link href={routes.settings} className="flex h-11 items-center justify-center rounded-2xl bg-emerald-600 text-xs font-black text-white">Back to Settings</Link>
            <button onClick={() => setStatus("idle")} className="h-11 rounded-2xl border border-emerald-200 bg-white text-xs font-bold text-emerald-800">Send another message</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-3.5 py-4 pb-24 font-sans">
      <Link href={routes.settings} className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Settings
      </Link>

      <div className="mt-5 px-1">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">EXTROVERT</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">Contact & Feedback</h1>
        <p className="mt-1 text-[11px] font-medium leading-5 text-muted-foreground">Tell us what is working, what is not, or what you want to see next.</p>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3 rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Name</span>
          <input name="name" required maxLength={100} autoComplete="name" className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:border-emerald-500" placeholder="Your name" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input name="email" required type="email" maxLength={254} autoComplete="email" className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-emerald-500" placeholder="you@example.com" />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Message</span>
          <div className="relative">
            <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <textarea name="message" required minLength={5} maxLength={2000} rows={7} className="w-full resize-none rounded-2xl border border-border bg-background py-3 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" placeholder="Write your feedback or question..." />
          </div>
        </label>

        {status === "error" && (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold leading-5 text-rose-700">
            We could not send your message. Please check the connection and try again.
          </p>
        )}

        {!endpoint && (
          <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-700">
            Feedback is not configured yet. Add NEXT_PUBLIC_FORMSPREE_ENDPOINT in the production environment.
          </p>
        )}

        <button disabled={status === "sending" || !endpoint} type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-xs font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
          {status === "sending" ? "Sending…" : <><Send className="h-4 w-4" /> Send Feedback</>}
        </button>
      </form>
    </main>
  );
}
