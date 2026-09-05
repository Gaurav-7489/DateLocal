"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Flame, Heart, MessageCircle, UserRound } from "lucide-react";
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

  return (
    <nav
      aria-label="Dating navigation"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-zinc-800/80 bg-black/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-[68px] max-w-md grid-cols-5 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-transform active:scale-90",
                active ? "text-white" : "text-zinc-500",
              )}
            >
              <Icon className={cn("h-[25px] w-[25px]", active && item.href === routes.discover && "fill-current")} strokeWidth={active ? 2.5 : 1.9} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
