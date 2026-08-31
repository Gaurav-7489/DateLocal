"use client";

import {
  useEffect,
  useState,
  useCallback,
  Suspense,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FlowStep =
  | "loading"
  | "redirecting"
  | "verifying"
  | "verified"
  | "error";

type DiditSessionResponse = {
  url?: string;
  sessionId?: string;
};

type DiditStatusResponse = {
  status?: string;
};

function VerificationContent() {
  const [step, setStep] = useState<FlowStep>("loading");
  const [error, setError] = useState<string | null>(null);

  const startingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startVerification = useCallback(async () => {
    if (startingRef.current) {
      return;
    }

    startingRef.current = true;

    if (mountedRef.current) {
      setStep("loading");
      setError(null);
    }

    try {
      const res = await fetch("/api/didit/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      let data: DiditSessionResponse = {};

      try {
        data = (await res.json()) as DiditSessionResponse;
      } catch {
        throw new Error("Invalid verification server response.");
      }

      if (!res.ok) {
        throw new Error(
          data && "url" in data
            ? "Failed to start verification."
            : "Failed to start verification.",
        );
      }

      if (!data.url) {
        throw new Error("Verification service did not return a session URL.");
      }

      if (!mountedRef.current) {
        return;
      }

      setStep("redirecting");

      /*
       * Full-page navigation is intentional here.
       *
       * Didit owns the verification UI after this point.
       * We do not load a heavy verification SDK into the DateBu
       * bundle, keeping the DateBu verification page lightweight.
       */
      window.location.assign(data.url);
    } catch (err: unknown) {
      if (!mountedRef.current) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Failed to start verification.";

      setError(message);
      setStep("error");
      startingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void startVerification();
  }, [startVerification]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8">
      <Card className="w-full space-y-6 border-border bg-card p-6 text-center shadow-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-black tracking-tight text-foreground">
            Identity Verification
          </h1>

          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Complete a quick secure verification to confirm your identity.
          </p>
        </div>

        <div className="flex min-h-[120px] items-center justify-center">
          {step === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2
                className="h-8 w-8 animate-spin text-emerald-600"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold text-foreground/80">
                Starting verification...
              </p>
            </div>
          )}

          {step === "redirecting" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2
                className="h-8 w-8 animate-spin text-emerald-600"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold text-foreground/80">
                Redirecting to secure verification...
              </p>
            </div>
          )}

          {step === "verifying" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2
                className="h-8 w-8 animate-spin text-emerald-600"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold text-foreground/80">
                Verification in progress...
              </p>
            </div>
          )}

          {step === "verified" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2
                className="h-10 w-10 text-emerald-600"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold text-foreground/80">
                Identity verified
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle
                className="h-8 w-8 text-rose-500"
                aria-hidden="true"
              />

              <p className="max-w-xs text-xs font-semibold text-rose-600">
                {error ?? "Failed to initialize verification."}
              </p>
            </div>
          )}
        </div>

        {step === "error" && (
          <Button
            type="button"
            onClick={() => {
              void startVerification();
            }}
            className="w-full gap-2 rounded-2xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Try Again
          </Button>
        )}
      </Card>
    </div>
  );
}

function VerificationSuspense() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      pollingStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const verificationSessionId =
      searchParams.get("verificationSessionId");

    const status = searchParams.get("status");

    const errorParam = searchParams.get("error");

    /*
     * Didit approved callback.
     *
     * The callback means the Didit flow reached its approved state,
     * but DateBu still waits for our verified database state.
     */
    if (verificationSessionId && status === "Approved") {
      if (pollingStartedRef.current) {
        return;
      }

      pollingStartedRef.current = true;

      let attempts = 0;

      const maxAttempts = 30;
      const intervalMs = 2000;

      const checkStatus = async () => {
        if (!mountedRef.current) {
          return;
        }

        attempts++;

        try {
          const res = await fetch("/api/didit/status", {
            method: "GET",
            cache: "no-store",
          });

          if (!res.ok) {
            throw new Error("Failed to check verification status.");
          }

          const data =
            (await res.json()) as DiditStatusResponse;

          if (!mountedRef.current) {
            return;
          }

          if (data.status === "verified") {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            setTimeout(() => {
              if (mountedRef.current) {
                router.replace("/app");
              }
            }, 0);

            return;
          }

          if (
            data.status === "rejected" ||
            data.status === "declined"
          ) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            window.location.replace("/verify/face");
            return;
          }

          if (attempts >= maxAttempts) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            window.location.replace(
              "/verify/face?error=timeout",
            );
          }
        } catch {
          /*
           * Keep retrying transient network/server failures.
           *
           * We intentionally do not surface every temporary failure
           * to the user because that would create unnecessary UI
           * churn during webhook/database propagation.
           */

          if (attempts >= maxAttempts) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            window.location.replace(
              "/verify/face?error=timeout",
            );
          }
        }
      };

      /*
       * Check immediately instead of making the user wait 2 seconds
       * for the first request.
       */
      void checkStatus();

      pollingRef.current = setInterval(() => {
        void checkStatus();
      }, intervalMs);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        pollingStartedRef.current = false;
      };
    }

    /*
     * Didit explicitly declined the verification.
     */
    if (status === "Declined") {
      window.location.replace(
        "/verify/face?error=declined",
      );

      return;
    }

    /*
     * Timeout/declined states are handled without creating
     * another verification session automatically.
     *
     * This prevents accidental session loops.
     */
    if (errorParam === "timeout") {
      return;
    }

    if (errorParam === "declined") {
      return;
    }

    return undefined;
  }, [searchParams, router]);

  return <VerificationContent />;
}

export default function FaceVerificationPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <VerificationSuspense />
    </Suspense>
  );
}

function Fallback() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8">
      <Card className="w-full space-y-6 border-border bg-card p-6 text-center shadow-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck
              className="h-6 w-6"
              aria-hidden="true"
            />
          </div>

          <h1 className="text-xl font-black tracking-tight text-foreground">
            Identity Verification
          </h1>

          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Complete a quick secure verification to confirm your identity.
          </p>
        </div>

        <div className="flex min-h-[120px] items-center justify-center">
          <Loader2
            className="h-8 w-8 animate-spin text-emerald-600"
            aria-hidden="true"
          />
        </div>
      </Card>
    </div>
  );
}