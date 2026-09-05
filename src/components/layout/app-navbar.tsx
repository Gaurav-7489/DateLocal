"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { Compass, Heart, MessageSquare, User, LogOut, Crown, Shield, Flame } from "lucide-react";

const links = [
  { href: routes.discover, label: "Discover", icon: Flame },
  { href: routes.social, label: "Explore", icon: Compass },
  { href: routes.likes, label: "Likes", icon: Heart },
  { href: routes.messages, label: "Chat", icon: MessageSquare },
  { href: routes.profile, label: "Profile", icon: User },
];
const secondary = [{ href: routes.matches, label: "Matches" }, { href: routes.settings, label: "Settings" }];
interface Props { userEmail: string; isSuperAdmin?: boolean; }

export function AppNavbar({ userEmail, isSuperAdmin = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isSetup = pathname.includes("/profile/setup");
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { if (!isSetup) { links.forEach((item) => router.prefetch(item.href)); router.prefetch(routes.settings); } }, [router, isSetup]);

  if (isSetup) return <header className="hidden border-b border-zinc-100 bg-white md:block"><nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4"><Link href={routes.discover} className="flex items-center gap-2"><Image src="/icon-512.png" alt="Extrovert" width={32} height={32} className="rounded-xl" priority/><span className="text-sm font-black text-zinc-950">Extrovert</span></Link><form action={signOut}><button className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-700">Sign out</button></form></nav></header>;

  return <header className="hidden border-b border-zinc-100 bg-white md:block">
    <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4" aria-label="Main navigation">
      <Link href={routes.discover} className="flex items-center gap-2"><Image src="/icon-512.png" alt="Extrovert" width={32} height={32} className="rounded-xl" priority/><span className="text-sm font-black text-zinc-950">Extrovert</span></Link>
      <div className="flex items-center gap-1">{links.map((item) => { const Icon=item.icon; const active=pathname===item.href||pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold",active?"bg-emerald-50 text-emerald-700":"text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900")}><Icon className="h-4 w-4"/>{item.label}</Link>; })}</div>
      <div className="relative"><button type="button" onClick={()=>setOpen((v)=>!v)} aria-expanded={open} className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1.5 text-xs font-bold text-zinc-700"><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-[11px] font-black text-white">{userEmail.charAt(0).toUpperCase()}</span>{userEmail.split("@")[0]}</button>{open&&<div className="absolute right-0 top-11 z-[100] w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"><p className="px-3 py-2 text-[10px] font-bold text-zinc-400">{userEmail}</p>{secondary.map(item=><Link key={item.href} href={item.href} className="block rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50">{item.label}</Link>)}<Link href={routes.extrovert} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-700"><Crown className="h-3.5 w-3.5"/>More from Extrovert</Link>{isSuperAdmin&&<Link href={routes.admin.root} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700"><Shield className="h-3.5 w-3.5"/>Admin</Link>}<form action={signOut} className="mt-1 border-t border-zinc-100 pt-1"><button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600"><LogOut className="h-3.5 w-3.5"/>Sign out</button></form></div>}</div>
    </nav>
  </header>;
}
