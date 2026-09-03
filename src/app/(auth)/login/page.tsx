import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Users, Link2 } from "lucide-react";

const PRODUCTION_DATELOCAL_URL = "https://datelocal-gaurav-7489s-projects.vercel.app";
const PRODUCTION_EXTROVERT_URL = "https://extrovert-ten.vercel.app";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function normalizeOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.origin;
  } catch {
    return null;
  }
}

function getAppOrigin() {
  const configured = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (process.env.NODE_ENV === "production") {
    return configured && !LOCAL_HOSTS.has(new URL(configured).hostname) ? configured : PRODUCTION_DATELOCAL_URL;
  }
  return configured ?? "http://localhost:3001";
}

function getExtrovertOrigin(appOrigin: string) {
  const configured = (process.env.EXTROVERT_URL ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter((value): value is string => Boolean(value));
  const appIsLocal = LOCAL_HOSTS.has(new URL(appOrigin).hostname);

  if (process.env.NODE_ENV === "production") {
    const production = configured.find((value) => !LOCAL_HOSTS.has(new URL(value).hostname));
    return production ?? PRODUCTION_EXTROVERT_URL;
  }

  const local = configured.find((value) => LOCAL_HOSTS.has(new URL(value).hostname));
  return local ?? configured[0] ?? (appIsLocal ? "http://localhost:3000" : PRODUCTION_EXTROVERT_URL);
}

export default function LoginPage() {
  const appOrigin = getAppOrigin();
  const extrovert = getExtrovertOrigin(appOrigin);
  const returnTo = `${appOrigin}/auth/callback`;
  const handoffUrl = `${extrovert}/auth/datelocal?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="min-h-[100dvh] bg-background px-5 py-8 font-sans text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">EXTROVERT DATE</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.055em]">Dating starts local.</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Extrovert Date is the dating experience powered by your Extrovert identity. One account, one identity, two focused experiences.</p>
        </div>
        <section className="space-y-2.5">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-xs font-black">Extrovert identity</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Your name, identity and trust status stay owned by Extrovert.</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600"><Heart className="h-5 w-5" /></div><div><p className="text-xs font-black">Extrovert Date</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Dating profile, matches, dating chats and premium live here.</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><Users className="h-5 w-5" /></div><div><p className="text-xs font-black">Extrovert Social</p><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Your people and social conversations remain part of Extrovert.</p></div></div>
        </section>
        <a href={handoffUrl} className="mt-6 flex h-13 w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 text-sm font-black text-white shadow-lg shadow-zinc-950/10 transition-transform active:scale-[.99]"><span>Continue with Extrovert</span><ArrowRight className="h-4 w-4" /></a>
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold text-muted-foreground"><Link2 className="h-3.5 w-3.5 text-emerald-600"/><span>One Extrovert identity</span></div>
        <p className="mt-1.5 text-center text-[10px] leading-4 text-muted-foreground">Extrovert owns identity, verification and social connections. Extrovert Date owns dating preferences, likes, matches and dating chats.</p>
      </div>
    </main>
  );
}
