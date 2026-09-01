"use client";

import { useEffect, useState } from "react";
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
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!supported || permission === "denied" || permission === "unsupported" || !showPrompt) {
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

  return (
    <div className="fixed inset-x-3 bottom-4 z-[9998] mx-auto max-w-sm">
      <div className="rounded-2xl border border-border/80 bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <BellRing className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 pr-1">
            <p className="text-sm font-black text-foreground">Stay in the loop</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              Get notified when someone likes you, you match, or a new message arrives.
            </p>
            {error && <p className="mt-1 text-[10px] font-semibold text-red-600">{error}</p>}
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss notification prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void enable()}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-3 py-2.5 text-xs font-black text-background transition-opacity disabled:opacity-60"
        >
          <Bell className="h-4 w-4" />
          {busy ? "Enabling…" : "Enable notifications"}
        </button>
      </div>
    </div>
  );
}
