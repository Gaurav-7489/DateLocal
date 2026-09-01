"use client";

import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import { Heart, X, ShieldCheck, Sparkles, MessageCircle, MoreVertical, Flag, UserX, RotateCcw, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, UserRound, ArrowRight, Loader2, Users, Star } from "lucide-react";
import { likeProfile, passProfile, rewindLastPass, resetPassedProfiles, blockUser, reportUser, superLikeProfile } from "./actions";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/utils";
import SuperChatComposer from "@/components/payments/superchat-composer";

type Interest={id:string;name:string};
type ProfileInterest={interests:Interest|Interest[]|null};
type ProfilePhoto={storage_path:string;display_order:number;is_primary:boolean;url?:string|null};
export type DiscoverProfile={id:string;display_name:string|null;date_of_birth:string|null;gender:string|null;department:string|null;academic_year:string|null;bio:string|null;campus_residency?:string|null;relationship_goal?:string|null;zodiac?:string|null;prompt_question?:string|null;prompt_answer?:string|null;profile_photos:ProfilePhoto[]|null;profile_interests:ProfileInterest[]|null;profile_photo_url:string|null};

type Props={profiles:DiscoverProfile[];isPro?:boolean};

export default function DiscoverClient({profiles,isPro=false}:Props){
 const router=useRouter();
 const [deck,setDeck]=useState(profiles);
 const [loading,setLoading]=useState(false);
 const [reviewingPassed,setReviewingPassed]=useState(false);
 const [toast,setToast]=useState<string|null>(null);
 const [matchModal,setMatchModal]=useState<{profile:DiscoverProfile;matchId?:string}|null>(null);
 const [safety,setSafety]=useState(false);
 const [reportProfile,setReportProfile]=useState<DiscoverProfile|null>(null);
 const [reportReason,setReportReason]=useState("Inappropriate photo or content");
 const [reportDetails,setReportDetails]=useState("");
 const [reporting,setReporting]=useState(false);
 const [superChatProfile,setSuperChatProfile]=useState<DiscoverProfile|null>(null);

 useEffect(()=>{setDeck(profiles);setReviewingPassed(false)},[profiles]);

 // Keep the next two photos warm without eagerly decoding the entire deck.
 useEffect(()=>{
  for(const p of deck.slice(1,3)){
   const url=p.profile_photos?.[0]?.url??p.profile_photo_url;
   if(url){const img=new window.Image();img.decoding="async";img.src=url;}
  }
 },[deck]);

 function showToast(message:string){setToast(message);window.setTimeout(()=>setToast(null),2800);}

 async function like(id:string){
  if(loading)return;
  const target=deck.find(p=>p.id===id);if(!target)return;
  setLoading(true);setDeck(d=>d.filter(p=>p.id!==id));
  try{const r=await likeProfile(id);if(r.error){showToast(r.error);setDeck(d=>[target,...d]);return;}if(r.matched)setMatchModal({profile:target,matchId:r.matchId});}
  catch{showToast("Something went wrong. Please try again.");setDeck(d=>[target,...d]);}
  finally{setLoading(false);}
 }

 async function superLike(id:string){
  if(loading)return;
  const target=deck.find(p=>p.id===id);if(!target)return;
  setLoading(true);setDeck(d=>d.filter(p=>p.id!==id));
  try{const r=await superLikeProfile(id);if(r.error){showToast(r.error);setDeck(d=>[target,...d]);return;}showToast(`Super Like sent to ${target.display_name??"this student"}.`);}
  catch{showToast("Couldn't send Super Like. Please try again.");setDeck(d=>[target,...d]);}
  finally{setLoading(false);}
 }

 async function pass(id:string){
  if(loading)return;
  const target=deck.find(p=>p.id===id);if(!target)return;
  setLoading(true);setDeck(d=>d.filter(p=>p.id!==id));
  try{const r=await passProfile(id);if(r.error){showToast(r.error);setDeck(d=>[target,...d]);}}
  catch{showToast("Something went wrong. Please try again.");setDeck(d=>[target,...d]);}
  finally{setLoading(false);}
 }

 async function rewind(){if(!isPro)return;setLoading(true);try{const r=await rewindLastPass();if(r.error)showToast(r.error);else router.refresh();}finally{setLoading(false);}}

 async function reviewPassed(){
  if(reviewingPassed)return;
  setReviewingPassed(true);
  try{
   const r=await resetPassedProfiles();
   if(r.error){showToast(r.error);setReviewingPassed(false);return;}
   if(!r.count){showToast("No passed profiles to review yet.");setReviewingPassed(false);return;}
   router.refresh();
  }catch{showToast("Couldn't bring those profiles back. Please try again.");setReviewingPassed(false);}
 }

 async function block(profile:DiscoverProfile){setSafety(false);if(!confirm(`Are you sure you want to block ${profile.display_name}? You will no longer see each other.`))return;const r=await blockUser(profile.id);if(r.error){showToast(r.error);return;}setDeck(d=>d.filter(p=>p.id!==profile.id));showToast(`${profile.display_name} has been blocked.`);}

 async function report(e:React.FormEvent){e.preventDefault();if(!reportProfile)return;setReporting(true);const r=await reportUser(reportProfile.id,reportReason,reportDetails);setReporting(false);if(r.error){showToast(r.error);return;}setDeck(d=>d.filter(p=>p.id!==reportProfile.id));setReportProfile(null);setReportDetails("");showToast("Report submitted. This profile was removed from your feed.");}

 const current=deck[0];

 if(!current&&!matchModal)return <div className="relative mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-md items-center justify-center overflow-hidden px-4 pb-24 pt-8 font-sans"><div className="pointer-events-none absolute left-1/2 top-8 h-52 w-52 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl"/><motion.section initial={{opacity:0,y:14,scale:.985}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.22}} className="relative w-full overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-[0_18px_55px_-30px_rgba(15,23,42,.35)]"><div className="flex items-center justify-between"><div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700"><Sparkles className="h-3 w-3"/>Discover</div><div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"><Users className="h-3.5 w-3.5"/></div></div><div className="mt-7 text-center"><div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-emerald-600 shadow-sm"><div className="absolute inset-2 rounded-[1.15rem] border border-emerald-100"/><Sparkles className="relative h-8 w-8"/></div><p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">You&apos;re up to date</p><h2 className="mt-1.5 text-2xl font-black tracking-tight text-foreground">That&apos;s everyone for now.</h2><p className="mx-auto mt-3 max-w-[285px] text-xs leading-5 text-muted-foreground">You&apos;ve gone through everyone currently available on DateBu. New students will appear here as they join.</p></div><div className="mt-6 rounded-2xl border border-border/70 bg-muted/25 p-3.5"><div className="flex items-start gap-3"><div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-background text-emerald-600 shadow-sm"><Heart className="h-4 w-4"/></div><div><p className="text-[11px] font-black text-foreground">Want another look?</p><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">Bring back profiles you passed and review them again.</p></div></div></div><div className="mt-4 grid grid-cols-1 gap-2.5"><Button type="button" onClick={()=>void reviewPassed()} disabled={reviewingPassed} className="group h-12 w-full justify-between rounded-2xl bg-zinc-950 px-4 text-xs font-black text-white shadow-lg shadow-zinc-950/10 transition-all hover:-translate-y-0.5 hover:bg-zinc-900 active:translate-y-0 disabled:cursor-wait disabled:opacity-80"><span className="flex items-center gap-2.5">{reviewingPassed?<Loader2 className="h-4 w-4 animate-spin"/>:<RotateCcw className="h-4 w-4"/>}{reviewingPassed?"Bringing profiles back…":"Review passed profiles"}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"/></Button><Link href={routes.profileSetup} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background text-xs font-black text-foreground transition-all hover:bg-muted active:scale-[.99]"><SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground"/>Edit discovery preferences</Link></div><p className="mt-5 text-center text-[9px] font-semibold text-muted-foreground/75">DateBu shows everyone available to you — preferences help shape the experience, not hide people forever.</p></motion.section></div>;

 return <div className="relative mx-auto flex h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-between px-3 pt-1 pb-20 md:pb-4 font-sans overflow-hidden select-none">
  <AnimatePresence>{toast&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="fixed left-1/2 top-16 z-[110] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-xs font-bold text-emerald-800 shadow-xl">{toast}</motion.div>}</AnimatePresence>
  <div className="relative flex-1 min-h-0 w-full flex items-center justify-center my-auto"><div className="relative h-full w-full max-h-[520px] aspect-[4/5] sm:aspect-auto">{deck.slice(0,2).map((profile,index)=><DiscoverCard key={profile.id} profile={profile} isTop={index===0} onSwipe={dir=>dir==="right"?void like(profile.id):void pass(profile.id)} onOpenSafety={()=>setSafety(true)} onSuperChat={()=>setSuperChatProfile(profile)}/>)}</div></div>
  {current&&<div className="shrink-0 flex w-full max-w-[360px] mx-auto items-stretch justify-center gap-1.5 pt-2 pb-1 z-30">
   <button type="button" onClick={()=>void rewind()} disabled={!isPro||loading} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-border bg-white px-1 py-1.5 text-zinc-600 shadow-sm transition-transform active:scale-95 disabled:opacity-35" aria-label={isPro?"Undo last pass":"Undo is Extrovert"} title={isPro?"Undo last pass":"Undo is an Extrovert feature"}><RotateCcw className="h-4 w-4"/><span className="text-[8px] font-bold leading-none">Undo</span></button>
   <button type="button" disabled={loading} onClick={()=>void like(current.id)} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl bg-emerald-600 px-1 py-1.5 text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-95 disabled:opacity-50" aria-label="Like profile" title="Like"><Heart className="h-4 w-4 fill-current"/><span className="text-[8px] font-black leading-none">Like</span></button>
   <button type="button" disabled={loading} onClick={()=>void superLike(current.id)} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-orange-200 bg-white px-1 py-1.5 text-orange-600 shadow-sm transition-transform active:scale-95 disabled:opacity-50" aria-label="Super Like" title="Super Like"><Star className="h-4 w-4 fill-current"/><span className="text-[8px] font-black leading-none">Super Like</span></button>
   <button type="button" disabled={loading} onClick={()=>setSuperChatProfile(current)} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-violet-200 bg-white px-1 py-1.5 text-violet-600 shadow-sm transition-transform active:scale-95 disabled:opacity-50" aria-label="SuperChat" title="SuperChat"><MessageCircle className="h-4 w-4"/><span className="text-[8px] font-black leading-none">SuperChat</span></button>
   <Link href={`${routes.profileView}/${current.id}`} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-border bg-white px-1 py-1.5 text-foreground shadow-sm transition-transform active:scale-95" aria-label="View profile" title="View profile"><UserRound className="h-4 w-4"/><span className="text-[8px] font-bold leading-none">Profile</span></Link>
  </div>}
  <AnimatePresence>{safety&&current&&<div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-xs"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-3"><div className="flex items-center justify-between pb-2 border-b border-border"><span className="text-xs font-bold text-foreground">Safety Controls</span><button onClick={()=>setSafety(false)} className="rounded-full p-1 text-muted-foreground"><X className="h-4 w-4"/></button></div><Link href={`${routes.profileView}/${current.id}`} onClick={()=>setSafety(false)} className="flex w-full items-center gap-2.5 rounded-2xl p-3 text-xs font-semibold text-foreground bg-muted/50 border border-border"><UserRound className="h-4 w-4"/>View full profile</Link><button type="button" onClick={()=>{setSafety(false);setReportProfile(current)}} className="flex w-full items-center gap-2.5 rounded-2xl p-3 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200"><Flag className="h-4 w-4"/>Report profile</button><button type="button" onClick={()=>void block(current)} className="flex w-full items-center gap-2.5 rounded-2xl p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200"><UserX className="h-4 w-4"/>Block user</button><button type="button" onClick={()=>setSafety(false)} className="w-full rounded-2xl p-2.5 text-xs font-semibold text-muted-foreground bg-muted border border-border">Cancel</button></motion.div></div>}</AnimatePresence>
  <AnimatePresence>{reportProfile&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><motion.div initial={{scale:.96,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.96,opacity:0}} className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-zinc-950"><Flag className="mr-1 inline h-4 w-4 text-rose-600"/>Report {reportProfile.display_name}</h3><button onClick={()=>setReportProfile(null)} className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"><X className="h-4 w-4"/></button></div><form onSubmit={report} className="space-y-3"><select value={reportReason} onChange={e=>setReportReason(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900"><option>Inappropriate photo or content</option><option>Harassment or abusive behavior</option><option>Fake or impersonated profile</option><option>Spam or commercial advertising</option><option>Underage user</option><option>Other safety concern</option></select><textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} rows={4} maxLength={500} placeholder="Additional details (optional)" className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 outline-none focus:border-emerald-500"/><div className="flex gap-2"><Button type="button" variant="secondary" size="sm" onClick={()=>setReportProfile(null)} className="flex-1">Cancel</Button><Button type="submit" variant="primary" size="sm" disabled={reporting} className="flex-1 bg-rose-600 text-white">{reporting?"Submitting…":"Report & Block"}</Button></div></form></motion.div></div>}</AnimatePresence>
  <AnimatePresence>{matchModal&&<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"><motion.div initial={{scale:.85,opacity:0,y:20}} animate={{scale:1,y:0,opacity:1}} className="relative w-full max-w-sm rounded-3xl bg-card border border-border p-7 text-center shadow-2xl space-y-4"><button onClick={()=>setMatchModal(null)} className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground bg-muted"><X className="h-4 w-4"/></button><div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5"/>Mutual Connection!</div><h2 className="text-2xl font-black text-foreground">It&apos;s a Match!</h2><p className="text-xs text-muted-foreground">You and <span className="text-emerald-600 font-bold">{matchModal.profile.display_name}</span> liked each other.</p><Link href={matchModal.matchId?`${routes.messages}/${matchModal.matchId}`:routes.matches} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-emerald-600 text-white text-xs font-bold"><MessageCircle className="h-4 w-4"/>Send First Message</Link><Link href={`${routes.profileView}/${matchModal.profile.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-border text-xs font-bold"><UserRound className="h-4 w-4"/>View Profile</Link><button onClick={()=>setMatchModal(null)} className="w-full py-2 text-xs font-semibold text-muted-foreground">Keep Swiping</button></motion.div></div>}</AnimatePresence>
  {superChatProfile&&<SuperChatComposer targetUserId={superChatProfile.id} targetName={superChatProfile.display_name??"this student"} onClose={()=>setSuperChatProfile(null)} onComplete={()=>showToast("SuperChat sent.")}/>}</div>;
}

const DiscoverCard=memo(function DiscoverCard({profile,isTop,onSwipe,onOpenSafety,onSuperChat}:{profile:DiscoverProfile;isTop:boolean;onSwipe:(dir:"left"|"right")=>void;onOpenSafety:()=>void;onSuperChat:()=>void}){
 const x=useMotionValue(0);
 const rotate=useTransform(x,[-240,240],[-15,15]);
 const likeOpacity=useTransform(x,[35,100],[0,1]);
 const passOpacity=useTransform(x,[-100,-35],[1,0]);
 const [photoIndex,setPhotoIndex]=useState(0);
 const photos=[...(profile.profile_photos??[])].filter(p=>p.url).sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.display_order-b.display_order).slice(0,6);
 const age=calculateAge(profile.date_of_birth);
 const interests=profile.profile_interests?.flatMap(item=>item.interests?(Array.isArray(item.interests)?item.interests:[item.interests]):[])??[];
 const currentPhoto=photos[photoIndex]?.url??profile.profile_photo_url;
 const dragEnd=(_e:MouseEvent|TouchEvent|PointerEvent,info:PanInfo)=>{if(Math.abs(info.offset.x)>=85)onSwipe(info.offset.x>0?"right":"left")};
 return <motion.div style={{x:isTop?x:0,rotate:isTop?rotate:0,transform:"translate3d(0,0,0)",WebkitTransform:"translate3d(0,0,0)",backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",willChange:"transform"}} animate={{scale:isTop?1:.96,y:isTop?0:8,opacity:isTop?1:.65}} transition={{type:"spring",stiffness:400,damping:32}} drag={isTop?"x":false} dragConstraints={{left:0,right:0}} dragElastic={.65} onDragEnd={dragEnd} className={`absolute inset-0 overflow-hidden rounded-[2rem] select-none ${isTop?"z-20 cursor-grab active:cursor-grabbing touch-pan-y":"z-10 pointer-events-none"}`}>
  <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-zinc-950 shadow-2xl">
   {!isTop?<div className="absolute inset-0 border border-zinc-800 bg-zinc-900"/>:<>
    <div className="absolute inset-0">{currentPhoto?<Image src={currentPhoto} alt={profile.display_name??"Student"} fill priority={isTop} decoding="async" className="object-cover" sizes="(max-width:640px) 100vw,420px"/>:<div className="flex h-full w-full items-center justify-center bg-zinc-900 text-5xl">👤</div>}<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95 pointer-events-none"/></div>
    {photos.length>1&&<div className="absolute top-3 left-4 right-4 z-30 flex gap-1.5 pointer-events-none">{photos.map((photo,index)=><div key={`${photo.storage_path}-${index}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"><div className={`h-full rounded-full ${index<=photoIndex?"bg-white":"bg-transparent"}`}/></div>)}</div>}
    <motion.div style={{opacity:likeOpacity}} className="absolute top-14 left-5 z-40 rounded-2xl border-2 border-emerald-400 bg-emerald-500/95 px-4 py-1.5 text-xl font-black uppercase tracking-wider text-white shadow-xl pointer-events-none">LIKE</motion.div>
    <motion.div style={{opacity:passOpacity}} className="absolute top-14 right-5 z-40 rounded-2xl border-2 border-orange-400 bg-orange-500/95 px-4 py-1.5 text-xl font-black uppercase tracking-wider text-white shadow-xl pointer-events-none">PASS</motion.div>
    {photos.length>1&&<><button type="button" aria-label="Previous photo" onClick={e=>{e.stopPropagation();setPhotoIndex(i=>Math.max(0,i-1))}} disabled={photoIndex===0} className="absolute left-0 top-14 bottom-40 z-20 w-1/2"/><button type="button" aria-label="Next photo" onClick={e=>{e.stopPropagation();setPhotoIndex(i=>Math.min(photos.length-1,i+1))}} disabled={photoIndex===photos.length-1} className="absolute right-0 top-14 bottom-40 z-20 w-1/2"/><div className="pointer-events-none absolute left-2.5 top-1/2 z-30 -translate-y-1/2"><ChevronLeft className={`h-4 w-4 text-white/70 ${photoIndex===0?"opacity-0":""}`}/></div><div className="pointer-events-none absolute right-2.5 top-1/2 z-30 -translate-y-1/2"><ChevronRight className={`h-4 w-4 text-white/70 ${photoIndex===photos.length-1?"opacity-0":""}`}/></div></>}
    <div className="absolute top-6 right-3.5 z-40 flex items-center gap-1.5"><div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-white/15 pointer-events-none"><ShieldCheck className="h-3 w-3"/>Verified</div><button type="button" onClick={e=>{e.stopPropagation();onOpenSafety()}} className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white border border-white/15" aria-label="Safety controls" title="Safety controls"><MoreVertical className="h-3.5 w-3.5"/></button></div>
    <div className="absolute bottom-3 left-4 right-4 z-30 space-y-1.5 pointer-events-none">
      <Link href={`${routes.profileView}/${profile.id}`} className="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-xl bg-black/35 px-2 py-1 text-white backdrop-blur-sm"><h2 className="text-2xl font-black tracking-tight">{profile.display_name||"DateBu Student"}{age!==null&&<span className="font-light text-xl opacity-90">, {age}</span>}</h2><UserRound className="h-4 w-4 shrink-0"/></Link>
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-300"><span>{profile.academic_year}</span>{profile.gender&&<span>• {profile.gender}</span>}{profile.campus_residency&&<span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5"/>{profile.campus_residency}</span>}</div>
      {profile.prompt_question&&profile.prompt_answer?<div className="rounded-xl bg-black/50 p-2 border border-white/10 backdrop-blur-md"><span className="text-[10px] font-bold text-emerald-400 block mb-0.5">{profile.prompt_question}</span><p className="text-xs text-white/95 line-clamp-2">&ldquo;{profile.prompt_answer}&rdquo;</p></div>:profile.bio?<p className="text-xs text-white/90 line-clamp-2">&ldquo;{profile.bio}&rdquo;</p>:null}
      <div className="flex flex-wrap gap-1">{profile.relationship_goal&&<span className="rounded-full bg-rose-500/80 px-2.5 py-0.5 text-[9px] font-bold text-white">{profile.relationship_goal}</span>}{profile.zodiac&&<span className="rounded-full bg-purple-500/80 px-2.5 py-0.5 text-[9px] font-bold text-white">{profile.zodiac}</span>}{interests.slice(0,3).map(i=><span key={i.id} className="rounded-full bg-white/20 border border-white/15 px-2 py-0.5 text-[9px] font-medium text-white">{i.name}</span>)}</div>
      <div className="pointer-events-auto flex items-center justify-between gap-2 border-t border-white/15 pt-1.5"><span className="text-[9px] font-semibold text-white/60">← Pass</span><button type="button" onClick={e=>{e.stopPropagation();onSuperChat()}} className="rounded-full bg-violet-500/90 px-3 py-1.5 text-[9px] font-black text-white shadow-md" aria-label="Send SuperChat">SuperChat</button><span className="text-[9px] font-semibold text-white/60">Like →</span></div>
    </div>
   </>}
  </div>
 </motion.div>;
});
