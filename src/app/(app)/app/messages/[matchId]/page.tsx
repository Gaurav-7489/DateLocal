import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { isUuid } from "@/lib/validation";
import ChatClient from "./chat-client";
import { ArrowLeft, ShieldCheck, LockKeyhole } from "lucide-react";

export const metadata: Metadata = { title: "Secure Chat | DateLocal" };
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ matchId: string }> };
type MatchProfile = {
  id: string;
  display_name: string | null;
  department: string | null;
  academic_year: string | null;
  relationship_goal: string | null;
  campus_residency: string | null;
  campus_hangout: string | null;
  zodiac: string | null;
  prompt_question: string | null;
  prompt_answer: string | null;
  profile_photos: Array<{ storage_path: string; display_order: number; is_primary: boolean }>;
};

type StoredMessage = { id:string; sender_id:string; content:string|null; ciphertext:string|null; encryption_version:number; created_at:string };

export default async function ChatPage({ params }: Props) {
  const { matchId } = await params;
  if (!isUuid(matchId)) notFound();
  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  if (!userId) redirect(routes.login);

  const { data: match, error: matchError } = await supabase.from("matches").select("id,user_a,user_b").eq("id", matchId).or(`user_a.eq.${userId},user_b.eq.${userId}`).maybeSingle();
  if (matchError || !match) notFound();
  const otherUserId = match.user_a === userId ? match.user_b : match.user_a;

  const [{ data: blockRecord }, { data: profileRows, error: profileError }, { data: messages, error: messagesError }] = await Promise.all([
    supabase.from("blocks").select("id").or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`).maybeSingle(),
    supabase.rpc("get_match_profiles", { p_user_ids: [otherUserId] }),
    supabase.from("messages").select("id,sender_id,content,ciphertext,encryption_version,created_at").eq("match_id", matchId).order("created_at", { ascending: false }).limit(100),
  ]);
  if (blockRecord) redirect(routes.messages);
  if (profileError) notFound();
  if (messagesError) console.error("Failed to load messages:", messagesError);

  const profile = (profileRows?.[0] ?? null) as MatchProfile | null;
  if (!profile) notFound();
  const photos = [...(profile.profile_photos ?? [])].sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.display_order-b.display_order);
  const photoUrl = getProfilePhotoUrl(photos[0]?.storage_path, 160);

  return <div className="mx-auto flex h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] max-w-2xl flex-col px-2 sm:px-4 font-sans overflow-hidden pb-20 md:pb-4">
    <div className="shrink-0 flex items-center justify-between border-b border-zinc-200 bg-white/95 py-2.5 px-1 z-20 backdrop-blur-md">
      <Link href={`${routes.profileView}/${otherUserId}`} className="flex min-w-0 items-center gap-3 rounded-2xl px-1.5 py-1 active:scale-[.99]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-xs"><ArrowLeft className="h-4 w-4" /></span>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-emerald-500/40 bg-zinc-900 shadow-xs">
          {photoUrl ? <Image src={photoUrl} alt={profile.display_name ?? "Partner"} fill priority className="object-cover" sizes="44px"/> : <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-sm font-bold text-white">{profile.display_name?.charAt(0)??"?"}</div>}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="min-w-0"><div className="flex items-center gap-1.5"><h1 className="truncate text-sm font-bold tracking-tight text-zinc-950">{profile.display_name||"DateLocal match"}</h1><span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700"><ShieldCheck className="h-2.5 w-2.5"/>Trusted identity</span></div><p className="max-w-[200px] truncate text-[11px] font-medium text-zinc-500 sm:max-w-none">{profile.department||"Student"}{profile.academic_year?` • ${profile.academic_year}`:""}</p></div>
      </Link>
      <div className="mr-1 hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 sm:flex"><LockKeyhole className="h-3 w-3"/>E2E encrypted</div>
    </div>
    <ChatClient matchId={matchId} currentUserId={userId} otherUserId={otherUserId} otherProfile={profile} otherPhotoUrl={photoUrl} initialMessages={[...(messages??[])].reverse() as StoredMessage[]} />
  </div>;
}
