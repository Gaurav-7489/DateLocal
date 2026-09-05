import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Users, MapPin, ShieldCheck, Heart, MessageCircle, Sparkles, UserPlus, Inbox, Compass } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { getProfilePhotoUrl } from "@/lib/profile-photo";
import { Button } from "@/components/ui/button";
import { ConnectButton, AcceptButton } from "./social-actions";

export const metadata: Metadata = { title: "Explore | Extrovert" };
export const dynamic = "force-dynamic";

type SocialProfile = { id:string; display_name:string|null; bio:string|null; interests:string[]|null; area_id:string|null; verification_status:string|null; area_verification_status:string|null; profile_photo_path:string|null };
type Connection = { id:string; requester_id:string; target_id:string; status:string };

export default async function SocialPage() {
  const supabase = await createServerSupabaseClient();
  const { data:{user} } = await supabase.auth.getUser();
  if (!user) return null;
  const { data:me } = await supabase.from("extrovert_profiles").select("display_name,area_id,verification_status,area_verification_status").eq("id",user.id).maybeSingle();
  const areaId = me?.area_id ?? null;
  const [{data:area},{data:people},{data:connections}] = await Promise.all([
    areaId ? supabase.from("extrovert_areas").select("name").eq("id",areaId).maybeSingle() : Promise.resolve({data:null}),
    areaId ? supabase.from("extrovert_profiles").select("id,display_name,bio,interests,area_id,verification_status,area_verification_status,profile_photo_path").eq("area_id",areaId).neq("id",user.id).neq("trust_state","banned").order("verification_status",{ascending:false}).order("created_at",{ascending:false}).limit(12) : Promise.resolve({data:[]}),
    supabase.from("extrovert_connections").select("id,requester_id,target_id,status").or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
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

  return <main className="mx-auto w-full max-w-md px-3 pb-24 pt-16 font-sans text-white md:max-w-3xl md:px-4 md:pt-4 md:text-zinc-950">
    <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-4 shadow-2xl md:border-zinc-200 md:bg-white md:shadow-sm">
      <div className="flex items-center justify-between px-1">
        <div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-sky-400 md:text-emerald-600"><Compass className="h-3.5 w-3.5"/>Explore</div><h1 className="mt-1 text-2xl font-black tracking-tight">Your social world</h1><p className="mt-1 text-xs text-white/55 md:text-zinc-500">Discover people around your area, then connect when it feels right.</p></div>
        <Link href={routes.discover}><Button size="sm" className="rounded-full bg-pink-500 text-white hover:bg-pink-600"><Heart className="mr-1.5 h-3.5 w-3.5"/>Date</Button></Link>
      </div>

      <div className="relative mt-4 h-64 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#17181d] md:border-zinc-200">
        <div className="absolute inset-0 opacity-60" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px, transparent 1px)",backgroundSize:"42px 42px"}} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(59,130,246,.18),transparent_38%)]" />
        {profiles.slice(0,10).map((profile,index)=>{
          const positions=[[18,30],[38,22],[62,30],[78,20],[28,58],[52,50],[72,62],[14,74],[46,78],[84,72]][index];
          return <Link key={profile.id} href={`${routes.profileView}/${profile.id}`} className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-2 border-white bg-zinc-800 shadow-xl transition-transform hover:scale-110" style={{left:`${positions[0]}%`,top:`${positions[1]}%`}}>{profile.profile_photo_path?<Image src={getProfilePhotoUrl(profile.profile_photo_path,96) ?? ""} alt="" fill sizes="44px" className="object-cover"/>:<span className="text-xs font-black">{profile.display_name?.charAt(0)??"?"}</span>}</Link>;
        })}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-bold backdrop-blur-xl"><MapPin className="mr-1 inline h-3 w-3"/>{areaName} · {profiles.length} nearby</div>
        <div className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold text-white/80 backdrop-blur-xl">Approximate area only</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-white/5 p-3 md:bg-zinc-50"><MapPin className="h-4 w-4 text-sky-400 md:text-emerald-600"/><p className="mt-2 text-xs font-black">{areaName}</p><p className="text-[9px] text-white/45 md:text-zinc-500">Selected area</p></div><div className="rounded-2xl bg-white/5 p-3 md:bg-zinc-50"><ShieldCheck className="h-4 w-4 text-emerald-400 md:text-emerald-600"/><p className="mt-2 text-xs font-black">{verifiedIdentity?"Verified":"Optional"}</p><p className="text-[9px] text-white/45 md:text-zinc-500">Identity</p></div><div className="rounded-2xl bg-white/5 p-3 md:bg-zinc-50"><Users className="h-4 w-4 text-sky-400 md:text-emerald-600"/><p className="mt-2 text-xs font-black">{profiles.length}</p><p className="text-[9px] text-white/45 md:text-zinc-500">Nearby</p></div></div>
    </section>

    {incoming.length>0&&<section className="mt-4 rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/10 p-4"><div className="mb-3 flex items-center gap-2"><Inbox className="h-4 w-4 text-emerald-400"/><h2 className="text-sm font-black">Friend requests ({incoming.length})</h2></div><div className="space-y-2">{incoming.map(c=><div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 p-3"><div className="min-w-0"><p className="truncate text-xs font-black">Someone in {areaName} wants to connect</p><p className="text-[9px] text-white/50">Accept to unlock social chat.</p></div><AcceptButton connectionId={c.id}/></div>)}</div></section>}

    <section className="mt-5"><div className="mb-3 flex items-end justify-between px-1"><div><p className="text-[10px] font-black uppercase tracking-wider text-sky-400 md:text-emerald-600">People nearby</p><h2 className="text-lg font-black">Meet your area</h2></div><span className="text-[10px] font-bold text-white/35 md:text-zinc-400">{profiles.length} shown</span></div>
      {profiles.length===0?<div className="rounded-[2rem] border border-dashed border-white/15 bg-zinc-950 p-8 text-center"><Users className="mx-auto h-7 w-7 text-white/30"/><h3 className="mt-3 text-sm font-black">No one nearby yet</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-white/50">New people will appear as they join your selected area.</p></div>:<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{profiles.map(profile=>{const c=connectionMap.get(profile.id);const photo=getProfilePhotoUrl(profile.profile_photo_path,320);const conversationId=c?.status==="accepted"?conversationMap.get(c.id):null;return <article key={profile.id} className="flex gap-3 rounded-[1.5rem] border border-white/10 bg-zinc-950 p-3 shadow-lg md:border-zinc-200 md:bg-white md:shadow-sm"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-900">{photo?<Image src={photo} alt={profile.display_name??"Person"} fill sizes="80px" className="object-cover"/>:<div className="flex h-full items-center justify-center text-xl font-black text-white/50">{profile.display_name?.charAt(0)??"?"}</div>}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h3 className="truncate text-sm font-black">{profile.display_name??"Extrovert member"}</h3>{profile.verification_status==="verified"&&<ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400 md:text-emerald-600"/>}</div><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/50 md:text-zinc-500">{profile.bio||"Open to meeting new people."}</p>{profile.interests?.length&&<p className="mt-1 truncate text-[9px] font-semibold text-sky-400 md:text-emerald-700">{profile.interests.slice(0,3).join(" · ")}</p>}<div className="mt-2 flex items-center gap-1.5">{c?.status==="accepted"&&conversationId?<Link href={`/app/messages/social/${conversationId}`}><Button size="sm" variant="outline" leftIcon={<MessageCircle className="h-3 w-3"/>}>Chat</Button></Link>:c?.status==="accepted"?<span className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-white/50 md:bg-zinc-100 md:text-zinc-500">Connected</span>:c?.status==="pending"?<span className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-white/50 md:bg-zinc-100 md:text-zinc-500">Request sent</span>:<ConnectButton targetId={profile.id}/>}</div></div></article>})}</div>}
    </section>

    <section className="mt-5 rounded-[1.75rem] border border-white/10 bg-zinc-950 p-4 md:border-zinc-200 md:bg-zinc-50"><div className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-sky-400 md:text-emerald-600"/><h2 className="text-sm font-black">Friends & social</h2></div><p className="mt-1 text-[10px] leading-4 text-white/50 md:text-zinc-500">Build connections without changing accounts. Your dating matches and social friends can use the same protected chat system.</p><div className="mt-3 flex gap-2"><Link href={routes.messages}><Button size="sm" variant="outline"><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>Open chats</Button></Link><Link href={routes.profile}><Button size="sm" variant="outline">Your profile</Button></Link></div></section>
  </main>;
}
