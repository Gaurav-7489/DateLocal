"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
const LazyChatClient=dynamic(()=>import("./chat-client").then(m=>m.default),{ssr:false,loading:()=> <div className="flex min-h-40 flex-1 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-label="Loading chat"/></div>});
export function ChatLoader(props:React.ComponentProps<typeof LazyChatClient>){return <LazyChatClient {...props}/>}
