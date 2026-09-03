import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { CredentialsPanel } from "./credentials-panel";
import { SettingsControls } from "./settings-controls";
import { DeleteAccount } from "./delete-account";
import { DevicePreferences } from "@/components/settings/device-preferences";
import { signOut } from "@/app/(app)/actions";
import { SlidersHorizontal, LogOut, ExternalLink, Lock, Link2 } from "lucide-react";

export const metadata: Metadata = { title: "Settings | Extrovert Date" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase=await createServerSupabaseClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
  const authProviders=(user.identities??[]).map(i=>i.provider); const hasPassword=authProviders.includes("email");
  const [{data:identity},{data:preferences},{data:profile},{data:blocks},{data:subscription}]=await Promise.all([
    supabase.from("extrovert_profiles").select("display_name,department,academic_year,verification_status,area_verification_status,trust_state").eq("id",user.id).maybeSingle(),
    supabase.from("dating_preferences").select("interested_in,min_age,max_age,preferred_department").eq("user_id",user.id).maybeSingle(),
    supabase.from("profiles").select("ghost_mode").eq("id",user.id).maybeSingle(),
    supabase.from("blocks").select("blocked_id").eq("blocker_id",user.id),
    supabase.from("subscriptions").select("plan,status,current_period_end").eq("user_id",user.id).maybeSingle(),
  ]);
  const blockedIds=(blocks??[]).map(b=>b.blocked_id); let blockedUsers:{id:string;display_name:string;department:string}[]=[];
  if(blockedIds.length){const {data}=await supabase.from("profiles").select("id,display_name,department").in("id",blockedIds);blockedUsers=(data??[]).map(p=>({id:p.id,display_name:p.display_name,department:p.department}));}
  const showMe=preferences?.interested_in?.includes("everyone")||((preferences?.interested_in?.includes("men")??false)&&(preferences?.interested_in?.includes("women")??false))?"Everyone":preferences?.interested_in?.[0]?preferences.interested_in[0].replace(/^./,(c:string)=>c.toUpperCase()):"Everyone";
  const extrovertUrl=process.env.NEXT_PUBLIC_EXTROVERT_URL;
  return <div className="mx-auto max-w-md px-3.5 py-4 space-y-4 font-sans select-none pb-24">
    <div className="px-1"><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">EXTROVERT DATE</p><h1 className="text-2xl font-black tracking-tight">Settings</h1><p className="text-[11px] text-muted-foreground font-medium">Dating controls, privacy and account safety</p></div>
    <section className="rounded-3xl border border-emerald-200/70 bg-emerald-50/50 p-4 shadow-xs"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-emerald-700"><Link2 className="h-4 w-4"/></div><div className="min-w-0 flex-1"><p className="text-xs font-black text-emerald-950">Shared identity · Extrovert</p><p className="mt-1 text-[10px] leading-4 text-emerald-800">{identity?.display_name||"Your identity"}{identity?.department?` · ${identity.department}`:""}{identity?.academic_year?` · ${identity.academic_year}`:""}</p><p className="mt-1 text-[9px] text-emerald-800">Identity, student details, local area and verification are managed in Extrovert.</p>{extrovertUrl?<a href={extrovertUrl} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">Edit in Extrovert <ExternalLink className="h-3 w-3"/></a>:<p className="mt-2 text-[10px] font-semibold text-rose-700">Extrovert connection is not configured. Please contact support.</p>}</div></div></section>
    <section className="rounded-3xl border border-border/80 bg-card p-4 space-y-3 shadow-xs"><div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5 text-blue-600"/> Dating & Matching</span><Link href={routes.profileSetup} className="text-xs font-bold text-emerald-600">Edit</Link></div><div className="grid grid-cols-3 gap-2 pt-1 text-center"><div className="rounded-2xl bg-muted/40 p-2.5 border border-border/60"><span className="text-[9px] uppercase font-bold text-muted-foreground block">Show me</span><span className="text-xs font-extrabold block truncate">{showMe}</span></div><div className="rounded-2xl bg-muted/40 p-2.5 border border-border/60"><span className="text-[9px] uppercase font-bold text-muted-foreground block">Age</span><span className="text-xs font-extrabold block">{preferences?.min_age??18}–{preferences?.max_age??25}</span></div><div className="rounded-2xl bg-muted/40 p-2.5 border border-border/60"><span className="text-[9px] uppercase font-bold text-muted-foreground block">Dept</span><span className="text-xs font-extrabold block truncate">{preferences?.preferred_department||"All"}</span></div></div></section>
    <DevicePreferences/>
    {hasPassword&&<CredentialsPanel currentEmail={user.email??""} hasPassword={hasPassword}/>} 
    <SettingsControls initialGhostMode={Boolean(profile?.ghost_mode)} blockedUsers={blockedUsers} subscription={{plan:subscription?.plan??"free",status:subscription?.status??"inactive",currentPeriodEnd:subscription?.current_period_end??null}}/>
    <DeleteAccount/>
    <section className="rounded-3xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-xs"><div className="px-4 py-2.5 bg-muted/30"><span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3 text-zinc-500"/> Safety & Policies</span></div><Link href={routes.safety} className="flex items-center justify-between p-3.5 text-xs font-semibold"><span>Safety Center</span><ExternalLink className="w-3.5 h-3.5 text-muted-foreground"/></Link><Link href={routes.privacy} className="flex items-center justify-between p-3.5 text-xs font-semibold"><span>Privacy & Data Rights</span><ExternalLink className="w-3.5 h-3.5 text-muted-foreground"/></Link><Link href={routes.terms} className="flex items-center justify-between p-3.5 text-xs font-semibold"><span>Terms of Service</span><ExternalLink className="w-3.5 h-3.5 text-muted-foreground"/></Link></section>
    <form action={signOut}><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs font-bold text-rose-700 shadow-2xs"><LogOut className="w-4 h-4"/>Sign Out Securely</button></form>
  </div>;
}
