"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Heart, X, ShieldCheck, Sparkles, MessageCircle, MoreVertical, RotateCcw, SlidersHorizontal, UserRound, Loader2, Star } from "lucide-react";
import { likeProfile, passProfile, rewindLastPass, resetPassedProfiles, blockUser, reportUser, superLikeProfile } from "./actions";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/utils";
import SuperChatComposer from "@/components/payments/superchat-composer";
import { SHOP_PRODUCTS } from "@/lib/shop";

type Interest = { id: string; name: string };
type ProfileInterest = { interests: Interest | Interest[] | null };
type ProfilePhoto = { storage_path: string; display_order: number; is_primary: boolean; url?: string | null };

export type DiscoverProfile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department: string | null;
  academic_year: string | null;
  bio: string | null;
  profile_photos: ProfilePhoto[] | null;
  profile_interests: ProfileInterest[] | null;
  profile_photo_url: string | null;
  verification_status?: string | null;
  area_verification_status?: string | null;
  area_name?: string | null;
};

type Props = { profiles: DiscoverProfile[]; isPro?: boolean };

function genderLabel(value: string | null) {
  const gender = (value ?? "").toLowerCase();
  if (gender === "woman" || gender === "female") return "Woman";
  if (gender === "man" || gender === "male") return "Man";
  if (gender === "non-binary" || gender === "nonbinary") return "Non-binary";
  return "Other";
}

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[9px] font-black text-white">
      <ShieldCheck className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

