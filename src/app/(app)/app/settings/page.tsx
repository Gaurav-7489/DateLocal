import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { CredentialsPanel } from "./credentials-panel";
import { SettingsControls } from "./settings-controls";
import { DeleteAccount } from "./delete-account";
import { DevicePreferences } from "@/components/settings/device-preferences";
import { signOut } from "@/app/(app)/actions";
import { SlidersHorizontal, LogOut, ExternalLink, Lock, ShieldCheck, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Settings | Extrovert" };
export const dynamic = "force-dynamic";
function TrustBadge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) { return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}><ShieldCheck className="h-2.5 w-2.5" />{ok ? yes : no}</span>; }

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const authProviders = (user.identities ?? []).map((i) => i.provider);
  const hasPassword = authProviders.includes("email");
  const { data: identity } = await supabase.from("extrovert_profiles").select("display_name,gender,area_id,department,academic_year,verification_status,area_verification_status,trust_state").eq("id", user.id).maybeSingle();
  const [{ data: preferences }, { data: profile }, { data: blocks }, { data: subscription }] = await Promise.all([
    supabase.from("dating_preferences").select("interested_in,min_age,max_age,preferred_department").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("ghost_mode").eq("id", user.id).maybeSingle(),
    supabase.from("blocks").select("blocked_id").eq("blocker_id", user.id),
    supabase.from("subscriptions").select("plan,status,current_period_end").eq("user_id", user.id).maybeSingle(),
  ]);
  const { data: area } = identity?.area_id ? await supabase.from("extrovert_areas").select("name").eq("id", identity.area_id).maybeSingle() : { data: null };
  const blockedIds = (blocks ?? []).map((b) => b.blocked_id);
  let blockedUsers: { id: string; display_name: string; department: string }[] = [];
  if (blockedIds.length) { const { data } = await supabase.from("profiles").select("id,display_name,department").in("id", blockedIds); blockedUsers = (data ?? []).map((p) => ({ id: p.id, display_name: p.display_name, department: p.department })); }
  const rawShowMe = preferences?.interested_in?.[0];
  const showMe = preferences?.interested_in?.includes("everyone") ? "Everyone" : preferences?.interested_in?.includes("men") && preferences?.interested_in?.includes("women") ? "Everyone" : rawShowMe ? rawShowMe.replace("nonbinary", "Non-binary / Other").replace(/^./, (c: string) => c.toUpperCase()) : "Everyone";

  return <div className="mx-auto max-w-md space-y-4 px-3.5 py-4 pb-24 font-sans select-none">
    <div className="px-1"><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600">EXTROVERT</p><h1 className="text-2xl font-black tracking-tight">Settings</h1><p className="font-medium text-[11px] text-muted-foreground">Identity, verification, privacy and account controls</p></div>
    <section className="rounded-3xl border border-emerald-200/70 bg-emerald-50/50 p-4 shadow-xs"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-emerald-600"><ShieldCheck className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-black text-emerald-950">Your Extrovert trust profile</p><p className="mt-1 text-[10px] leading-4 text-emerald-800">{identity?.display_name || "Your identity"}{identity?.gender ? ` · ${identity.gender}` : ""}{identity?.department ? ` · ${identity.department}` : ""}{identity?.academic_year ? ` · ${identity.academic_year}` : ""}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800"><MapPin className="h-3 w-3" />{area?.name || "Area not set"}</p><div className="mt-2 flex flex-wrap gap-1"><TrustBadge ok={identity?.verification_status === "verified"} yes="Identity verified" no="Identity not verified" /><TrustBadge ok={identity?.area_verification_status === "verified"} yes="Area verified" no="Area not verified" /></div><p className="mt-2 text-[9px] leading-4 text-emerald-800">Verification is optional. You keep full access if you skip or fail verification. Documents and selfies are private and never shown to other users.</p><div className="mt-2 flex flex-wrap gap-3"><Link href={routes.verify} className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">Identity verification <ExternalLink className="h-3 w-3" /></Link><Link href={routes.profileSetup} className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">Profile & area <ExternalLink className="h-3 w-3" /></Link></div></div></div></section>
    <section className="space-y-3 rounded-3xl border border-border/80 bg-card p-4 shadow-xs"><div className="flex items-center justify-between"><span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" /> Dating & Matching</span><Link href={routes.profileSetup} className="text-xs font-bold text-emerald-600">Edit</Link></div><div className="grid grid-cols-3 gap-2 pt-1 text-center"><div className="rounded-2xl border border-border/60 bg-muted/40 p-2.5"><span className="block text-[9px] font-bold uppercase text-muted-foreground">Show me</span><span className="block truncate text-xs font-extrabold">{showMe}</span></div><div className="rounded-2xl border border-border/60 bg-muted/40 p-2.5"><span className="block text-[9px] font-bold uppercase text-muted-foreground">Age</span><span className="block text-xs font-extrabold">{preferences?.min_age ?? 18}–{preferences?.max_age ?? 25}</span></div><div className="rounded-2xl border border-border/60 bg-muted/40 p-2.5"><span className="block text-[9px] font-bold uppercase text-muted-foreground">Dept</span><span className="block truncate text-xs font-extrabold">{preferences?.preferred_department || "All"}</span></div></div></section>
    <DevicePreferences />{hasPassword && <CredentialsPanel currentEmail={user.email ?? ""} hasPassword={hasPassword} />}<SettingsControls initialGhostMode={Boolean(profile?.ghost_mode)} blockedUsers={blockedUsers} subscription={{ plan: subscription?.plan ?? "free", status: subscription?.status ?? "inactive", currentPeriodEnd: subscription?.current_period_end ?? null }} /><DeleteAccount />
    <section className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs"><div className="bg-muted/30 px-4 py-2.5"><span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><Lock className="h-3 w-3" /> Safety & Policies</span></div><Link href={routes.safety} className="flex items-center justify-between p-3.5 text-xs font-semibold"><span>Safety Center</span><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></Link><Link href={routes.privacy} className="flex items-center justify-between p-3.5 text-xs font-semibold"><span>Privacy & Data Rights</span><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></Link><Link href={routes.terms} className="flex items-center justify-between p-3.5 text-xs font-semibold"><span>Terms of Service</span><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></Link></section>
    <form action={signOut}><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs font-bold text-rose-700 shadow-2xs"><LogOut className="h-4 w-4" />Sign Out Securely</button></form>
  </div>;
}
