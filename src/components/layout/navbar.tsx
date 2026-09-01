"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { ArrowRight, ShieldCheck, Menu, X, Newspaper } from "lucide-react";

const publicLinks = [
  { href: routes.about, label: "About" },
  { href: routes.safety, label: "Safety & Trust", icon: ShieldCheck },
  { href: routes.news, label: "News & Feedback", icon: Newspaper },
];

const menuVariants: Variants = {
  hidden: { opacity: 0, y: -15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", bounce: 0, duration: 0.4, staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2, ease: "easeOut" } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 20));

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 font-sans mt-4">
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0)",
          borderColor: isScrolled ? "rgba(228, 228, 231, 0.8)" : "rgba(228, 228, 231, 0)",
          boxShadow: isScrolled ? "0 8px 30px rgba(0,0,0,0.06)" : "0 0px 0px rgba(0,0,0,0)",
          paddingTop: isScrolled ? "0.6rem" : "1rem",
          paddingBottom: isScrolled ? "0.6rem" : "1rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full max-w-5xl flex items-center justify-between px-4 sm:px-6 rounded-full backdrop-blur-xl border border-transparent"
        aria-label="Main navigation"
      >
        <Link href={routes.home} className="flex items-center gap-2.5 group active:scale-95 transition-transform z-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm shadow-emerald-600/20 group-hover:bg-emerald-500 group-hover:rotate-3 transition-all duration-300">
            {universityConfig.shortName.charAt(0)}
          </div>
          <span className="text-base font-extrabold tracking-tight text-zinc-950">
            {universityConfig.appName}<span className="text-emerald-600">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 relative z-10" onMouseLeave={() => setHoveredPath(null)}>
          {publicLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredPath(link.href)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-colors z-20",
                  isActive ? "text-emerald-700" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {isActive && <span className="absolute inset-0 bg-emerald-50 rounded-full -z-10" />}
                {hoveredPath === link.href && !isActive && (
                  <motion.span layoutId="navbar-hover" className="absolute inset-0 bg-zinc-100 rounded-full -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                {Icon && <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-600" : "text-zinc-400")} />}
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 z-10">
          <Link
            href={routes.login}
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:border-blue-300 hover:scale-105 active:scale-95"
          >
            Log In
          </Link>
          <Link
            href={routes.register}
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
            <span className="relative z-10 flex items-center gap-1.5">
              Join {universityConfig.shortName}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        <div className="flex items-center md:hidden z-20">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50/80 backdrop-blur-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors active:scale-95" aria-expanded={mobileOpen} aria-label="Toggle navigation menu">
            <motion.div initial={false} animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.div>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div variants={menuVariants} initial="hidden" animate="visible" exit="exit" className="absolute top-20 left-4 right-4 rounded-3xl border border-zinc-200/90 bg-white/95 p-5 backdrop-blur-2xl shadow-[0_24px_50px_rgba(0,0,0,0.1)] md:hidden z-50 origin-top">
            <div className="flex flex-col gap-2">
              {publicLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all active:scale-95",
                        isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                      )}
                    >
                      {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-emerald-600" : "text-zinc-400")} />}
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div variants={itemVariants} className="h-px bg-zinc-100 my-2" />

              <motion.div variants={itemVariants}>
                <Link
                  href={routes.login}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-100 text-center transition-colors active:scale-95"
                >
                  Log In
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  href={routes.register}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-2xl bg-emerald-600 px-4 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors active:scale-95"
                >
                  Join {universityConfig.name}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
