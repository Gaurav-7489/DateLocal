"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Flame, Heart, MessageCircle, UserRound, UsersRound, UserRoundPlus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const tabs = [
  { href: routes.discover, label: "Swipe", icon: Flame },
  { href: routes.social, label: "Explore", icon: Compass },
  { href: routes.likes, label: "Likes", icon: Heart },
  { href: routes.messages, label: "Chat", icon: MessageCircle },
  { href: routes.profile, label: "Profile", icon: UserRound },
];

export function MobileDatingChrome() {
  const pathname = usePathname();
  const hide = pathname === routes.onboarding || pathname.startsWith(routes.login) || pathname.startsWith(routes.register);
  if (hide) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[80] md:hidden">
        <div className="flex h-14 items-center justify-between px-4 pt-1">
          <Link href={routes.discover} aria-label="Extrovert dating home" className="text-xl font-black tracking-tight text-white drop-shadow-lg">
            Extrovert
          </Link>
          <div className="flex items-center gap-2">
            <Link href={routes.social} aria-label="Explore social" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-xl active:scale-95">
              <UsersRound className="h-[19px] w-[19px]" />
            </Link>
            <Link href={routes.social} aria-label="Friends" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-xl active:scale-95">
              <UserRoundPlus className="h-[19px] w-[19px]" />
            </Link>
            <Link href={routes.settings} aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-xl active:scale-95">
              <Settings className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </header>

      <nav aria-label="Dating navigation" className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-black/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link key={tab.href} href={tab.href} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition-transform active:scale-95", active ? "text-white" : "text-white/50")}>
                <Icon className={cn("h-[23px] w-[23px]", active && tab.label === "Swipe" && "fill-current")} strokeWidth={active ? 2.5 : 2} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
