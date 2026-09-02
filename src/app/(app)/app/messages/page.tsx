import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessageSquare, Compass, Flame, HeartHandshake, Users, ShieldCheck } from "lucide-react";
import SuperChatRequestCard from "@/components/messages/superchat-request-card";
import ConversationRow from "@/components/messages/conversation-row";

export const metadata: Metadata = { title: "Chats | DateBu" };
export const dynamic = "force-dynamic";

type MatchRow = { id: string; user_a: string; user_b: string; created_at: string };
type MessageRow = { id: string; match_id: string; sender_id: string; content: string; created_at: string };
type MatchProfile = { id: string; display_name: string | null; department: string | null; academic_year: string | null; date_of_birth: string | null; profile_photos: Array<{ storage_path: string; display_order: number; is_primary: boolean }> | null };
type SuperChatRequest = { id: string; sender_id: string; content: string; created_at: string; display_name: string; department: string; academic_year: string; profile_photos: { storage_path: string; is_primary: boolean; display_order: number }[] };
type SocialConnection = { id: string; requester_id: string; target_id: string; status: string; person: { id: string; display_name: string | null; verification_status: string | null; area_verification_status: string | null } | null };

function formatTimestamp(iso?: string | null) { if (!iso) return ""; const date = new Date(iso); const diff = Math.floor((Date.now() - date.getTime()) / 60000); if (diff < 1) return "Just now"; if (diff < 60) return `${diff}m`; const hours = Math.floor(diff / 60); if (hours < 24) return `${hours}h`; const days = Math.floor(hours / 24); if (days === 1) return "Yesterday"; if (days < 7) return date.toLocaleDateString([], { weekday: "short" }); return date.toLocaleDateString([], { month: "short", day: "numeric" }); }

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (section === "social") return <SocialSection userId={user.id} />;

  const { data: rawMatches, error: matchesError } = await supabase.from("matches").select("id,user_a,user_b,created_at").or(`user_a.eq.${user.id},user_b.eq.${user.id}`).order("created_at", { ascending: false });
  const { data: requestRows } = await supabase.rpc("get_superchat_requests");
  const requests = (requestRows ?? []) as SuperChatRequest[];
  if (matchesError) return <div className="mx-auto max-w-lg px-4 py-4 font-sans"><Header section="datebu" /><EmptyState icon={<HeartHandshake className="h-6 w-6 text-emerald-600" />} title="Couldn&apos;t load conversations" description="Please try again in a moment." /></div>;

  const matches = (rawMatches ?? []) as MatchRow[];
  const matchIds = matches.map((m) => m.id);
  const matchedUserIds = Array.from(new Set(matches.map((m) => m.user_a === user.id ? m.user_b : m.user_a)));
  const [messagesRes, profilesRes] = await Promise.all([
    matchIds.length ? supabase.from("messages").select("id,match_id,sender_id,content,created_at").in("match_id", matchIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    matchedUserIds.length ? supabase.rpc("get_match_profiles", { p_user_ids: matchedUserIds }) : Promise.resolve({ data: [], error: null }),
  ]);
  const messages = (messagesRes.data ?? []) as MessageRow[];
  const profiles = (profilesRes.data ?? []) as MatchProfile[];
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const latest = new Map<string, MessageRow>();
  for (const message of messages) if (!latest.has(message.match_id)) latest.set(message.match_id, message);
  const newMatches: { matchId: string; profile: MatchProfile; photoUrl: string | null }[] = [];
  const active: { match: MatchRow; profile: MatchProfile; photoUrl: string | null; latestMessage: MessageRow }[] = [];
  for (const match of matches) {
    const other = match.user_a === user.id ? match.user_b : match.user_a;
    const profile = profileMap.get(other); if (!profile) continue;
    const photos = [...(profile.profile_photos ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order);
    const photoUrl = getProfilePhotoUrl(photos[0]?.storage_path, 160);
    const latestMessage = latest.get(match.id);
    if (latestMessage) active.push({ match, profile, photoUrl, latestMessage }); else newMatches.push({ matchId: match.id, profile, photoUrl });
  }
  active.sort((a, b) => new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime());

  return <div className="mx-auto w-full max-w-lg px-4 py-4 font-sans pb-24"><Header section="datebu" />
    {requests.length > 0 && <section className="mb-5 space-y-2.5"><div className="px-1 text-xs font-black uppercase tracking-wider text-violet-700">Message requests ({requests.length})</div><div className="space-y-2">{requests.map((r) => <SuperChatRequestCard key={r.id} requestId={r.id} senderName={r.display_name} content={r.content} />)}</div></section>}
    {newMatches.length > 0 && <section className="mb-6 space-y-2.5"><div className="flex items-center gap-1.5 px-1"><Flame className="h-4 w-4 text-emerald-600" /><h2 className="text-xs font-black uppercase tracking-wider text-zinc-600">New Matches ({newMatches.length})</h2></div><div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">{newMatches.map((m) => <Link key={m.matchId} href={`${routes.messages}/${m.matchId}`} className="group flex w-20 shrink-0 flex-col items-center gap-1.5"><div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-emerald-500/80 p-0.5">{m.photoUrl ? <Image src={m.photoUrl} alt={m.profile.display_name ?? "Student"} fill className="rounded-[14px] object-cover" sizes="64px" /> : <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-100 text-base font-black text-zinc-700">{m.profile.display_name?.charAt(0)}</div>}</div><span className="w-full truncate text-center text-xs font-bold text-zinc-800">{m.profile.display_name?.split(" ")[0]}</span></Link>)}</div></section>}
    {active.length === 0 && newMatches.length === 0 && requests.length === 0 ? <EmptyState icon={<HeartHandshake className="h-6 w-6 text-emerald-600" />} title="No DateBu conversations" description="Dating matches and chats will show up here."><Link href={routes.discover}><Button size="sm" leftIcon={<Compass className="h-3.5 w-3.5" />}>Start Exploring</Button></Link></EmptyState> : active.length > 0 && <section className="space-y-2"><div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-600">DateBu chats</div><div className="space-y-1.5">{active.map((c) => <ConversationRow key={c.match.id} matchId={c.match.id} profileId={c.profile.id} displayName={c.profile.display_name} photoUrl={c.photoUrl} latestContent={c.latestMessage.content} timestamp={c.latestMessage.created_at} sent={c.latestMessage.sender_id === user.id} formatTimestamp={formatTimestamp} />)}</div></section>}
  </div>;
}

async function SocialSection({ userId }: { userId: string }) {
  const admin = createAdminClient();
  const { data: rows } = await admin.from("extrovert_connections").select("id,requester_id,target_id,status").or(`requester_id.eq.${userId},target_id.eq.${userId}`).eq("status", "accepted").order("updated_at", { ascending: false });
  const ids = [...new Set((rows ?? []).map((row) => row.requester_id === userId ? row.target_id : row.requester_id))];
  const { data: profiles } = ids.length ? await admin.from("extrovert_profiles").select("id,display_name,verification_status,area_verification_status").in("id", ids) : { data: [] as { id: string; display_name: string | null; verification_status: string | null; area_verification_status: string | null }[] };
  const map = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const connections = (rows ?? []).map((row) => ({ ...row, person: map.get(row.requester_id === userId ? row.target_id : row.requester_id) ?? null })) as SocialConnection[];

  return <div className="mx-auto w-full max-w-lg px-4 py-4 font-sans pb-24"><Header section="social" />
    <div className="mb-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-3"><p className="text-xs font-bold text-zinc-800">Social chats from Extrovert</p><p className="mt-1 text-[11px] leading-5 text-zinc-500">Friend and social conversations live here. Dating matches stay in DateBu.</p></div>
    {connections.length === 0 ? <EmptyState icon={<Users className="h-6 w-6 text-zinc-600" />} title="No social chats yet" description="Accept an Extrovert connection and its chat will appear here." /> : <section className="space-y-2">{connections.map((connection) => <Link key={connection.id} href={`/app/messages/social/${connection.id}`} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 active:scale-[.99]"><div className="grid size-11 shrink-0 place-items-center rounded-full bg-zinc-100 font-bold text-zinc-700">{connection.person?.display_name?.slice(0, 1).toUpperCase() || "?"}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-zinc-900">{connection.person?.display_name || "Connection"}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500">{connection.person?.verification_status === "verified" && <ShieldCheck className="h-3 w-3 text-emerald-600" />}Extrovert connection</p></div><span className="text-xs font-semibold text-zinc-500">Chat →</span></Link>)}</section>}
  </div>;
}

function Header({ section }: { section: "datebu" | "social" }) {
  return <><div className="mb-3 flex items-center justify-between"><div className="space-y-0.5"><div className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-emerald-600" /><h1 className="text-xl font-black tracking-tight text-zinc-950">Chats</h1></div><p className="text-xs text-zinc-500">DateBu and social conversations</p></div><Link href={routes.discover}><Button size="sm" variant="outline" leftIcon={<Compass className="h-3.5 w-3.5" />}>Explore</Button></Link></div><div className="mb-5 grid grid-cols-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1"><Link href={routes.messages} className={`rounded-xl px-3 py-2 text-center text-xs font-bold ${section === "datebu" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500"}`}>DateBu</Link><Link href={`${routes.messages}?section=social`} className={`rounded-xl px-3 py-2 text-center text-xs font-bold ${section === "social" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500"}`}>Social</Link></div></>;
}
