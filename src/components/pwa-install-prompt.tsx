"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __datebuInstallPrompt?: BeforeInstallPromptEvent | null;
    MSStream?: unknown;
  }
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    setIos(isIOS());

    // The service worker is required for the installable PWA experience.
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("[DateBu] Service worker registration failed:", error);
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      window.__datebuInstallPrompt = promptEvent;
      setInstallEvent(promptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      window.__datebuInstallPrompt = null;
      setInstallEvent(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // On iOS there is no beforeinstallprompt event, so provide the manual
    // install instructions instead.
    const showIOSPrompt = isIOS() && sessionStorage.getItem("datebu-pwa-dismissed") !== "1";
    if (showIOSPrompt) {
      const timer = window.setTimeout(() => setVisible(true), 1800);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      if (ios) return;
      setVisible(false);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setVisible(false);
    }

    setInstallEvent(null);
    window.__datebuInstallPrompt = null;
  }

  function dismiss() {
    sessionStorage.setItem("datebu-pwa-dismissed", "1");
    setVisible(false);
  }

  if (!visible || isStandalone()) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 z-[9998] mx-auto max-w-sm">
      <div className="relative rounded-3xl border border-emerald-200 bg-white p-4 shadow-2xl shadow-black/15">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="absolute right-2 top-2 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-zinc-950">Install DateBu</h3>
            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">
              Add DateBu to your home screen for a faster app-like experience.
            </p>
          </div>
        </div>

        {ios ? (
          <div className="mt-3 rounded-2xl bg-zinc-50 p-3 text-[11px] leading-relaxed text-zinc-600">
            Tap <Share className="mx-0.5 inline h-3.5 w-3.5 text-blue-600" />
            <strong> Share</strong>, then choose <strong>Add to Home Screen</strong>.
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void handleInstall()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
