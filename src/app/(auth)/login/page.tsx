import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Users } from "lucide-react";

export default function LoginPage() {
  const extrovert = (process.env.EXTROVERT_URL || "http://localhost:3000").replace(/\/$/, "");
  const datelocalOrigin = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/$/, "");
  const returnTo = `${datelocalOrigin}/auth/callback`;
  const handoffUrl = `${extrovert}/auth/datelocal?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="min-h-[100dvh] bg-background px-5 py-8 font-sans text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">DATELOCAL</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.055em]">Dating starts local.</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">DateLocal is the dating layer connected to your Extrovert identity. You use one trusted identity across both experiences.</p>
        </div>

        <section className="space-y-2.5">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-xs font-black">Extrovert identity</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Your name, identity and trust status stay owned by Extrovert.</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600"><Heart className="h-5 w-5" /></div><div><p className="text-xs font-black">DateLocal dating</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Matches, dating preferences, dating chats and premium stay here.</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><Users className="h-5 w-5" /></div><div><p className="text-xs font-black">Social stays connected</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Your Extrovert social connections remain available in the Social chats tab.</p></div></div>
        </section>

        <Link href={handoffUrl} className="mt-6 flex h-13 w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 text-sm font-black text-white shadow-lg shadow-zinc-950/10 transition-transform active:scale-[.99]">
          <span>Continue with Extrovert</span><ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-center text-[10px] leading-4 text-muted-foreground">New here? Extrovert will create your identity first. Returning users will continue with the same identity.</p>
      </div>
    </main>
  );
}
