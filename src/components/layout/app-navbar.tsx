"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { isUniversityEmail, universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { signOut } from "@/app/(app)/actions";
import {
  Compass,
  Heart,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Shield,
  Bell,
  Download,
  Crown,
  Loader2,
} from "lucide-react";

const appLinks = [
  { href: routes.discover, label: "Discover", icon: Compass, badge: "New" },
  { href: routes.matches, label: "Matches", icon: Heart },
  { href: routes.messages, label: "Chats", icon: MessageSquare },
  { href: routes.profile, label: "You", icon: User },
];

const mobileBottomLinks = [
  { href: routes.discover, label: "Discover", icon: Compass },
  { href: routes.messages, label: "Chats", icon: MessageSquare },
  { href: routes.profile, label: "You", icon: User },
  { href: routes.matches, label: "Matches", icon: Heart },
];

const menuVariants: Variants = {
  hidden: { opacity: 0, y: -12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.1,
      duration: 0.4,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 },
  },
};

interface AppNavbarProps {
  userEmail: string;
  isSuperAdmin?: boolean;
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  platforms: string[];
};

export function AppNavbar({
  userEmail,
  isSuperAdmin = false,
}: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isVerifiedUser = isUniversityEmail(userEmail);
  const isSetupRoute = pathname.includes("/profile/setup");

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isSetupRoute) {
      router.prefetch(routes.discover);
      router.prefetch(routes.matches);
      router.prefetch(routes.messages);
      router.prefetch(routes.profile);
      router.prefetch(routes.settings);
      router.prefetch(routes.extrovert);
      router.prefetch(routes.news);
      if (isSuperAdmin) {
        router.prefetch(routes.admin.root);
      }
    }
  }, [router, isSuperAdmin, isSetupRoute]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 15);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
      setIsInstalling(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

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

  const handleInstallApp = async () => {
    if (!installPrompt) {
      const isIOS = /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
      if (isIOS) {
        window.alert("Open the Share menu and choose 'Add to Home Screen' to install DateBu on your iPhone.");
      } else {
        window.alert("Use the browser menu to install this app on your phone.");
      }
      return;
    }

    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
        setIsStandalone(true);
      }
    } catch {
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 font-sans",
          scrolled
            ? "border-b border-zinc-200/80 bg-white/90 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] py-1"
            : "border-b border-transparent bg-white/60 backdrop-blur-xl py-2"
        )}
      >
        <nav
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"
          aria-label="App navigation"
        >
          <div className="flex items-center gap-2.5 text-lg font-bold text-zinc-950">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white shadow-md shadow-emerald-600/25">
              {universityConfig.shortName.charAt(0)}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
            </div>

            <div className="flex flex-col">
              <span className="hidden sm:flex items-center gap-1.5 tracking-tight font-extrabold text-sm">
                {universityConfig.appName}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-zinc-400 -mt-1 tracking-wider uppercase">
                {universityConfig.shortName} Campus
              </span>
            </div>
          </div>

          {!isSetupRoute && (
            <div
              className="hidden items-center gap-1.5 md:flex relative p-1 rounded-full bg-zinc-100/60 border border-zinc-200/50 backdrop-blur-md"
              onMouseLeave={() => setHoveredPath(null)}
            >
              {appLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredPath(link.href)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 z-20",
                      isActive
                        ? "text-emerald-800"
                        : "text-zinc-600 hover:text-zinc-950"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="app-nav-active"
                        className="absolute inset-0 bg-white rounded-full shadow-xs border border-zinc-200/60 -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {hoveredPath === link.href && !isActive && (
                      <motion.span
                        layoutId="app-nav-hover"
                        className="absolute inset-0 bg-zinc-200/60 rounded-full -z-10"
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.4,
                        }}
                      />
                    )}

                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isActive
                          ? "stroke-[2.5] text-emerald-600 scale-110"
                          : "stroke-2 text-zinc-400 group-hover:text-zinc-600"
                      )}
                    />

                    <span>{link.label}</span>

                    {link.badge && !isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {!isSetupRoute ? (
            <div className="hidden items-center gap-2.5 md:flex" ref={menuRef}>
              <Link
                href={routes.news}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 transition-all hover:bg-blue-100"
              >
                <Bell className="h-3.5 w-3.5" />
                News
              </Link>

              {!isStandalone && (
                <button
                  type="button"
                  onClick={handleInstallApp}
                  disabled={isInstalling}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isInstalling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {isInstalling ? "Opening..." : "Install app"}
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-full border bg-zinc-50/90 p-1 pr-3.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs",
                    userMenuOpen
                      ? "border-emerald-300 bg-white ring-2 ring-emerald-500/10 shadow-sm"
                      : "border-zinc-200/90 hover:bg-zinc-100 hover:border-zinc-300"
                  )}
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-xs font-black text-white shadow-xs">
                    {userEmail.charAt(0).toUpperCase()}
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-800 max-w-[110px] truncate leading-tight">
                      {userEmail.split("@")[0]}
                    </span>
                    {isVerifiedUser ? (
                      <span className="text-[10px] font-medium text-emerald-600 leading-none mt-0.5 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 inline" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-zinc-500 leading-none mt-0.5">
                        Student account
                      </span>
                    )}
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-zinc-400 transition-transform duration-300 ml-0.5",
                      userMenuOpen && "rotate-180 text-emerald-600"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      className="absolute right-0 z-50 mt-2.5 w-60 rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] origin-top-right divide-y divide-zinc-100"
                    >
                      <div className="px-3 py-3 mb-1 rounded-xl bg-gradient-to-br from-zinc-50 to-emerald-50/30 border border-zinc-100">
                        <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-0.5">
                          <Sparkles className="w-3 h-3" /> Signed In As
                        </div>
                        <p className="truncate text-xs font-bold text-zinc-900">
                          {userEmail}
                        </p>
                      </div>

                      {isSuperAdmin && (
                        <div className="mb-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-2">
                          <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                            <Shield className="h-3 w-3" />
                            View Mode
                          </div>

                          <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 border border-emerald-100">
                            <Link
                              href={routes.app}
                              onClick={() => setUserMenuOpen(false)}
                              className={cn(
                                "rounded-lg px-2 py-2 text-center text-[11px] font-bold transition-all",
                                !pathname.startsWith("/admin")
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                              )}
                            >
                              Student
                            </Link>

                            <Link
                              href={routes.admin.root}
                              onClick={() => setUserMenuOpen(false)}
                              className={cn(
                                "rounded-lg px-2 py-2 text-center text-[11px] font-bold transition-all",
                                pathname.startsWith("/admin")
                                  ? "bg-zinc-900 text-white shadow-sm"
                                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                              )}
                            >
                              Admin
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className="py-1.5 space-y-0.5">
                        <Link
                          href={routes.profile}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 transition-all hover:bg-emerald-50/60 hover:text-emerald-900 group"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          You
                        </Link>

                        <Link
                          href={routes.settings}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700 transition-all hover:bg-emerald-50/60 hover:text-emerald-900 group"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                            <Settings className="w-3.5 h-3.5" />
                          </div>
                          Settings & privacy
                        </Link>
                      </div>

                      <div className="pt-1.5 mt-1">
                        <form action={signOut}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-50 hover:text-rose-700 cursor-pointer group"
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition-colors">
                              <LogOut className="w-3.5 h-3.5" />
                            </div>
                            Sign out safely
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-zinc-500">{userEmail}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer shadow-2xs active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          )}

          {!isSetupRoute && (
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
              >
                <motion.div
                  animate={{ rotate: mobileOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileOpen ? (
                    <X className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    <Menu className="h-4 w-4 stroke-[2.5]" />
                  )}
                </motion.div>
              </button>

              <Link
                href={routes.extrovert}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-95",
                  pathname.startsWith(routes.extrovert)
                    ? "border-amber-300 bg-amber-50 text-amber-600 shadow-sm"
                    : "border-zinc-200 bg-white/90 text-zinc-500 hover:text-amber-600"
                )}
                aria-label="Extrovert"
              >
                <Crown className="h-4 w-4" />
              </Link>

              {isSuperAdmin && (
                <Link
                  href={routes.admin.root}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-95",
                    pathname.startsWith("/admin")
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                      : "border-zinc-800 bg-zinc-900 text-white"
                  )}
                  aria-label="Open admin dashboard"
                >
                  <Shield className="h-4 w-4 text-white" />
                </Link>
              )}
            </div>
          )}
        </nav>

        {!isSetupRoute && (
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-16 left-4 right-4 rounded-3xl border border-zinc-200/90 bg-white/95 p-5 backdrop-blur-3xl shadow-[0_24px_50px_rgba(0,0,0,0.12)] md:hidden z-50 origin-top overflow-hidden divide-y divide-zinc-100"
              >
                <div className="flex flex-col gap-1.5 pb-3">
                  <motion.div variants={itemVariants}>
                    <Link
                      href={routes.news}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all active:scale-95",
                        pathname.startsWith(routes.news)
                          ? "border border-blue-100 bg-blue-50 text-blue-700"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Bell className="h-4 w-4" />
                      </div>
                      News & Feedback
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Link
                      href={routes.settings}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-950"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                        <Settings className="h-4 w-4" />
                      </div>
                      Settings & Preferences
                    </Link>
                  </motion.div>
                </div>

                <div className="pt-4 flex flex-col gap-2.5">
                  {!isStandalone && (
                    <motion.div variants={itemVariants}>
                      <button
                        type="button"
                        onClick={handleInstallApp}
                        disabled={isInstalling}
                        className="flex w-full items-center gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          {isInstalling ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                          ) : (
                            <Download className="w-4 h-4 stroke-2" />
                          )}
                        </div>
                        {isInstalling ? "Opening installer..." : "Install app"}
                      </button>
                    </motion.div>
                  )}

                  <motion.div
                    variants={itemVariants}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-br from-zinc-50 to-emerald-50/20 border border-zinc-200/60 shadow-2xs"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-0.5">
                      <ShieldCheck className="w-3 h-3" /> Signed In As
                    </div>
                    <p className="truncate text-xs font-bold text-zinc-900">
                      {userEmail}
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                          <LogOut className="w-4 h-4 stroke-2" />
                        </div>
                        Sign out securely
                      </button>
                    </form>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </header>

      {mounted && !isSetupRoute &&
        createPortal(
          <nav
            className="fixed inset-x-0 bottom-0 z-[9999] border-t border-zinc-200/80 bg-white/95 backdrop-blur-xl md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
              {mobileBottomLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all active:scale-95",
                      isActive
                        ? "text-emerald-600"
                        : "text-zinc-400 hover:text-zinc-700"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all",
                        isActive ? "stroke-[2.5]" : "stroke-2"
                      )}
                    />

                    <span className="text-[10px] font-bold">
                      {link.label}
                    </span>

                    {isActive && (
                      <span className="absolute -top-0.5 h-1 w-6 rounded-full bg-emerald-500" />
                    )}

                    {link.label === "Matches" && (
                      <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>,
          document.body
        )}
    </>
  );
}