export default function DiscoverClient({ profiles, isPro = false }: Props) {
  const router = useRouter();
  const [deck, setDeck] = useState(profiles);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [match, setMatch] = useState<DiscoverProfile | null>(null);
  const [safety, setSafety] = useState<DiscoverProfile | null>(null);
  const [reporting, setReporting] = useState<DiscoverProfile | null>(null);
  const [reportReason, setReportReason] = useState("Inappropriate photo or content");
  const [reportDetails, setReportDetails] = useState("");
  const [superChat, setSuperChat] = useState<DiscoverProfile | null>(null);

  useEffect(() => setDeck(profiles), [profiles]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  async function act(id: string, kind: "like" | "pass" | "super") {
    if (busy) return;
    const target = deck.find((profile) => profile.id === id);
    if (!target) return;
    setBusy(true);
    setDeck((current) => current.filter((profile) => profile.id !== id));
    try {
      const result = kind === "like" ? await likeProfile(id) : kind === "pass" ? await passProfile(id) : await superLikeProfile(id);
      if (result.error) {
        setDeck((current) => [target, ...current]);
        notify(result.error);
      } else if (kind === "like" && "matched" in result && result.matched) {
        setMatch(target);
      } else if (kind === "super") {
        notify(`Super Like sent to ${target.display_name ?? "this person"}.`);
      }
    } catch {
      setDeck((current) => [target, ...current]);
      notify("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function rewind() {
    if (!isPro || busy) return;
    setBusy(true);
    try {
      const result = await rewindLastPass();
      if (result.error) notify(result.error);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function reviewPassed() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await resetPassedProfiles();
      if (result.error) notify(result.error);
      else if (!result.count) notify("No passed profiles to review yet.");
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function block() {
    if (!safety) return;
    const profile = safety;
    setSafety(null);
    const result = await blockUser(profile.id);
    if (result.error) notify(result.error);
    else {
      setDeck((current) => current.filter((item) => item.id !== profile.id));
      notify("Profile blocked.");
    }
  }

  async function report(event: React.FormEvent) {
    event.preventDefault();
    if (!reporting) return;
    setBusy(true);
    const result = await reportUser(reporting.id, reportReason, reportDetails);
    setBusy(false);
    if (result.error) notify(result.error);
    else {
      setDeck((current) => current.filter((item) => item.id !== reporting.id));
      setReporting(null);
      setReportDetails("");
      notify("Report submitted and profile removed.");
    }
  }

  const current = deck[0];

  if (!current && !match) {
    return (
      <main className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-md items-center justify-center px-4 pb-24">
        <section className="w-full rounded-[2rem] border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <Sparkles className="mx-auto h-8 w-8 text-pink-500" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[.18em] text-zinc-400">Dating discovery</p>
          <h1 className="mt-1 text-2xl font-black">That&apos;s everyone for now.</h1>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-zinc-500">New people will appear as they join. You can also review profiles you previously passed.</p>
          <Button onClick={() => void reviewPassed()} disabled={busy} className="mt-5 h-11 w-full rounded-2xl">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
            Review passed profiles
          </Button>
          <Link href={routes.profileSetup} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 text-xs font-black">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Edit preferences
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-md flex-col px-3 pb-20 pt-1">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-16 z-[110] -translate-x-1/2 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-2 text-xs font-bold text-pink-800 shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-0 flex-1 items-center justify-center py-1">
        <div className="relative h-[min(72dvh,520px)] w-full max-w-[390px]">
          {deck.slice(0, 2).map((profile, index) => (
            <DiscoverCard key={profile.id} profile={profile} isTop={index === 0} onSwipe={(direction) => void act(profile.id, direction === "right" ? "like" : "pass")} onSafety={() => setSafety(profile)} onSuperChat={() => setSuperChat(profile)} />
          ))}
        </div>
      </div>

      {current && (
        <nav className="z-30 mx-auto flex w-full max-w-[348px] items-center justify-center gap-2 rounded-[2rem] border border-zinc-200 bg-white px-2.5 py-2 shadow-lg">
          <button onClick={() => void rewind()} disabled={!isPro || busy} className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-zinc-200 text-zinc-500 disabled:opacity-35"><RotateCcw className="h-4 w-4" /><span className="text-[8px] font-bold">Undo</span></button>
          <button onClick={() => void act(current.id, "pass")} disabled={busy} className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-zinc-200 text-zinc-700 disabled:opacity-50"><X className="h-5 w-5" /><span className="text-[8px] font-bold">Pass</span></button>
          <button onClick={() => void act(current.id, "like")} disabled={busy} className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-pink-500 text-white disabled:opacity-50"><Heart className="h-5 w-5 fill-current" /><span className="text-[8px] font-black">Like</span></button>
          <button onClick={() => void act(current.id, "super")} disabled={busy} className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 disabled:opacity-50"><Star className="h-5 w-5 fill-current" /><span className="text-[8px] font-bold">Super</span></button>
          <Link href={`${routes.profileView}/${current.id}`} className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-zinc-300 text-zinc-700"><UserRound className="h-5 w-5" /><span className="text-[8px] font-bold">Profile</span></Link>
        </nav>
      )}

      <AnimatePresence>
        {safety && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-[2rem] bg-white p-5">
              <div className="flex items-center justify-between"><b className="text-sm">Safety controls</b><button onClick={() => setSafety(null)}><X className="h-5 w-5" /></button></div>
              <div className="mt-4 grid gap-2">
                <Link href={`${routes.profileView}/${safety.id}`} onClick={() => setSafety(null)} className="rounded-2xl border p-3 text-xs font-bold">View profile</Link>
                <button onClick={() => { setReporting(safety); setSafety(null); }} className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left text-xs font-bold text-amber-700">Report profile</button>
                <button onClick={() => void block()} className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-left text-xs font-bold text-rose-700">Block user</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reporting && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-3">
            <motion.form onSubmit={report} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-[2rem] bg-white p-5">
              <div className="flex items-center justify-between"><b className="text-base">Report {reporting.display_name}</b><button type="button" onClick={() => setReporting(null)}><X className="h-5 w-5" /></button></div>
              <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="mt-4 w-full rounded-xl border p-3 text-xs"><option>Inappropriate photo or content</option><option>Harassment or abusive behavior</option><option>Fake or impersonated profile</option><option>Spam or commercial advertising</option><option>Underage user</option><option>Other safety concern</option></select>
              <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} rows={4} maxLength={500} className="mt-3 w-full resize-none rounded-xl border p-3 text-xs" placeholder="Additional details (optional)" />
              <div className="mt-3 flex gap-2"><Button type="button" variant="secondary" onClick={() => setReporting(null)} className="flex-1">Cancel</Button><Button disabled={busy} className="flex-1 bg-rose-600 text-white">{busy ? "Submitting…" : "Report & Block"}</Button></div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {match && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 p-4">
            <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-3xl bg-white p-7 text-center">
              <button onClick={() => setMatch(null)} className="float-right"><X className="h-4 w-4" /></button>
              <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-pink-50">{match.profile_photo_url ? <Image src={match.profile_photo_url} alt="" width={80} height={80} className="h-full w-full object-cover" /> : <Heart className="h-8 w-8 fill-current text-pink-500" />}</div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-pink-500">Mutual connection</p>
              <h2 className="mt-1 text-2xl font-black">It&apos;s a Match</h2>
              <p className="mt-2 text-xs text-zinc-500">You and <b>{match.display_name}</b> liked each other.</p>
              <Link href={routes.messages} className="mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl bg-pink-500 text-xs font-black text-white">Open chat <MessageCircle className="h-4 w-4" /></Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {superChat && <SuperChatComposer profileId={superChat.id} profileName={superChat.display_name ?? "Member"} price={SHOP_PRODUCTS.superchat.amountPaise / 100} onClose={() => setSuperChat(null)} />}
    </main>
  );
}

function DiscoverCard({ profile, isTop, onSwipe, onSafety, onSuperChat }: { profile: DiscoverProfile; isTop: boolean; onSwipe: (direction: "left" | "right") => void; onSafety: () => void; onSuperChat: () => void }) {
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const photo = profile.profile_photos?.find((item) => item.is_primary)?.url ?? profile.profile_photo_url;
  const interests = (profile.profile_interests ?? []).flatMap((item) => item.interests ? (Array.isArray(item.interests) ? item.interests : [item.interests]) : []);

  return (
    <motion.article drag={isTop ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.85} onDragEnd={(_, info: PanInfo) => { if (Math.abs(info.offset.x) > 110) onSwipe(info.offset.x > 0 ? "right" : "left"); }} className={`absolute inset-0 overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-100 shadow-xl ${isTop ? "z-20 cursor-grab active:cursor-grabbing" : "z-10 scale-[.97] opacity-70"}`}>
      {photo ? <Image src={photo} alt="" fill sizes="(max-width: 420px) 100vw, 390px" className="object-cover" priority={isTop} /> : <div className="absolute inset-0 grid place-items-center text-zinc-400"><UserRound className="h-16 w-16" /></div>}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5 pt-28 text-white">
        <div className="flex items-end justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-2xl font-black">{profile.display_name || "Member"}{age ? `, ${age}` : ""}</h2><p className="mt-1 text-xs font-semibold opacity-90">{genderLabel(profile.gender)}{profile.department ? ` · ${profile.department}` : ""}{profile.area_name ? ` · ${profile.area_name}` : ""}</p></div><button type="button" onClick={onSafety} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur" aria-label="Safety controls"><MoreVertical className="h-5 w-5" /></button></div>
        <div className="mt-2 flex flex-wrap gap-1">{profile.verification_status === "verified" && <TrustBadge label="Identity verified" />}{profile.area_verification_status === "verified" && <TrustBadge label="Area verified" />}</div>
        {profile.bio && <p className="mt-3 line-clamp-2 text-xs leading-5 opacity-95">{profile.bio}</p>}
        {interests.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{interests.slice(0, 5).map((item) => <span key={item.id} className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-bold backdrop-blur">{item.name}</span>)}</div>}
        <button type="button" onClick={onSuperChat} className="mt-3 rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-black backdrop-blur">Send SuperChat</button>
      </div>
    </motion.article>
  );
}
