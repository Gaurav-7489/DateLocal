import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Users, MapPin, ShieldCheck, Heart, MessageCircle, Sparkles, UserPlus, Inbox } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { Button } from "@/components/ui/button";
import { ConnectButton, AcceptButton } from "./social-actions";

export const metadata: Metadata = { title: "Social | Extrovert" };
export const dynamic = "force-dynamic";

type SocialProfile = { id:string; display_name:string|null; bio:string|null; interests:string[]|null; area_id:string|null; verification_status:string|null; area_verification_status:string|null; profile_photo_path:string|null };
type Connection = { id:string; requester_id:string; target_id:string; status:string; conversation_id?:string|null };

export default async function SocialPage() {
  const supabase = await createServerSupabaseClient();
  const { data:{user} } = await supabase.auth.getUser();
  if (!user) return null;
  const { data:me } = await supabase.from("extrovert_profiles").select("display_name,area_id,verification_status,area_verification_status").eq("id",user.id).maybeSingle();
  const areaId = me?.area_id ?? null;
  const [{data:area},{data:people},{data:connections}] = await Promise.all([
    areaId ? supabase.from("extrovert_areas").select("name").eq("id",areaId).maybeSingle() : Promise.resolve({data:null}),
    areaId ? supabase.from("extrovert_profiles").select("id,display_name,bio,interests,area_id,verification_status,area_verification_status,profile_photo_path").eq("area_id",areaId).neq("id",user.id).eq("trust_state","active").order("verification_status",{ascending:false}).order("created_at",{ascending:false}).limit(12) : Promise.resolve({data:[]}),
    supabase.from("extrovert_connections").select("id,requester_id,target_id,status") .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
  ]);
  const allConnections=(connections??[]) as Connection[];
  const connectionMap=new Map<string,Connection>();
  for(const c of allConnections){const other=c.requester_id===user.id?c.target_id:c.requester_id;connectionMap.set(other,c);}
  const incoming=allConnections.filter(c=>c.target_id===user.id&&c.status==="pending");
  const accepted=allConnections.filter(c=>c.status==="accepted");
  const conversationIds=accepted.map(c=>c.id);
  const {data:conversationRows}=conversationIds.length?await supabase.from("extrovert_conversations").select("id,connection_id").in("connection_id",conversationIds):{data:[]};
  const conversationMap=new Map((conversationRows??[]).map((c:{id:string;connection_id:string})=>[c.connection_id,c.id]));
  const profiles=(people??[]) as SocialProfile[];
  const areaName=area?.name??"Your area";
  const verifiedIdentity=me?.verification_status==="verified";
  const verifiedArea=me?.area_verification_status==="verified";
  return <main className="mx-auto w-full max-w-3xl px-4 py-4 pb-28 font-sans">
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-emerald-600"><Sparkles className="h-3.5 w-3.5"/>Extrovert Social</div><h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">Meet people, your way.</h1><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">Find people around your selected area, build connections and chat after they accept. Dating stays optional.</p></div><Link href={routes.discover} className="shrink-0"><Button size="sm" leftIcon={<Heart className="h-3.5 w-3.5"/>}>Date</Button></Link></div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"><div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"><MapPin className="h-4 w-4 text-emerald-600"/><p className="mt-2 text-xs font-black">{areaName}</p><p className="text-[10px] text-zinc-500">Selected area</p></div><div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"><ShieldCheck className="h-4 w-4 text-emerald-600"/><p className="mt-2 text-xs font-black">{verifiedIdentity?"Identity verified":"Identity optional"}</p><p className="text-[10px] text-zinc-500">Trust badge</p></div><div className="hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:block"><Users className="h-4 w-4 text-emerald-600"/><p className="mt-2 text-xs font-black">{profiles.length} nearby</p><p className="text-[10px] text-zinc-500">Private area matching</p></div></div>
      {!verifiedArea&&<p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800">Area verification is optional. Your exact location is never shown to other people.</p>}
    </section>
    {incoming.length>0&&<section className="mt-5 rounded-[2rem] border border-emerald-200 bg-emerald-50/60 p-4"><div className="mb-3 flex items-center gap-2"><Inbox className="h-4 w-4 text-emerald-700"/><h2 className="text-sm font-black">Connection requests ({incoming.length})</h2></div><div className="space-y-2">{incoming.map(c=><div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-3"><div className="min-w-0"><p className="truncate text-xs font-black">Someone in {areaName} wants to connect</p><p className="text-[9px] text-zinc-500">Accept to unlock Extrovert chat.</p></div><AcceptButton connectionId={c.id}/></div>)}</div></section>}
    <section className="mt-5"><div className="mb-3 flex items-end justify-between px-1"><div><p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Social discovery</p><h2 className="text-lg font-black tracking-tight">People around {areaName}</h2></div><span className="text-[10px] font-bold text-zinc-400">{profiles.length} shown</span></div>
      {profiles.length===0?<div className="rounded-[2rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center"><Users className="mx-auto h-7 w-7 text-zinc-400"/><h3 className="mt-3 text-sm font-black">No one nearby yet</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-500">New people will appear as they join your selected area.</p></div>:<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{profiles.map(profile=>{const c=connectionMap.get(profile.id);const photo=getProfilePhotoUrl(profile.profile_photo_path,320);const conversationId=c?.status==="accepted"?conversationMap.get(c.id):null;return <article key={profile.id} className="flex gap-3 rounded-[1.5rem] border border-zinc-200 bg-white p-3 shadow-sm"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">{photo?<Image src={photo} alt={profile.display_name??"Person"} fill sizes="80px" className="object-cover"/>:<div className="flex h-full items-center justify-center text-xl font-black text-zinc-500">{profile.display_name?.charAt(0)??"?"}</div>}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h3 className="truncate text-sm font-black text-zinc-900">{profile.display_name??"Extrovert member"}</h3>{profile.verification_status==="verified"&&<ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600"/>}</div><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-zinc-500">{profile.bio||"Open to meeting new people."}</p>{profile.interests?.length&&<p className="mt-1 truncate text-[9px] font-semibold text-emerald-700">{profile.interests.slice(0,3).join(" · ")}</p>}<div className="mt-2 flex items-center gap-1.5">{c?.status==="accepted"&&conversationId?<Link href={`/app/messages/social/${conversationId}`}><Button size="sm" variant="outline" leftIcon={<MessageCircle className="h-3 w-3"/>}>Chat</Button></Link>:c?.status==="accepted"?<span className="rounded-lg bg-zinc-100 px-2 py-1 text-[9px] font-bold text-zinc-500">Chat ready</span>:c?.status==="pending"?<span className="rounded-lg bg-zinc-100 px-2 py-1 text-[9px] font-bold text-zinc-500">Request sent</span>:<ConnectButton targetId={profile.id}/>}</div></div></article>})}</div>}
    </section>
    <section className="mt-5 rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-4"><div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-emerald-600"/><h2 className="text-sm font-black">One Extrovert chat space</h2></div><p className="mt-1 text-[10px] leading-4 text-zinc-500">Accepted social connections and dating matches use the same chat area. No second account or app handoff.</p><div className="mt-3 flex gap-2"><Link href={routes.messages}><Button size="sm" variant="outline">Open chats</Button></Link><Link href={routes.profile}><Button size="sm" variant="outline">Edit profile</Button></Link></div></section>
  </main>;
}
