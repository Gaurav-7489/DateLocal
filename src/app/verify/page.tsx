import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { routes } from "@/config/routes";

export const dynamic="force-dynamic";

export default async function VerifyPage({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;
 return <main className="min-h-[100dvh] bg-white px-5 py-8 font-sans text-zinc-950"><div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center"><Link href={routes.onboarding} className="mb-8 inline-flex w-fit items-center gap-2 text-xs font-bold text-zinc-500"><ArrowLeft className="h-4 w-4"/> Back</Link><div className="grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-8 w-8"/></div><p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">Identity</p><h1 className="mt-2 text-3xl font-black tracking-tight">Verify your identity</h1><p className="mt-3 text-sm leading-6 text-zinc-500">Use your government ID and a quick selfie check. When verification is approved, Extrovert can use the verified name, age and gender instead of asking you to type them.</p>{params.error&&<p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">{params.error}</p>}<a href="/api/verification/start" className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-sm">Verify with ID</a><Link href={routes.onboarding} className="mt-3 flex h-12 items-center justify-center rounded-2xl border border-zinc-200 text-sm font-bold text-zinc-700">Skip for now</Link><p className="mt-5 text-center text-[10px] leading-4 text-zinc-400">If you skip, your profile will show Identity not verified and Area not verified until those checks are completed.</p></div></main>;
}
