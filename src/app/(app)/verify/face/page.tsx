"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const STATUS_POLL_MS = 1500;
const STATUS_POLL_ATTEMPTS = 40;

type DiditResult = {
  type?: "completed" | "cancelled" | "failed" | string;
  session?: {
    sessionId?: string;
    status?: string;
  };
  error?: {
    message?: string;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function FaceVerificationPage() {
  const router = useRouter();
  const startedRef = useRef(false);
  const sdkRef = useRef<import("@didit-protocol/sdk-web").DiditSdk | null>(null);

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
      try {
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
      } catch (err) {
        if (attempt === STATUS_POLL_ATTEMPTS - 1) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to confirm verification status.",
          );
          return;
        }
      }

      await sleep(STATUS_POLL_MS);
    }

    setError(
      "Verification is still processing. Please wait a moment and try again.",
    );
  }, [checkStatus, router]);

  const startVerification = useCallback(async () => {
    if (starting) return;

    setStarting(true);
    setLoading(true);
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
      const sdk = DiditSdk.shared;
      sdkRef.current = sdk;

      sdk.onComplete = (result) => {
        const verificationResult = result as DiditResult;

        if (verificationResult.type === "cancelled") {
          setError("Verification was cancelled. You can try again.");
          return;
        }

        if (verificationResult.type === "failed") {
          setError(
            verificationResult.error?.message ||
              "Didit could not complete the verification.",
          );
          return;
        }

        if (verificationResult.type === "completed") {
          // The SDK result is only a UI signal. The signed webhook remains
          // the source of truth for DateBu's verified state.
          void waitForServerDecision();
        }
      };

      sdk.onStateChange = (state, sdkError) => {
        if (state === "error") {
          setError(sdkError || "The verification window could not be opened.");
          setStarting(false);
          setLoading(false);
        }
      };

      sdk.onEvent = (event) => {
        if (event.type === "didit:ready") {
          setLoading(false);
        }

        if (event.type === "didit:error") {
          const eventData = event.data as { error?: string } | undefined;
          setError(eventData?.error || "Verification encountered an error.");
        }
      };

      sdk.startVerification({
        url: data.url,
        configuration: {
          loggingEnabled: false,
          showCloseButton: true,
          showExitConfirmation: true,
          closeModalOnComplete: false,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start face verification.",
      );
    } finally {
      setStarting(false);
      setLoading(false);
    }
  }, [starting, waitForServerDecision]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void startVerification();
  }, [startVerification]);

  useEffect(() => {
    return () => {
      const sdk = sdkRef.current;

      if (!sdk) return;

      sdk.onComplete = undefined;
      sdk.onStateChange = undefined;
      sdk.onEvent = undefined;
      sdk.destroy();
      sdkRef.current = null;
    };
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[#f7fbf9] px-4 py-8 text-zinc-900">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            {status === "verified" ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <Camera className="h-7 w-7" />
            )}
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Identity verification
          </div>

          <h1 className="text-2xl font-black tracking-tight">
            Verify it&apos;s really you
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
            Complete the secure camera check. Your DateBu profile photo is used
            as the reference for face matching.
          </p>
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          {loading || starting ? (
            <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <Loader2 className="mb-3 h-7 w-7 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Preparing verification...</p>
              <p className="mt-1 text-xs text-zinc-500">
                Camera access will be requested by the verification window.
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>

              <p className="text-sm font-semibold text-zinc-900">
                Verification needs another try
              </p>

              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void startVerification()}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try verification again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">
                Checking verification result...
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                We&apos;re waiting for the server to confirm your result.
              </p>
            </div>
          )}
        </section>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-400">
          Verification decisions are confirmed server-side. Closing the camera
          window before completion will not mark your account as verified.
        </p>
      </div>
    </main>
  );
}
