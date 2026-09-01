"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, BellRing, X } from "lucide-react";

function base64UrlToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

async function syncPushSubscription() {
  const registration = await registerServiceWorker();
  if (!registration || !("PushManager" in window) || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") return false;

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(existing.toJSON()),
    });
    return true;
  }

  const keyResponse = await fetch("/api/push/vapid-public-key", { cache: "no-store" });
  if (!keyResponse.ok) throw new Error("Push service is unavailable.");
  const { publicKey } = await keyResponse.json();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(publicKey),
  });

  const saveResponse = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });

  if (!saveResponse.ok) throw new Error("Couldn't save notification subscription.");
  return true;
}

export function PushNotifications() {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      const canPush =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window &&
        window.isSecureContext;

      if (!canPush) {
        if (!cancelled) setPermission("unsupported");
        return;
      }

      await registerServiceWorker();
      const currentPermission = Notification.permission;
      if (cancelled) return;

      setSupported(true);
      setPermission(currentPermission);

      if (currentPermission === "granted") {
        try {
          await syncPushSubscription();
        } catch (pushError) {
          console.warn("[DateBu] Push subscription sync failed", pushError);
        }
      } else if (
        currentPermission === "default" &&
        localStorage.getItem("datebu-push-prompt-dismissed") !== "1"
      ) {
        setShowPrompt(true);
      }
    };

    void setup();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mounted || !supported || permission === "denied" || permission === "unsupported" || !showPrompt) {
    return null;
  }

  const enable = async () => {
    setBusy(true);
    setError(null);

    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        setShowPrompt(false);
        return;
      }

      await syncPushSubscription();
      setShowPrompt(false);
    } catch (pushError) {
      console.error("[DateBu] Failed to enable push notifications", pushError);
      setError("Couldn't enable notifications. Try again from this device.");
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem("datebu-push-prompt-dismissed", "1");
    setShowPrompt(false);
  };

  return createPortal(
    <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[100000] mx-auto max-w-sm sm:bottom-6">
      <div className="rounded-3xl border border-emerald-200/80 bg-white/98 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <BellRing className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 pr-1">
            <p className="text-sm font-black text-zinc-950">Stay in the loop</p>
            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
              Get notified when someone likes you, you match, or a new message arrives.
            </p>
            {error && <p className="mt-1.5 text-[10px] font-semibold text-red-600">{error}</p>}
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Dismiss notification prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void enable()}
          disabled={busy}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-3 py-3 text-xs font-black text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.985] disabled:cursor-wait disabled:opacity-60"
        >
          <Bell className="h-4 w-4" />
          {busy ? "Enabling…" : "Enable notifications"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
