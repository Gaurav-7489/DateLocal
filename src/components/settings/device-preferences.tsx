"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone, Vibrate } from "lucide-react";
import { InstallPwaButton } from "@/components/shared/install-pwa-button";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

async function syncPushSubscription() {
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  if (!("PushManager" in window) || !("Notification" in window)) return false;
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    const response = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(existing.toJSON()) });
    if (!response.ok) throw new Error("Couldn't save notification settings.");
    return true;
  }
  const keyResponse = await fetch("/api/push/vapid-public-key", { cache: "no-store" });
  if (!keyResponse.ok) throw new Error("Notification service is unavailable.");
  const { publicKey } = await keyResponse.json();
  const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
  const raw = window.atob((publicKey + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const key = Uint8Array.from(raw, (char) => char.charCodeAt(0));
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const response = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription.toJSON()) });
  if (!response.ok) throw new Error("Couldn't save notification settings.");
  return true;
}

export function DevicePreferences() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);

  useEffect(() => {
    setHapticsEnabled(localStorage.getItem("extrovert_date_haptics") !== "off");
    const canNotify = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window && window.isSecureContext;
    setStandalone(isStandalone());
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window));
    if (canNotify) {
      setNotificationPermission(Notification.permission);
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        setNotificationsEnabled(Boolean(subscription) && Notification.permission === "granted");
      }).catch(() => undefined);
    } else setNotificationPermission("unsupported");
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallAvailable(true); };
    const handleInstalled = () => { setStandalone(true); setInstallAvailable(false); };
    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", handleInstall); window.removeEventListener("appinstalled", handleInstalled); };
  }, []);

  function toggleHaptics() {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem("extrovert_date_haptics", next ? "on" : "off");
    if (next && "vibrate" in navigator) navigator.vibrate(8);
  }

  async function toggleNotifications() {
    if (busy || notificationPermission === "unsupported") return;
    setBusy(true); setMessage(null);
    try {
      if (notificationsEnabled) {
        const registration = await navigator.serviceWorker.getRegistration("/");
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          const response = await fetch("/api/push/unsubscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
          if (!response.ok) throw new Error("Couldn't disable notifications.");
          await subscription.unsubscribe();
        }
        setNotificationsEnabled(false); setMessage("Extrovert Date notifications are off on this device.");
      } else {
        const permission = await Notification.requestPermission(); setNotificationPermission(permission);
        if (permission !== "granted") { setMessage(permission === "denied" ? "Notifications are blocked by your browser." : "Notification permission was not granted."); return; }
        await syncPushSubscription(); setNotificationsEnabled(true); setMessage("Extrovert Date notifications are on for likes, matches and dating messages.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't update Extrovert Date device settings.");
    } finally { setBusy(false); }
  }

  return <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
    <div><h2 className="text-base font-bold text-foreground">Extrovert Date · App &amp; Notifications</h2><p className="mt-1 text-xs text-muted-foreground">Dating notifications and device preferences are controlled by Extrovert Date on this browser/device.</p></div>
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-3.5"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">{notificationsEnabled?<Bell className="h-4 w-4"/>:<BellOff className="h-4 w-4"/>}</div><div className="min-w-0"><p className="text-xs font-bold text-foreground">Dating notifications</p><p className="mt-0.5 text-[10px] text-muted-foreground">{notificationPermission==="unsupported"?"Not supported in this browser":notificationsEnabled?"Likes, matches and dating messages can notify your device":"Notifications are currently off"}</p></div></div><button type="button" onClick={()=>void toggleNotifications()} disabled={busy||notificationPermission==="unsupported"} className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${notificationsEnabled?"bg-emerald-600":"bg-zinc-300 dark:bg-zinc-700"}`} aria-label={notificationsEnabled?"Turn dating notifications off":"Turn dating notifications on"} aria-pressed={notificationsEnabled}><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${notificationsEnabled?"translate-x-5":"translate-x-0"}`}/></button></div>
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-3.5"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50"><Vibrate className="h-4 w-4"/></div><div className="min-w-0"><p className="text-xs font-bold text-foreground">Haptics</p><p className="mt-0.5 text-[10px] text-muted-foreground">Small vibration feedback for taps, where supported.</p></div></div><button type="button" onClick={toggleHaptics} className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${hapticsEnabled?"bg-violet-600":"bg-zinc-300 dark:bg-zinc-700"}`} aria-label={hapticsEnabled?"Turn haptics off":"Turn haptics on"} aria-pressed={hapticsEnabled}><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${hapticsEnabled?"translate-x-5":"translate-x-0"}`}/></button></div>
    {message&&<p className="text-[10px] font-semibold text-muted-foreground">{message}</p>}
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-3.5"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50"><Smartphone className="h-4 w-4"/></div><div className="min-w-0"><p className="text-xs font-bold text-foreground">Install Extrovert Date</p><p className="mt-0.5 text-[10px] text-muted-foreground">{standalone?"Extrovert Date is installed on this device":ios?"Use Share → Add to Home Screen":installAvailable?"Ready to install as an app":"Install availability depends on your browser"}</p></div></div>{standalone?<span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">Installed</span>:<InstallPwaButton/>}</div>
  </div>;
}
