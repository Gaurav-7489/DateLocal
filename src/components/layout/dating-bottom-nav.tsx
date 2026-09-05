"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Flame, Heart, MessageCircle, UserRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const items = [
  { href: routes.discover, label: "Dating", icon: Flame },
  { href: routes.social, label: "Social", icon: Compass },
  { href: routes.likes, label: "Likes", icon: Heart },
  { href: routes.messages, label: "Chat", icon: MessageCircle },
  { href: routes.profile, label: "Profile", icon: UserRound },
];

export function DatingBottomNav() {
  const pathname = usePathname();
  const hide = pathname === routes.onboarding || pathname.startsWith(routes.login) || pathname.startsWith(routes.register);
  if (hide) return null;
  return <>
    <header className="fixed inset-x-0 top-0 z-[90] border-b border-zinc-100 bg-white/95 backdrop-blur-xl md:hidden"><div className="mx-auto flex h-14 max-w-md items-center justify-between px-4"><Link href={routes.discover} aria-label="Extrovert home" className="text-[21px] font-black tracking-tight text-zinc-950">Extrovert</Link><Link href={routes.settings} aria-label="Settings" className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm active:scale-95"><Settings className="h-[18px] w-[18px]" /></Link></div></header>
    <nav aria-label="Extrovert navigation" className="fixed inset-x-0 bottom-0 z-[80] border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"><div className="mx-auto grid h-[68px] max-w-md grid-cols-5 px-1">{items.map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={cn("flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-transform active:scale-90", active ? "text-emerald-600" : "text-zinc-500")}><Icon className={cn("h-[24px] w-[24px]", active && item.href === routes.discover && "fill-current")} strokeWidth={active ? 2.5 : 1.9}/><span>{item.label}</span></Link>; })}</div></nav>
  </>;
}
