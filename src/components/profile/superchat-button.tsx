"use client";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import SuperChatComposer from "@/components/payments/superchat-composer";
export default function SuperChatButton({targetUserId,targetName}:{targetUserId:string;targetName:string}){const [open,setOpen]=useState(false);return <>{<button type="button" onClick={()=>setOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-xs font-black text-white active:scale-[.98]"><MessageCircle className="h-4 w-4"/>SuperChat</button>}{open&&<SuperChatComposer targetUserId={targetUserId} targetName={targetName} onClose={()=>setOpen(false)}/>}</>}
