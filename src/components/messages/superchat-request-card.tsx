"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { respondToSuperChat } from "@/app/(app)/app/messages/actions";

export default function SuperChatRequestCard({ requestId, senderName, content }: { requestId:string; senderName:string; content:string }) {
 const router=useRouter(); const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null);
 async function respond(accept:boolean){if(loading)return;setLoading(true);setError(null);try{const result=await respondToSuperChat(requestId,accept);if(result.error){setError(result.error);return;}if(result.matchId)router.push(`/app/messages/${result.matchId}`);else router.refresh();}finally{setLoading(false);}}
 return <div className="rounded-3xl border border-violet-200 bg-violet-50/70 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">SuperChat</p><p className="mt-1 text-sm font-black text-foreground">{senderName} sent you a message</p></div><span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-violet-700">New</span></div><p className="mt-3 rounded-2xl border border-violet-100 bg-white/80 p-3 text-xs leading-relaxed text-foreground">“{content}”</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={loading} onClick={()=>void respond(false)} className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-white py-2.5 text-[10px] font-bold text-muted-foreground disabled:opacity-50"><X className="h-3.5 w-3.5"/>Decline</button><button type="button" disabled={loading} onClick={()=>void respond(true)} className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-2.5 text-[10px] font-bold text-white disabled:opacity-50">{loading?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>}Accept & Chat</button></div>{error&&<p className="mt-2 text-[9px] font-semibold text-rose-700">{error}</p>}</div>;
}
