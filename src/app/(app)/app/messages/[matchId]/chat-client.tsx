"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "../actions";
import { blockUser, reportUser } from "../../discover/actions";
import { routes } from "@/config/routes";
import { Send, MoreVertical, Flag, UserX, X, Loader2, AlertCircle, Sparkles, MapPin, Coffee, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message={id:string;sender_id:string;content:string;created_at:string};
type ProfileData={id:string;display_name:string|null;department:string|null;academic_year:string|null;relationship_goal?:string|null;campus_residency?:string|null;campus_hangout?:string|null;zodiac?:string|null;prompt_question?:string|null;prompt_answer?:string|null};
type Props={matchId:string;currentUserId:string;otherUserId:string;otherProfile:ProfileData;otherPhotoUrl:string|null;initialMessages:Message[]};

function formatMessageTime(isoString:string){return new Date(isoString).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});}
function triggerHaptic(pattern:number[]=[15]){if(typeof window!=="undefined"&&"vibrate"in navigator){try{navigator.vibrate(pattern);}catch{}}}

export default function ChatClient({matchId,currentUserId,otherUserId,otherProfile,otherPhotoUrl,initialMessages}:Props){
 const router=useRouter();
 const [messages,setMessages]=useState<Message[]>(()=>{const seen=new Set<string>();return initialMessages.filter(message=>{if(seen.has(message.id))return false;seen.add(message.id);return true;});});
 const [content,setContent]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [,startTransition]=useTransition();
 const [menuOpen,setMenuOpen]=useState(false);
 const [reportModalOpen,setReportModalOpen]=useState(false);
 const [reportReason,setReportReason]=useState("Inappropriate behavior");
 const [reportDetails,setReportDetails]=useState("");
 const [reportSubmitting,setReportSubmitting]=useState(false);
 const bottomRef=useRef<HTMLDivElement>(null);
 const inputRef=useRef<HTMLInputElement>(null);
 const icebreakers=["☕ Canteen chai after lecture?","How is the semester treating you so far?",otherProfile.campus_hangout?`Down to catch up at ${otherProfile.campus_hangout}?`:"What is your favorite spot on campus?","Studying for midterms or chilling today?"];

 useEffect(()=>{
  const supabase=createClient();
  const channel=supabase.channel(`chat_${matchId}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`match_id=eq.${matchId}`},payload=>{
   const newMessage=payload.new as Message;
   setMessages(prev=>prev.some(m=>m.id===newMessage.id)?prev:[...prev,newMessage]);
  }).subscribe();
  return()=>{void supabase.removeChannel(channel);};
 },[matchId]);

 useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

 async function handleSend(e?:React.FormEvent<HTMLFormElement>,textToSend?:string){
  if(e)e.preventDefault();
  const text=(textToSend??content).trim();
  if(!text||loading)return;
  const tempId=`temp-${Date.now()}`;
  const optimisticMessage:Message={id:tempId,sender_id:currentUserId,content:text,created_at:new Date().toISOString()};
  setMessages(prev=>[...prev,optimisticMessage]);triggerHaptic([20]);setContent("");setLoading(true);setError("");
  try{
   const result=await sendMessage(matchId,text);
   if(result.error){setError(result.error);setMessages(prev=>prev.filter(m=>m.id!==tempId));return;}
   if(result.message){setMessages(prev=>{const withoutCopies=prev.filter(m=>m.id!==tempId&&m.id!==result.message!.id);return[...withoutCopies,result.message!];});}
  }catch{setError("Failed to deliver message. Please retry.");setMessages(prev=>prev.filter(m=>m.id!==tempId));}
  finally{setLoading(false);}
 }

 function handleQuickIcebreaker(chip:string){setContent(chip);inputRef.current?.focus();}
 async function handleBlock(){setMenuOpen(false);if(!confirm(`Are you sure you want to block ${otherProfile.display_name}?`))return;const result=await blockUser(otherUserId);if(result.error){setError(result.error);return;}startTransition(()=>{router.push(routes.messages);router.refresh();});}
 async function handleReportSubmit(e:React.FormEvent){e.preventDefault();setReportSubmitting(true);const result=await reportUser(otherUserId,reportReason,reportDetails);setReportSubmitting(false);if(result.error){setError(result.error);return;}setReportModalOpen(false);startTransition(()=>{router.push(routes.messages);router.refresh();});}

 return <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-background font-sans">
  <header className="relative z-30 shrink-0 flex h-12 items-center gap-2 border-b border-border/80 bg-card/98 px-2.5 shadow-sm">
   <Link href={routes.messages} aria-label="Back to chats" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-transform active:scale-95"><ChevronLeft className="h-4 w-4"/></Link>
   <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-emerald-500/50 bg-zinc-950">
    {otherPhotoUrl?<Image src={otherPhotoUrl} alt={otherProfile.display_name??"Match"} fill priority sizes="32px" className="object-cover"/>:<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-bold text-white">{otherProfile.display_name?.charAt(0)??"?"}</div>}
   </div>
   <div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-foreground">{otherProfile.display_name??"Match"}</p><p className="truncate text-[9px] text-muted-foreground">{otherProfile.department??"DateBu match"}</p></div>
   <div className="relative">
    <button type="button" onClick={()=>setMenuOpen(v=>!v)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-transform active:scale-95" aria-label="Chat safety menu" aria-expanded={menuOpen}><MoreVertical className="h-4 w-4"/></button>
    {menuOpen&&<div className="absolute right-0 top-10 z-[120] w-48 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,.18)]">
      <button type="button" onClick={()=>{setMenuOpen(false);setReportModalOpen(true);}} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-amber-800 hover:bg-amber-50"><Flag className="h-4 w-4 shrink-0"/>Report user</button>
      <button type="button" onClick={handleBlock} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-700 hover:bg-rose-50"><UserX className="h-4 w-4 shrink-0"/>Block user</button>
    </div>}
   </div>
  </header>

  <div className="flex-1 space-y-3.5 overflow-y-auto px-3 py-3 no-scrollbar overscroll-contain">
   <div className="mx-auto max-w-sm rounded-3xl border border-border/80 bg-card p-4 text-center shadow-2xs space-y-2.5">
    <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-full border-2 border-emerald-500/50 bg-zinc-950">
     {otherPhotoUrl?<Image src={otherPhotoUrl} alt={otherProfile.display_name??"Match"} fill sizes="56px" className="object-cover"/>:<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 text-base font-bold text-white">{otherProfile.display_name?.charAt(0)??"?"}</div>}
    </div>
    <div><h2 className="text-sm font-black text-foreground">Matched with {otherProfile.display_name?.split(" ")[0]}</h2><p className="mt-0.5 text-[11px] text-muted-foreground">{otherProfile.department}</p></div>
    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
     {otherProfile.relationship_goal&&<span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[9px] font-bold text-rose-700">{otherProfile.relationship_goal}</span>}
     {otherProfile.campus_residency&&<span className="flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800"><MapPin className="h-2.5 w-2.5"/>{otherProfile.campus_residency}</span>}
     {otherProfile.campus_hangout&&<span className="flex items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-900"><Coffee className="h-2.5 w-2.5"/>{otherProfile.campus_hangout}</span>}
    </div>
    {otherProfile.prompt_question&&otherProfile.prompt_answer&&<div className="rounded-2xl border border-border/60 bg-muted/40 p-2.5 text-left"><span className="block text-[9px] font-bold text-emerald-700">{otherProfile.prompt_question}</span><p className="mt-0.5 text-xs leading-snug text-foreground">&ldquo;{otherProfile.prompt_answer}&rdquo;</p></div>}
   </div>

   {messages.map((message,idx)=>{const isMine=message.sender_id===currentUserId;const prevMsg=messages[idx-1];const isSameSender=prevMsg&&prevMsg.sender_id===message.sender_id;return <div key={message.id} className={`flex flex-col ${isMine?"items-end":"items-start"}`}><div className={`max-w-[80%] px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${isMine?"rounded-2xl rounded-br-xs bg-emerald-600 text-white":"rounded-2xl rounded-bl-xs border border-border/80 bg-card text-foreground"}`}><p className="whitespace-pre-wrap break-words">{message.content}</p></div>{!isSameSender&&<span className="mt-0.5 px-1.5 text-[9px] font-medium text-muted-foreground">{formatMessageTime(message.created_at)}</span>}</div>})}
   <div ref={bottomRef}/>
  </div>

  {error&&<div className="flex items-center gap-2 border-t border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"><AlertCircle className="h-3.5 w-3.5 shrink-0"/><span>{error}</span></div>}

  {messages.length<3&&<div className="shrink-0 flex gap-1.5 overflow-x-auto border-t border-border/40 bg-muted/20 px-3 py-1.5 no-scrollbar"><span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-muted-foreground"><Sparkles className="h-3 w-3 text-emerald-600"/>Icebreakers:</span>{icebreakers.map(chip=><button type="button" key={chip} onClick={()=>handleQuickIcebreaker(chip)} className="shrink-0 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-foreground transition-all active:scale-95">{chip}</button>)}</div>}

  <form onSubmit={handleSend} className="relative z-20 shrink-0 flex items-center gap-2 border-t border-border/80 bg-card p-2.5 pb-[calc(.625rem+env(safe-area-inset-bottom))]">
   <input ref={inputRef} value={content} onChange={e=>setContent(e.target.value)} maxLength={2000} placeholder={`Message ${otherProfile.display_name?.split(" ")[0]}...`} disabled={loading} className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"/>
   <button type="submit" disabled={loading||!content.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white transition-transform active:scale-95 disabled:opacity-40" aria-label="Send message">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}</button>
  </form>

  {reportModalOpen&&<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-2xl">
   <div className="flex items-center justify-between"><h3 className="flex items-center gap-1.5 text-sm font-black"><Flag className="h-4 w-4 text-rose-600"/>Report {otherProfile.display_name}</h3><button type="button" onClick={()=>setReportModalOpen(false)} className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Close report dialog"><X className="h-4 w-4"/></button></div>
   <form onSubmit={handleReportSubmit} className="mt-4 space-y-2.5"><select value={reportReason} onChange={e=>setReportReason(e.target.value)} required className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 outline-none"><option value="Inappropriate behavior">Inappropriate messages or harassment</option><option value="Fake profile">Fake or impersonated profile</option><option value="Spam">Spam or solicitations</option><option value="Other">Other safety concern</option></select><textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} rows={3} maxLength={500} placeholder="Details..." className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 outline-none focus:border-emerald-500"/><div className="flex justify-end gap-2 pt-1"><Button type="button" variant="secondary" size="sm" onClick={()=>setReportModalOpen(false)}>Cancel</Button><Button type="submit" variant="primary" size="sm" disabled={reportSubmitting} className="bg-rose-600 text-white hover:bg-rose-700">{reportSubmitting?"Submitting...":"Report & Block"}</Button></div></form>
  </div></div>}
 </div>;
}
