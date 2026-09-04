"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const DISMISSED_KEY = "extrovert_date_install_prompt_dismissed";

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { const handler=(e:Event)=>{e.preventDefault();setEvent(e as InstallPromptEvent);if(localStorage.getItem(DISMISSED_KEY)!=="1")setOpen(true)};window.addEventListener("beforeinstallprompt",handler);return()=>window.removeEventListener("beforeinstallprompt",handler)},[]);
  async function install(){if(!event)return;await event.prompt();const choice=await event.userChoice;if(choice.outcome==="accepted")setOpen(false);setEvent(null)}
  function dismiss(){localStorage.setItem(DISMISSED_KEY,"1");setOpen(false)}
  if(!open||!event)return null;
  return <div className="fixed inset-x-3 bottom-20 z-[90] mx-auto max-w-md"><div className="relative overflow-hidden rounded-3xl border border-pink-200 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,.18)]"><button type="button" aria-label="Not now" onClick={dismiss} className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"><X size={15}/></button><div className="flex items-center gap-3 pr-7"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pink-50 text-pink-600"><Download size={21}/></div><div><p className="text-sm font-black">Install Extrovert Date</p><p className="mt-0.5 text-xs leading-5 text-zinc-500">Get the faster app-like dating experience with quick access from your home screen.</p></div></div><div className="mt-3 flex gap-2"><button type="button" onClick={()=>void install()} className="pressable smooth flex-1 rounded-xl bg-pink-500 px-4 py-2.5 text-xs font-bold text-white">Install app</button><button type="button" onClick={dismiss} className="pressable smooth rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-500">Not now</button></div></div></div>;
}
