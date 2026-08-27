"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { signOut } from "@/app/(app)/actions";
import {
  Home,
  Compass,
  Heart,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const appLinks = [
  { href: routes.app, label: "Home", icon: Home },
  { href: routes.discover, label: "Discover", icon: Compass },
  { href: routes.matches, label: "Matches", icon: Heart },
  { href: routes.messages, label: "Chat", icon: MessageSquare },
  { href: routes.profile, label: "Profile", icon: User },
];

const menuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.3,
      staggerChildren: 0.04,
    },
  },

  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -8,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
    },
  },
};

interface AppNavbarProps {
  userEmail: string;
}

export function AppNavbar({ userEmail }: AppNavbarProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl shadow-xs font-sans">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="App navigation"
      >
        {/* Brand */}
        <Link
          href={routes.app}
          className="flex items-center gap-2.5 text-lg font-bold text-zinc-950 group active:scale-95 transition-transform"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm shadow-emerald-600/20 group-hover:bg-emerald-500 group-hover:rotate-3 transition-all duration-300">
            {universityConfig.shortName.charAt(0)}
          </div>

          <span className="hidden sm:inline tracking-tight font-extrabold">
            {universityConfig.appName}
            <span className="text-emerald-600">.</span>
          </span>
        </Link>

        {/* Desktop Navigation with Magnetic Hover Pill */}
        <div
          className="hidden items-center gap-1 md:flex relative"
          onMouseLeave={() => setHoveredPath(null)}
        >
          {appLinks.map((link) => {
            const isActive =
              link.href === routes.app
                ? pathname === routes.app
                : pathname.startsWith(link.href);

            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredPath(link.href)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors z-20",
                  isActive
                    ? "text-emerald-700"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <span className="absolute inset-0 bg-emerald-50 rounded-full -z-10" />
                )}

                {/* Gliding Hover Pill */}
                {hoveredPath === link.href && !isActive && (
                  <motion.span
                    layoutId="app-nav-hover"
                    className="absolute inset-0 bg-zinc-100 rounded-full -z-10"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}

                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive
                      ? "stroke-[2.5] text-emerald-600"
                      : "stroke-2 text-zinc-400"
                  )}
                />

                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop User Menu */}
        <div
          className="hidden items-center gap-3 md:flex"
          ref={menuRef}
        >
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-zinc-200/90 bg-zinc-50/80 p-1 pr-3 transition-colors hover:bg-zinc-100 hover:border-zinc-300 cursor-pointer active:scale-95 shadow-2xs"
              aria-expanded={userMenuOpen}
              aria-label="User menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {userEmail.charAt(0).toUpperCase()}
              </span>

              <span className="text-xs font-bold text-zinc-700 max-w-[100px] truncate">
                {userEmail.split("@")[0]}
              </span>

              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-zinc-400 transition-transform duration-300",
                  userMenuOpen && "rotate-180 text-zinc-700"
                )}
              />
            </button>

            {/* Desktop Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                  className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-xl py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] origin-top-right"
                >
                  {/* User info */}
                  <div className="border-b border-zinc-100 px-4 py-3 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Signed In As
                    </p>

                    <p className="mt-0.5 truncate text-xs font-semibold text-zinc-900">
                      {userEmail}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1 px-1.5 space-y-0.5">
                    <Link
                      href={routes.profile}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      Your Profile
                    </Link>

                    <Link
                      href={routes.settings}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      Settings
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-zinc-100 pt-1 px-1.5 mt-1">
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 active:scale-95 md:hidden cursor-pointer z-20"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          <motion.div
            animate={{
              rotate: mobileOpen ? 90 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </motion.div>
        </button>
      </nav>

      {/* Mobile Drawer Dropdown (Staggered Animation) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-20 left-4 right-4 rounded-3xl border border-zinc-200/90 bg-white/95 p-5 backdrop-blur-2xl shadow-[0_24px_50px_rgba(0,0,0,0.1)] md:hidden z-50 origin-top overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {appLinks.map((link) => {
                const isActive =
                  link.href === routes.app
                    ? pathname === routes.app
                    : pathname.startsWith(link.href);

                const Icon = link.icon;

                return (
                  <motion.div
                    key={link.href}
                    variants={itemVariants}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all active:scale-95",
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isActive
                            ? "stroke-[2.5] text-emerald-600"
                            : "stroke-2 text-zinc-400"
                        )}
                      />

                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                variants={itemVariants}
                className="my-2 h-px w-full bg-zinc-100"
              />

              {/* Mobile user info */}
              <motion.div
                variants={itemVariants}
                className="px-4 py-3 mb-1 rounded-2xl bg-zinc-50 border border-zinc-100"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Signed In As
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">
                  {userEmail}
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  href={routes.settings}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <Settings className="w-5 h-5 stroke-2 text-zinc-400" />
                  Settings
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-5 h-5 stroke-2" />
                    Sign out
                  </button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}