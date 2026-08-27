"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { ArrowRight, ShieldCheck, Sparkles, Menu, X, Sun, Moon } from "lucide-react";

const publicLinks = [
  { href: routes.about, label: "About" },
  { href: routes.safety, label: "Safety & Trust", icon: ShieldCheck },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", nextTheme);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3.5 transition-all">
      <nav
        className="w-full max-w-5xl flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full bg-zinc-950/80 dark:bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/40"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          href={routes.home}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-600 to-blue-600 text-sm font-bold text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            {universityConfig.shortName.charAt(0)}
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            {universityConfig.appName}
            <span className="text-emerald-400">.</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-white",
                  isActive ? "text-emerald-400" : "text-zinc-400"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-emerald-400" />}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          <Link
            href={routes.login}
            className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Log in
          </Link>

          <Link
            href={routes.register}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
          >
            Join BU <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 text-zinc-400 hover:text-white"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-colors"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="absolute top-16 left-4 right-4 rounded-3xl border border-white/10 bg-zinc-950/95 p-5 backdrop-blur-2xl shadow-2xl md:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                  {link.label}
                </Link>
              );
            })}

            <div className="h-px bg-white/10 my-1" />

            <Link
              href={routes.login}
              onClick={() => setMobileOpen(false)}
              className="rounded-2xl px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white text-center"
            >
              Log in
            </Link>

            <Link
              href={routes.register}
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
            >
              Join Bahra University
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}