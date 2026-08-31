"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const STATUS_POLL_MS = 1500;
const STATUS_POLL_ATTEMPTS = 40;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function FaceVerificationPage() {
  const router = useRouter();
  const startedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  const checkStatus = useCallback(async () => {
    const response = await fetch("/api/didit/status", {
      method: "GET",
      cache: "no-store",
    });

    const data = (await response.json().catch(() => ({}))) as {
      status?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error || "Unable to check verification status.");
    }

    return data.status ?? "pending";
  }, []);

  const waitForServerDecision = useCallback(async () => {
    for (let attempt = 0; attempt < STATUS_POLL_ATTEMPTS; attempt += 1) {
      const currentStatus = await checkStatus();
      setStatus(currentStatus);

      if (currentStatus === "verified") {
        router.replace("/app");
        router.refresh();
        return;
      }

      if (currentStatus === "rejected") {
        setError("Verification was not approved. You can try again.");
        return;
      }

      await sleep(STATUS_POLL_MS);
    }

    setError("Verification is still processing. Please wait a moment and try again.");
  }, [checkStatus, router]);

  const startVerification = useCallback(async () => {
    setStarting(true);
    setError("");
    setStatus("pending");

    try {
      const response = await fetch("/api/didit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to start face verification.");
      }

      const { DiditSdk } = await import("@didit-protocol/sdk-web");

      DiditSdk.shared.onComplete = (result) => {
        if (result.type === "failed") {
          setError(result.error?.message || "Verification failed. Please try again.");
          return;
        }

        if (result.type === "cancelled") {
          setError("Verification was cancelled. You can start it again when ready.");
          return;
        }

        void waitForServerDecision();
      };

      DiditSdk.shared.onStateChange = (state, sdkError) => {
        if (state === "error") {
          setError(sdkError || "The verification window could not be opened.");
          setStarting(false);
        }
      };

      DiditSdk.shared.startVerification({
        url: data.url,
        configuration: {
          loggingEnabled: false,
          embedded: true,
          embeddedContainerId: "datebu-didit-container",
          showCloseButton: true,
          showExitConfirmation: true,
          closeModalOnComplete: false,
          zIndex: 20,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start face verification.");
    } finally {
      setStarting(false);
      setLoading(false);
    }
  }, [waitForServerDecision]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void startVerification();
  }, [startVerification]);

  useEffect(() => {
    return () => {
      void import("@didit-protocol/sdk-web")
        .then(({ DiditSdk }) => {
          DiditSdk.shared.onComplete = undefined;
          DiditSdk.shared.onStateChange = undefined;
          DiditSdk.shared.destroy();
        })
        .catch(() => undefined);
    };
  }, []);

  const isVerified = status === "verified";

  return (
    <main className="min-h-[100dvh] bg-[#f7faf8] text-zinc-950">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))] sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
            DateBu verification
          </div>

          <div className="w-10" />
        </header>

        <section className="px-4 pb-4 text-center sm:px-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            {isVerified ? <CheckCircle2 className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
          </div>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">Verify it&apos;s really you</h1>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-zinc-500 sm:text-sm">
            Take a quick face check using your camera. Your DateBu profile photo is used as the reference.
          </p>
        </section>

        <section className="mx-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.07)] sm:mx-6">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-zinc-800">Secure camera check</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-400">Secured by Didit</span>
          </div>

          <div className="relative min-h-[620px] flex-1 bg-zinc-50 sm:min-h-[680px]">
            {(loading || starting) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 text-center backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
                <p className="text-sm font-bold">Preparing your verification</p>
                <p className="mt-1 max-w-xs px-4 text-xs leading-5 text-zinc-500">
                  The secure camera check will appear here in a moment.
                </p>
              </div>
            )}

            <div
              id="datebu-didit-container"
              className="h-full min-h-[620px] w-full overflow-hidden sm:min-h-[680px]"
            />

            {error && !loading && !starting && (
              <div className="absolute inset-x-4 bottom-4 z-30 rounded-2xl border border-rose-200 bg-white p-4 shadow-lg sm:inset-x-6">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900">Verification needs another try</p>
                    <p className="mt-1 text-[11px] leading-4 text-zinc-500">{error}</p>
                    <button
                      type="button"
                      onClick={() => void startVerification()}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))] text-center sm:px-6">
          <p className="mx-auto max-w-lg text-[10px] leading-4 text-zinc-400 sm:text-[11px]">
            Your verification result is confirmed securely on the server. DateBu never treats the browser alone as proof of verification.
          </p>
        </footer>
      </div>
    </main>
  );
}
