"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";
import { Compass, Heart, MessageSquare, User, LogOut, Menu, X, Download, Crown, Shield, Loader2, UsersRound, UserPlus, Flame } from "lucide-react";

const primaryLinks = [
  { href: routes.discover, label: "Swipe", icon: Flame },
  { href: routes.social, label: "Explore", icon: Compass },
  { href: routes.likes, label: "Likes", icon: Heart },
  { href: routes.messages, label: "Chat", icon: MessageSquare },
  { href: routes.profile, label: "Profile", icon: User },
];
const secondaryLinks = [{ href: routes.matches, label: "Matches" }, { href: routes.settings, label: "Settings" }];
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }> };
interface AppNavbarProps { userEmail: string; isSuperAdmin?: boolean; }

export function AppNavbar({ userEmail, isSuperAdmin = false }: AppNavbarProps) {
  const pathname = usePathname(); const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null); const [isStandalone, setIsStandalone] = useState(false); const [installing, setInstalling] = useState(false); const [showInstallHelp, setShowInstallHelp] = useState(false);
  const isSetupRoute = pathname.includes("/profile/setup");
  const isDatingRoute = pathname.startsWith(routes.discover) || pathname.startsWith(routes.social) || pathname.startsWith(routes.likes) || pathname.startsWith(routes.messages) || pathname.startsWith(routes.profile);
  const handleInstall = useCallback(async () => { if (installPrompt) { setInstalling(true); try { await installPrompt.prompt(); const choice = await installPrompt.userChoice; if (choice.outcome === "accepted") setInstallPrompt(null); } catch {} finally { setInstalling(false); } return; } setShowInstallHelp(true); }, [installPrompt]);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}); const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone); setIsStandalone(standalone); const onInstallPrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); }; const onInstalled = () => { setInstallPrompt(null); setIsStandalone(true); }; window.addEventListener("beforeinstallprompt", onInstallPrompt); window.addEventListener("appinstalled", onInstalled); return () => { window.removeEventListener("beforeinstallprompt", onInstallPrompt); window.removeEventListener("appinstalled", onInstalled); }; }, []);
  useEffect(() => { if (!isSetupRoute) { primaryLinks.forEach((link) => router.prefetch(link.href)); router.prefetch(routes.matches); router.prefetch(routes.settings); } }, [router, isSetupRoute]);
  useEffect(() => setMenuOpen(false), [pathname]);

  if (isSetupRoute) return <header className="hidden sticky top-0 z-50 border-b border-zinc-800 bg-black/95 text-white backdrop-blur-xl md:block"><nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"><Link href={routes.discover} className="flex items-center gap-2.5"><Image src="/icon-512.png" alt="Extrovert" width={34} height={34} className="rounded-xl" priority/><span className="text-sm font-black tracking-tight">{universityConfig.appName}</span></Link><form action={signOut}><button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200"><LogOut className="h-3.5 w-3.5"/> Sign out</button></form></nav></header>;

  return <>
    <header className={cn("hidden sticky top-0 z-50 border-b backdrop-blur-xl md:block", isDatingRoute ? "border-zinc-900 bg-black/90 text-white" : "border-zinc-200/80 bg-white/95 text-zinc-950")}>
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main navigation">
        <Link href={routes.discover} className="flex shrink-0 items-center gap-2.5"><Image src="/icon-512.png" alt="Extrovert" width={34} height={34} className="rounded-xl" priority/><span className="hidden text-sm font-black tracking-tight sm:block">Extrovert</span></Link>
        <div className="hidden items-center gap-1 md:flex">{primaryLinks.map((link)=>{const Icon=link.icon;const active=pathname===link.href||pathname.startsWith(`${link.href}/`);return <Link key={link.href} href={link.href} className={cn("flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors",active?(isDatingRoute?"bg-white/10 text-white":"bg-zinc-100 text-zinc-950"):(isDatingRoute?"text-zinc-400 hover:bg-white/10 hover:text-white":"text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"))}><Icon className="h-4 w-4"/>{link.label}</Link>})}</div>
        <div className="hidden items-center gap-2 md:flex">{!isStandalone&&<button type="button" onClick={handleInstall} disabled={installing} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold disabled:opacity-60",isDatingRoute?"border-white/15 bg-white/10 text-white":"border-emerald-200 bg-emerald-50 text-emerald-700")}>{installing?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Download className="h-3.5 w-3.5"/>}{installing?"Opening":"Install"}</button>}<div className="relative"><button type="button" onClick={()=>setMenuOpen((open)=>!open)} aria-expanded={menuOpen} className={cn("flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold",isDatingRoute?"border-white/15 bg-white/10 text-white":"border-zinc-200 bg-white text-zinc-700")}><span className={cn("grid h-7 w-7 place-items-center rounded-full text-[11px] font-black",isDatingRoute?"bg-white text-black":"bg-zinc-900 text-white")}>{userEmail.charAt(0).toUpperCase()}</span><span className="max-w-24 truncate">{userEmail.split("@")[0]}</span></button>{menuOpen&&<div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-800 shadow-xl"><div className="px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Account</p><p className="mt-0.5 truncate text-xs font-bold">{userEmail}</p></div>{secondaryLinks.map(link=><Link key={link.href} href={link.href} className="block rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50">{link.label}</Link>)}<Link href={routes.extrovert} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-700"><Crown className="h-3.5 w-3.5"/>Beyond</Link>{isSuperAdmin&&<Link href={routes.admin.root} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-700"><Shield className="h-3.5 w-3.5"/>Admin</Link>}<form action={signOut} className="mt-1 border-t border-zinc-100 pt-1"><button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600"><LogOut className="h-3.5 w-3.5"/> Sign out</button></form></div>}</div></div>
      </nav>
    </header>
    {showInstallHelp&&<div className="fixed inset-0 z-[100] grid place-items-end bg-black/70 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label="Install Extrovert"><div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-sm font-black">Install Extrovert</h2><p className="mt-1 text-xs text-zinc-500">Add it to your home screen for quick access.</p></div><button type="button" onClick={()=>setShowInstallHelp(false)} className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100"><X className="h-4 w-4"/></button></div><div className="mt-4 space-y-2 text-xs text-zinc-700"><p className="rounded-xl bg-zinc-50 p-3">On iPhone/iPad: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p><p className="rounded-xl bg-zinc-50 p-3">On supported browsers: use the browser&apos;s <strong>Install app</strong> option.</p></div><button type="button" onClick={()=>setShowInstallHelp(false)} className="mt-4 w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white">Done</button></div></div>}
  </>;
}
