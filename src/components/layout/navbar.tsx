"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, Newspaper, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";

const publicLinks = [
  { href: routes.about, label: "About" },
  { href: routes.safety, label: "Safety & Trust", icon: ShieldCheck },
  { href: routes.news, label: "News & Feedback", icon: Newspaper },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 font-sans">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-zinc-200/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-5" aria-label="Main navigation">
        <Link href={routes.home} onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 active:scale-[.98]">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm shadow-emerald-600/20">
            {universityConfig.shortName.charAt(0)}
          </span>
          <span className="text-base font-extrabold tracking-tight text-zinc-950">
            {universityConfig.appName}<span className="text-emerald-600">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                active ? "bg-emerald-50 text-emerald-700" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
              )}>
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href={routes.login} className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100">Log In</Link>
          <Link href={routes.register} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700">
            Join {universityConfig.shortName}<ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 md:hidden" aria-expanded={mobileOpen} aria-label="Toggle navigation menu">
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mx-auto mt-2 w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1.5">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold",
                  active ? "bg-emerald-50 text-emerald-700" : "text-zinc-600 hover:bg-zinc-50",
                )}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
            <div className="my-1 h-px bg-zinc-100" />
            <Link href={routes.login} onClick={() => setMobileOpen(false)} className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-center text-sm font-bold text-blue-700">Log In</Link>
            <Link href={routes.register} onClick={() => setMobileOpen(false)} className="rounded-2xl bg-emerald-600 px-4 py-3.5 text-center text-sm font-bold text-white">Join {universityConfig.name}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
