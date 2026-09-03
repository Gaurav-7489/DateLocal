"use client";

import { useActionState, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { saveProfile, type ProfileFormState } from "./actions";
import { Card } from "@/components/ui/card";
import { ProfilePhotoUploader } from "./components/profile-photo-uploader";
import { Heart, Search, GraduationCap, MapPin, MessageSquareHeart, Moon } from "lucide-react";

const GOALS = [["Long-term", "Something genuine"], ["short & Chill", "Good conversations, good vibes"], ["Study Buddy", "Study together"], ["Friends & Connections", "Meet new people"]];
const RESIDENCY = [["Hostel", "Campus resident"], ["Day Scholar", "Daily commuter"], ["Off-Campus / PG / Flat", "Living off campus"]];
const HANGOUTS = ["Canteen", "Library", "Sports Ground", "Labs"];
const SLEEP = ["Night Owl", "Early Bird", "Flexible"];
const COFFEE = ["Chai", "Cold Coffee", "Energy Drinks", "Water / Green Tea"];
const WEEKEND = ["Gaming & Movies", "Cafes & Exploring", "Side Projects & Coding", "Sleeping In"];
const PROMPTS = ["The quickest way to win me over at the canteen is...", "My unpopular campus opinion is...", "Best spot on campus to get peace and quiet is...", "If you want to study with me, you should know that..."];
const INTERESTED_IN = [["men", "Men"], ["women", "Women"], ["everyone", "Everyone"]];

interface Interest { id: string; name: string }
interface ExistingProfile {
  bio: string | null; campus_residency?: string | null; campus_hangout?: string | null; relationship_goal?: string | null;
  zodiac?: string | null; sleep_habit?: string | null; caffeine_pref?: string | null; weekend_vibe?: string | null;
  prompt_question?: string | null; prompt_answer?: string | null;
}
interface ExistingPreferences { interested_in: string[] | null; min_age: number | null; max_age: number | null; preferred_department: string | null }
interface Identity { displayName: string; dateOfBirth: string; gender: string; department: string; academicYear: string; areaName?: string }
interface Props { userId: string; interests: Interest[]; existingProfile: ExistingProfile | null; existingPhotoUrls: string[]; existingPhotoPaths: string[]; existingInterestIds: string[]; existingPreferences: ExistingPreferences | null; identity: Identity }

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`pressable smooth rounded-2xl border px-3 py-3 text-left text-xs font-bold ${active ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-border bg-background text-foreground"}`}>{children}</button>;
}
function Title({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return <div className="mb-4 flex items-start gap-2.5"><div className="mt-0.5">{icon}</div><div><h2 className="text-sm font-black">{title}</h2><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{subtitle}</p></div></div>;
}
function ReadOnly({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-muted/30 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 truncate text-[11px] font-bold">{value}</p></div>;
}

export function DatingProfileForm({ userId, interests, existingProfile, existingPhotoUrls, existingPhotoPaths, existingInterestIds, existingPreferences, identity }: Props) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(saveProfile, {});
  const [bio, setBio] = useState(existingProfile?.bio ?? "");
  const [residency, setResidency] = useState(existingProfile?.campus_residency ?? "");
  const [hangout, setHangout] = useState(existingProfile?.campus_hangout ?? "");
  const [goal, setGoal] = useState(existingProfile?.relationship_goal ?? "");
  const [zodiac, setZodiac] = useState(existingProfile?.zodiac ?? "");
  const [sleep, setSleep] = useState(existingProfile?.sleep_habit ?? "");
  const [coffee, setCoffee] = useState(existingProfile?.caffeine_pref ?? "");
  const [weekend, setWeekend] = useState(existingProfile?.weekend_vibe ?? "");
  const [prompt, setPrompt] = useState(existingProfile?.prompt_question && PROMPTS.includes(existingProfile.prompt_question) ? existingProfile.prompt_question : PROMPTS[0]);
  const [answer, setAnswer] = useState(existingProfile?.prompt_answer ?? "");
  const [search, setSearch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(existingInterestIds));
  const [interestedIn, setInterestedIn] = useState(existingPreferences?.interested_in?.includes("everyone") ? "everyone" : existingPreferences?.interested_in?.[0] ?? "");
  const [minAge, setMinAge] = useState(existingPreferences?.min_age ?? 18);
  const [maxAge, setMaxAge] = useState(existingPreferences?.max_age ?? 30);
  const [photoPaths, setPhotoPaths] = useState(existingPhotoPaths);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => { const first = Object.values(state.fieldErrors ?? {})[0]; setNotice(state.error ?? first ?? null); }, [state.error, state.fieldErrors]);
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return q ? interests.filter((x) => x.name.toLowerCase().includes(q)) : interests; }, [interests, search]);
  function toggle(id: string) { setSelectedInterests((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  function submit(event: FormEvent<HTMLFormElement>) { if (minAge < 18 || maxAge < 18) { event.preventDefault(); setNotice("DateLocal is for adults 18 and over. Choose an age range starting at 18."); } }

  return <form action={formAction} onSubmit={submit} className="space-y-4">
    {notice && <div role="alert" className="sticky top-3 z-40 flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-xs font-semibold text-rose-700 shadow-lg"><span>{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">×</button></div>}
    {photoPaths.map((path) => <input key={path} type="hidden" name="photo_paths" value={path} />)}

    <Card className="p-4 sm:p-5"><Title icon={<span className="text-emerald-600">▣</span>} title="Your photos" subtitle="Put your best photo first. Add up to 6." /><ProfilePhotoUploader userId={userId} existingPhotoUrls={existingPhotoUrls} existingPhotoPaths={existingPhotoPaths} onPhotosUploaded={setPhotoPaths} /></Card>

    <Card className="p-4 sm:p-5"><Title icon={<span className="text-emerald-600">✓</span>} title="Who are you?" subtitle="Your verified identity comes from Extrovert. Nothing here can change it." /><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><ReadOnly label="Name" value={identity.displayName || "Student"} /><ReadOnly label="Gender" value={identity.gender || "Not set"} /><ReadOnly label="Department" value={identity.department || "Not set"} /><ReadOnly label="Year" value={identity.academicYear || "Not set"} /></div><div className="mt-2.5 rounded-2xl border border-border bg-muted/20 px-3 py-2.5 text-[10px] leading-4 text-muted-foreground"><GraduationCap className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />College / university, student identity and verification are controlled by Extrovert.</div></Card>

    <Card className="p-4 sm:p-5"><Title icon={<GraduationCap className="h-4 w-4 text-emerald-600" />} title="What do you do?" subtitle="Useful context for a date — kept separate from private details." /><div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"><ReadOnly label="College / university" value="Your verified campus" /><ReadOnly label="Study / work" value={`${identity.department || "Student"} · ${identity.academicYear || "Current"}`} /></div><p className="mt-2 text-[10px] leading-4 text-muted-foreground">To change student identity or campus details, use Extrovert.</p></Card>

    <Card className="p-4 sm:p-5"><Title icon={<Heart className="h-4 w-4 text-rose-500" />} title="What are you looking for?" subtitle="Choose the kind of connection you want on DateLocal." /><div className="grid grid-cols-2 gap-2">{GOALS.map(([value, desc]) => <Choice key={value} active={goal === value} onClick={() => setGoal(goal === value ? "" : value)}><span>{value}</span><span className="mt-1 block text-[9px] font-medium opacity-60">{desc}</span></Choice>)}</div><input type="hidden" name="relationship_goal" value={goal} /></Card>

    <Card className="p-4 sm:p-5"><Title icon={<MapPin className="h-4 w-4 text-emerald-600" />} title="Where do you belong?" subtitle="Area is handled by Extrovert. Personal location details stay optional." /><div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Your local area</p><p className="mt-1 text-sm font-black text-emerald-950">{identity.areaName || "Verified area"}</p><p className="mt-1 text-[10px] leading-4 text-emerald-900/70">Only approximate locality is used for discovery. Exact coordinates are never shown.</p></div><input type="hidden" name="campus_residency" value={residency} /><input type="hidden" name="campus_hangout" value={hangout} /><div className="mt-4 border-t border-border pt-4"><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Currently based <span className="normal-case font-semibold tracking-normal">(optional)</span></p><div className="mt-2 grid grid-cols-3 gap-2">{RESIDENCY.map(([value, desc]) => <Choice key={value} active={residency === value} onClick={() => setResidency(residency === value ? "" : value)}><span>{value}</span><span className="mt-1 block text-[9px] font-medium opacity-60">{desc}</span></Choice>)}</div></div><div className="mt-4"><p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Favourite spot <span className="normal-case font-semibold tracking-normal">(optional)</span></p><div className="mt-2 flex flex-wrap gap-2">{HANGOUTS.map((value) => <Choice key={value} active={hangout === value} onClick={() => setHangout(hangout === value ? "" : value)}>{value}</Choice>)}</div></div></Card>

    <Card className="p-4 sm:p-5"><Title icon={<MessageSquareHeart className="h-4 w-4 text-emerald-600" />} title="Show who you are" subtitle="Share only what feels comfortable. These are dating details, not identity." /><label className="block"><span className="label">Short bio <span className="normal-case tracking-normal font-semibold">(optional)</span></span><textarea name="bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 500))} rows={3} placeholder="A little about your vibe..." className="input mt-2 h-auto resize-none py-3" /></label><div className="mt-4"><span className="label">Interests</span><div className="relative mt-2"><Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search interests" className="input pl-9" /></div><div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">{filtered.map((item) => <button type="button" key={item.id} onClick={() => toggle(item.id)} className={`pressable rounded-full border px-3 py-2 text-[10px] font-bold ${selectedInterests.has(item.id) ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-border bg-background text-muted-foreground"}`}>{selectedInterests.has(item.id) ? "✓ " : ""}{item.name}</button>)}</div></div><input type="hidden" name="interests" value={Array.from(selectedInterests).join(",")} /></Card>

    <Card className="p-4 sm:p-5"><Title icon={<Moon className="h-4 w-4 text-indigo-500" />} title="Little things" subtitle="Optional. Skip anything that feels too personal." /><div className="grid gap-4 sm:grid-cols-2"><div><p className="label">Sleep</p><div className="mt-2 flex flex-wrap gap-2">{SLEEP.map((value) => <Choice key={value} active={sleep === value} onClick={() => setSleep(sleep === value ? "" : value)}>{value}</Choice>)}</div></div><div><p className="label">Coffee / drink</p><div className="mt-2 flex flex-wrap gap-2">{COFFEE.map((value) => <Choice key={value} active={coffee === value} onClick={() => setCoffee(coffee === value ? "" : value)}>{value}</Choice>)}</div></div></div><input type="hidden" name="sleep_habit" value={sleep} /><input type="hidden" name="caffeine_pref" value={coffee} /><div className="mt-4"><p className="label">Weekend vibe</p><div className="mt-2 flex flex-wrap gap-2">{WEEKEND.map((value) => <Choice key={value} active={weekend === value} onClick={() => setWeekend(weekend === value ? "" : value)}>{value}</Choice>)}</div></div><input type="hidden" name="weekend_vibe" value={weekend} /><label className="mt-4 block"><span className="label">Zodiac <span className="normal-case tracking-normal font-semibold">(optional)</span></span><input name="zodiac" value={zodiac} onChange={(e) => setZodiac(e.target.value.slice(0, 30))} placeholder="e.g. Leo" className="input mt-2" /></label></Card>

    <Card className="p-4 sm:p-5"><Title icon={<MessageSquareHeart className="h-4 w-4 text-emerald-600" />} title="Start the conversation" subtitle="One prompt is enough to make your profile easier to approach." /><select name="prompt_question" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="input">{PROMPTS.map((item) => <option key={item}>{item}</option>)}</select><textarea name="prompt_answer" value={answer} onChange={(e) => setAnswer(e.target.value.slice(0, 300))} rows={3} placeholder="Your answer..." className="input mt-2 h-auto resize-none py-3" /></Card>

    <Card className="p-4 sm:p-5"><Title icon={<Heart className="h-4 w-4 text-rose-500" />} title="Who would you like to meet?" subtitle="Dating preferences stay private inside DateLocal." /><div className="grid grid-cols-3 gap-2">{INTERESTED_IN.map(([value, label]) => <Choice key={value} active={interestedIn === value} onClick={() => setInterestedIn(value)}>{label}</Choice>)}</div><input type="hidden" name="interested_in" value={interestedIn} /><div className="mt-4 grid grid-cols-2 gap-2.5"><label><span className="label">Minimum age</span><input name="min_age" type="number" min={18} max={60} value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} className="input mt-2" /></label><label><span className="label">Maximum age</span><input name="max_age" type="number" min={18} max={60} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} className="input mt-2" /></label></div><input type="hidden" name="department" value={identity.department} /><input type="hidden" name="academic_year" value={identity.academicYear} /><input type="hidden" name="display_name" value={identity.displayName} /><input type="hidden" name="date_of_birth" value={identity.dateOfBirth} /><input type="hidden" name="gender" value={identity.gender} /></Card>

    <button type="submit" disabled={pending} className="pressable smooth sticky bottom-3 z-30 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-xl disabled:opacity-60">{pending ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Saving your dating profile…</> : <>Save dating profile <span>→</span></>}</button>
    <style jsx>{`.input{width:100%;min-height:50px;border:1px solid hsl(var(--border));border-radius:16px;background:var(--background);padding:0 13px;outline:none;font-size:13px;color:var(--foreground)}.input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.08)}.label{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:hsl(var(--muted-foreground))}`}</style>
  </form>;
}
