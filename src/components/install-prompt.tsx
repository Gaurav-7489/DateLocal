"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, Share, X, PlusSquare } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const DISMISSED_KEY = "extrovert_date_install_prompt_dismissed";

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    if (standalone || localStorage.getItem(DISMISSED_KEY) === "1") return;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIos(isIOS);
    const handler=(e:Event)=>{e.preventDefault();setEvent(e as InstallPromptEvent);setOpen(true)};
    window.addEventListener("beforeinstallprompt",handler);
    if (isIOS) setTimeout(()=>setOpen(true),1200);
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  async function install(){if(!event)return;await event.prompt();const choice=await event.userChoice;if(choice.outcome==="accepted"){localStorage.removeItem(DISMISSED_KEY);setOpen(false)}setEvent(null)}
  function dismiss(){localStorage.setItem(DISMISSED_KEY,"1");setOpen(false)}
  if(!open)return null;
  return <div className="fixed inset-x-3 bottom-20 z-[90] mx-auto max-w-md"><div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,.18)]"><button type="button" aria-label="Not now" onClick={dismiss} className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"><X size={15}/></button><div className="flex items-center gap-3 pr-7"><Image src="/extrovert-date.svg" alt="Extrovert Date" width={48} height={48} className="size-12 shrink-0 rounded-2xl border border-emerald-100 bg-white object-cover"/><div><p className="text-sm font-black text-zinc-950">Install Extrovert Date</p><p className="mt-0.5 text-xs leading-5 text-zinc-500">Keep Date on your home screen for a faster, app-like experience.</p></div></div>{ios?<div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-[10px] leading-5 font-semibold text-emerald-900"><span className="inline-flex items-center gap-1"><Share size={12}/> Tap Share</span>, then <span className="inline-flex items-center gap-1"><PlusSquare size={12}/> Add to Home Screen</span>.</div>:<div className="mt-3 flex gap-2"><button type="button" onClick={()=>void install()} disabled={!event} className="pressable smooth flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"><Download className="mr-1 inline h-3.5 w-3.5"/>Install app</button><button type="button" onClick={dismiss} className="pressable smooth rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-500">Not now</button></div>}{ios&&<button type="button" onClick={dismiss} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-500">Not now</button>}</div></div>;
}
