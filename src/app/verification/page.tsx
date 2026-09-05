import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

export default async function IdentityVerificationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);
  const params = await searchParams;
  const { data: profile } = await supabase.from("extrovert_profiles").select("verification_status").eq("id", user.id).maybeSingle();
  const verified = profile?.verification_status === "verified";

  return <main className="min-h-[100dvh] bg-[#f7fbf9] px-4 py-6 font-sans text-zinc-950">
    <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-lg items-center justify-center">
      <section className="w-full rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,.08)] sm:p-8">
        <Link href={routes.onboarding} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-emerald-700"><ArrowLeft className="h-3.5 w-3.5"/> Back to setup</Link>
        <div className="mt-7 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><ShieldCheck className="h-7 w-7"/></div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">EXTROVERT · IDENTITY</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{verified ? "Your identity is verified." : "Verify your identity."}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{verified ? "Your verified identity is already connected to this Extrovert account." : "Use a government ID and the verification flow to prove you are a real person. Verification is separate from email verification and does not make your ID public."}</p>
        {params.error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{params.error}</div>}
        <div className="mt-6 grid gap-2.5">
          {["Your identity details are handled through the verification provider.","Extrovert only uses the verified result needed for your profile.","Your public profile shows a verification badge, not your government ID.","You can continue setup even if verification is still processing."].map(text => <div key={text} className="flex items-start gap-2.5 rounded-2xl border border-zinc-100 bg-zinc-50 p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"/><span className="text-[11px] leading-5 text-zinc-600">{text}</span></div>)}
        </div>
        {!verified && <Link href="/api/verification/start" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">Start identity verification <ArrowRight className="h-4 w-4"/></Link>}
        <Link href={routes.onboarding} className="mt-3 flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-50">{verified ? "Continue setup" : "Skip for now"}</Link>
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-zinc-400"><Sparkles className="h-3 w-3 text-emerald-600"/> Identity verification is optional on Extrovert</div>
      </section>
    </div>
  </main>;
}
