"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Heart, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SEEN_KEY = "extrovert_date_women_welcome_seen";

export function WomenWelcome() {
  const [open,setOpen]=useState(false);
  useEffect(()=>{if(localStorage.getItem(SEEN_KEY)==="1")return;const client=createClient();client.from("extrovert_profiles").select("gender,profile_completed").maybeSingle().then(({data})=>{if(data?.profile_completed&&data.gender==="woman")setOpen(true)});},[]);
  function close(){localStorage.setItem(SEEN_KEY,"1");setOpen(false)}
  if(!open)return null;
  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"><div className="relative w-full max-w-sm rounded-[2rem] border border-pink-200 bg-white p-6 text-center shadow-[0_25px_90px_rgba(15,23,42,.24)]"><button type="button" aria-label="Close" onClick={close} className="absolute right-4 top-4 rounded-full bg-zinc-100 p-2 text-zinc-500"><X className="h-4 w-4"/></button><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-pink-50 text-pink-500"><Heart className="h-7 w-7" fill="currentColor"/></div><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-pink-600">Welcome to Extrovert Date</p><h2 className="mt-1 text-2xl font-black">You&apos;re eligible for our women-first benefits.</h2><p className="mt-3 text-xs leading-5 text-zinc-500">Your shared Extrovert identity is active. You can use the dating experience, control who you meet and keep your verification status visible to people you connect with.</p><div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-left"><p className="flex items-center gap-2 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4"/>Your eligibility is based on your Extrovert identity.</p></div><button type="button" onClick={close} className="mt-5 w-full rounded-2xl bg-pink-500 py-3.5 text-xs font-black text-white">Got it</button></div></div>;
}
