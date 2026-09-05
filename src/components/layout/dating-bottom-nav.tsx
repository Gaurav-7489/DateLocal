"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Flame, Heart, MessageCircle, UserRound, UsersRound, UserRoundPlus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const items = [
  { href: routes.discover, label: "Swipe", icon: Flame },
  { href: routes.social, label: "Explore", icon: Compass },
  { href: routes.likes, label: "Likes", icon: Heart },
  { href: routes.messages, label: "Chat", icon: MessageCircle },
  { href: routes.profile, label: "Profile", icon: UserRound },
];

export function DatingBottomNav() {
  const pathname = usePathname();
  const hide = pathname === routes.onboarding || pathname.startsWith(routes.login) || pathname.startsWith(routes.register);
  if (hide) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[90] md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4 pt-1">
          <Link href={routes.discover} aria-label="Extrovert dating home" className="text-[21px] font-black tracking-tight text-white drop-shadow-lg">Extrovert</Link>
          <div className="flex items-center gap-2">
            <Link href={routes.social} aria-label="Social" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-xl active:scale-95"><UsersRound className="h-[19px] w-[19px]" /></Link>
            <Link href={routes.social} aria-label="Friends" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-xl active:scale-95"><UserRoundPlus className="h-[19px] w-[19px]" /></Link>
            <Link href={routes.settings} aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-xl active:scale-95"><Settings className="h-[18px] w-[18px]" /></Link>
          </div>
        </div>
      </header>

      <nav aria-label="Dating navigation" className="fixed inset-x-0 bottom-0 z-[80] border-t border-zinc-800/80 bg-black/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid h-[68px] max-w-md grid-cols-5 px-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={cn("flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-transform active:scale-90", active ? "text-white" : "text-zinc-500")}>
                <Icon className={cn("h-[25px] w-[25px]", active && item.href === routes.discover && "fill-current")} strokeWidth={active ? 2.5 : 1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
