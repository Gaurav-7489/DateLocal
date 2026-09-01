import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { isUuid } from "@/lib/validation";
import ChatClient from "./chat-client";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Chat | DateBu" };
export const dynamic = "force-dynamic";
type Props={params:Promise<{matchId:string}>};
type MatchProfile={id:string;display_name:string|null;department:string|null;academic_year:string|null;relationship_goal:string|null;campus_residency:string|null;campus_hangout:string|null;zodiac:string|null;prompt_question:string|null;prompt_answer:string|null;profile_photos:Array<{storage_path:string;display_order:number;is_primary:boolean}>};

export default async function ChatPage({params}:Props){
  const {matchId}=await params;
  if(!isUuid(matchId)) notFound();
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect(routes.login);
  const {data:match,error:matchError}=await supabase.from("matches").select("id,user_a,user_b").eq("id",matchId).or(`user_a.eq.${user.id},user_b.eq.${user.id}`).maybeSingle();
  if(matchError||!match) notFound();
  const otherUserId=match.user_a===user.id?match.user_b:match.user_a;
  const {data:blockRecord}=await supabase.from("blocks").select("id").or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`).maybeSingle();
  if(blockRecord) redirect(routes.messages);
  const {data:profileRows,error:profileError}=await supabase.rpc("get_match_profiles",{p_user_ids:[otherUserId]});
  if(profileError) notFound();
  const profile=(profileRows?.[0]??null) as MatchProfile|null;
  if(!profile) notFound();
  const {data:messages,messagesError}=await supabase.from("messages").select("id,sender_id,content,created_at").eq("match_id",matchId).order("created_at",{ascending:false}).limit(100).then(r=>({data:r.data,messagesError:r.error}));
  if(messagesError) console.error("Failed to load messages:",messagesError);
  const photos=[...(profile.profile_photos??[])].sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.display_order-b.display_order);
  const photoUrl=getProfilePhotoUrl(photos[0]?.storage_path,160);
  return <div className="mx-auto flex h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] max-w-2xl flex-col px-2 sm:px-4 font-sans overflow-hidden pb-20 md:pb-4"><div className="shrink-0 flex items-center justify-between border-b border-border/80 bg-background/80 backdrop-blur-md py-2.5 px-1 z-20"><Link href={`${routes.profileView}/${otherUserId}`} className="flex min-w-0 items-center gap-3 rounded-2xl px-1.5 py-1 active:scale-[.99]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-2xs"><ArrowLeft className="h-4 w-4"/></span><div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-emerald-500/40 bg-zinc-900 shadow-xs">{photoUrl?<Image src={photoUrl} alt={profile.display_name??"Partner"} fill priority className="object-cover" sizes="44px"/>:<div className="flex h-full w-full items-center justify-center font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 text-sm">{profile.display_name?.charAt(0)??"?"}</div>}<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"/></div><div className="min-w-0"><div className="flex items-center gap-1.5"><h1 className="truncate font-bold text-foreground text-sm tracking-tight">{profile.display_name||"DateBu Student"}</h1><span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200"><ShieldCheck className="w-2.5 h-2.5"/>Verified</span></div><p className="text-[11px] text-muted-foreground font-medium truncate max-w-[200px] sm:max-w-none">{profile.department||"Student"}{profile.academic_year?` • ${profile.academic_year}`:""}</p></div></Link></div><ChatClient matchId={matchId} currentUserId={user.id} otherUserId={otherUserId} otherProfile={profile} otherPhotoUrl={photoUrl} initialMessages={[...(messages??[])].reverse()}/></div>;
}
