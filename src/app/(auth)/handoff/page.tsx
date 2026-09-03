"use client";

import { useEffect } from "react";

export default function HandoffPage() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      window.location.replace("/auth/login?error=missing_handoff");
      return;
    }
    const timer = window.setTimeout(() => {
      window.location.replace(`/auth/extrovert?code=${encodeURIComponent(code)}`);
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-3xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_60px_-28px_rgba(15,23,42,.32)]">
          <div className="h-2 w-28 animate-pulse rounded-full bg-[var(--accent-soft)]" />
          <div className="mt-5 h-7 w-44 animate-pulse rounded-xl bg-[var(--surface)]" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded-lg bg-[var(--surface)]" />
          <div className="mt-7 grid gap-2">
            <div className="h-12 animate-pulse rounded-2xl bg-[var(--surface)]" />
            <div className="h-12 animate-pulse rounded-2xl bg-[var(--surface)]" />
          </div>
          <p className="mt-5 text-center text-[11px] font-medium text-[var(--muted)]">Connecting your Extrovert identity…</p>
        </section>
      </div>
    </main>
  );
}
