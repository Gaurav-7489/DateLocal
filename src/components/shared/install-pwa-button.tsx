"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<"idle" | "launching" | "installed">("idle");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setStatus("installed");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isStandalone || (!deferredPrompt && status !== "launching")) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setStatus("launching");

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setStatus("installed");
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  return (
    <button
      onClick={handleInstallClick}
      disabled={status === "launching" || status === "installed"}
      aria-label="Install DateBu App"
      className="group relative flex items-center gap-2 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 transition-all duration-300 hover:bg-emerald-500/20 active:scale-95 disabled:pointer-events-none dark:text-emerald-400"
    >
      {status === "launching" && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent transition-transform animate-[gpu-shimmer_1.2s_infinite]" />
      )}

      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        {status === "idle" && (
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}

        {status === "launching" && (
          <svg
            className="h-4 w-4 animate-spin text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}

        {status === "installed" && (
          <svg
            className="h-4 w-4 scale-110 text-emerald-500 transition-transform animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>

      <span className="relative font-medium tracking-wide">
        {status === "idle" && "Install DateBu"}
        {status === "launching" && "Opening installer..."}
        {status === "installed" && "App Ready!"}
      </span>
    </button>
  );
}
