"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, ShieldCheck } from "lucide-react";
import { routes } from "@/config/routes";

export type ExploreMapPerson = { id:string;display_name:string|null;profile_photo_path:string|null;area_name:string };
export type ExploreMapArea = { name:string;users:number;verified:number };

const anchors:Record<string,{left:number;top:number}>={Waknaghat:{left:44,top:43},Solan:{left:47,top:76},Shimla:{left:78,top:17}};
const offsets=[[0,0],[-4,-5],[4,-4],[-5,5],[5,5],[0,8]];

export default function ExploreMap({people,areas}:{people:ExploreMapPerson[];areas:ExploreMapArea[]}){
 const visiblePeople=people.slice(0,12);
 return <section className="mt-5 overflow-hidden rounded-[2rem] border border-emerald-100 bg-emerald-50/60 p-3 shadow-sm">
  <div className="flex items-end justify-between gap-3 px-1 pb-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">Explore map</p><h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950">Waknaghat · Solan · Shimla</h2><p className="mt-1 max-w-sm text-[10px] leading-4 text-zinc-500">See the three Extrovert areas at a glance. People are grouped by area and shown approximately, never at an exact location.</p></div><span className="shrink-0 rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[9px] font-black text-emerald-700"><MapPin className="mr-1 inline h-3 w-3"/>Area map</span></div>
  <div className="relative h-[360px] overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-inner">
   <iframe title="Map of Waknaghat, Solan and Shimla" src="https://www.openstreetmap.org/export/embed.html?bbox=76.98%2C30.84%2C77.23%2C31.15&layer=mapnik" className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer" />
   <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/15"/>
   {areas.map(area=>{const p=anchors[area.name]??{left:50,top:50};return <div key={area.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{left:`${p.left}%`,top:`${p.top}%`}}><div className="rounded-full border-2 border-white bg-emerald-600 px-2.5 py-1 text-[9px] font-black text-white shadow-lg">{area.name} · {area.users}</div></div>})}
   {visiblePeople.map((person,index)=>{const base=anchors[person.area_name]??{left:50,top:50};const [dx,dy]=offsets[index%offsets.length];return <Link key={person.id} href={`${routes.profileView}/${person.id}`} className="absolute z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-2 border-white bg-emerald-50 shadow-lg ring-2 ring-emerald-300" style={{left:`calc(${base.left}% + ${dx * 5}px)`,top:`calc(${base.top}% + ${dy * 5}px)`}} title={`${person.display_name??"Member"} · ${person.area_name}`}>{person.profile_photo_path?<Image src={person.profile_photo_path} alt="" fill sizes="40px" className="object-cover"/>:<span className="text-[10px] font-black text-emerald-700">{person.display_name?.charAt(0)??"?"}</span>}</Link>})}
   <div className="absolute bottom-3 left-3 rounded-full border border-zinc-200 bg-white/95 px-3 py-1.5 text-[9px] font-bold text-zinc-600 shadow-sm"><Users className="mr-1 inline h-3 w-3 text-emerald-600"/>{people.length} people in these areas</div>
   <div className="absolute right-3 bottom-3 rounded-full border border-zinc-200 bg-white/95 px-3 py-1.5 text-[9px] font-bold text-zinc-500 shadow-sm">Approximate positions</div>
  </div>
  <div className="mt-3 grid grid-cols-3 gap-2">{areas.map(area=><div key={area.name} className="rounded-2xl border border-zinc-100 bg-white p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-black text-zinc-950">{area.name}</p><MapPin className="h-3.5 w-3.5 text-emerald-600"/></div><p className="mt-1 text-[10px] font-semibold text-zinc-500">{area.users} nearby</p><p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-700"><ShieldCheck className="h-3 w-3"/>{area.verified} verified</p></div>)}</div>
  <p className="mt-2 px-1 text-[9px] text-zinc-400">Map data © OpenStreetMap contributors. Extrovert only uses the selected area for discovery; it does not expose a member&apos;s exact location.</p>
 </section>;
}
