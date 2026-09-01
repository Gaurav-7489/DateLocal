"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { routes } from "@/config/routes";

export function PersonalDashboardShortcut() {
  const pathname = usePathname();
  if (!pathname.startsWith("/app") || pathname === routes.dashboard || pathname.includes("/profile/setup")) return null;

  return (
    <Link
      href={routes.dashboard}
      prefetch
      aria-label="Open personal activity dashboard"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 z-[40] inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/80 bg-white/95 text-zinc-600 shadow-lg backdrop-blur-xl transition-[transform,background-color,box-shadow] duration-150 hover:bg-zinc-50 hover:text-emerald-700 active:scale-95 sm:right-5"
    >
      <BarChart3 className="h-4 w-4" />
    </Link>
  );
}
