"use client";

import { useEffect } from "react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep production error details out of the UI; server diagnostics stay in Vercel logs.
  }, []);

  return (
    <main className="min-h-screen bg-background px-5 py-16 font-sans">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">EXTROVERT DATE</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">This page hit a server problem</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your account is safe. The page could not finish loading because of a temporary server-side problem.
          Please try again. If it keeps happening, contact support and include the time of the error.
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => reset()} className="rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-black text-white">Try again</button>
          <a href="/app" className="rounded-2xl border border-border px-4 py-3 text-xs font-black">Back to Extrovert Date</a>
        </div>
      </div>
    </main>
  );
}
