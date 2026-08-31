"use client";

import {
  useEffect,
  useState,
  useCallback,
  Suspense,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DiditSdk } from "@didit-protocol/sdk-web";
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
  const router = useRouter();

  const [step, setStep] = useState<FlowStep>("loading");
  const [error, setError] = useState<string | null>(null);
  const [diditContainer, setDiditContainer] =
    useState<HTMLDivElement | null>(null);

  const sdkRef = useRef<DiditSdk | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const pollingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (sdkRef.current) {
        try {
          sdkRef.current.destroy();
        } catch (err) {
          console.error("Didit cleanup error:", err);
        }
      }

      sdkRef.current = null;
    };
  }, []);

  const waitForVerification = useCallback(async () => {
    if (
      pollingRef.current ||
      !mountedRef.current
    ) {
      return;
    }

    pollingRef.current = true;

    const maxAttempts = 40;
    const intervalMs = 1500;

    try {
      for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
      ) {
        if (!mountedRef.current) {
          return;
        }

        try {
          const response = await fetch(
            "/api/didit/status",
            {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (response.ok) {
            const data =
              (await response.json()) as DiditStatusResponse;

            const status = String(
              data.status ?? "",
            ).toLowerCase();

            if (status === "verified") {
              if (mountedRef.current) {
                setStep("verified");
                setError(null);

                window.setTimeout(() => {
                  if (mountedRef.current) {
                    router.replace("/app");
                  }
                }, 350);
              }

              return;
            }

            if (
              status === "rejected" ||
              status === "declined"
            ) {
              if (mountedRef.current) {
                setStep("error");
                setError(
                  "Face verification was not approved. Please try again.",
                );
              }

              return;
            }
          }
        } catch {
          // Temporary network failure. Try again.
        }

        if (attempt < maxAttempts - 1) {
          await new Promise<void>((resolve) => {
            window.setTimeout(
              resolve,
              intervalMs,
            );
          });
        }
      }

      if (mountedRef.current) {
        setStep("error");
        setError(
          "Verification confirmation is taking longer than expected. Please try again.",
        );
      }
    } finally {
      pollingRef.current = false;
    }
  }, [router]);

  const startVerification = useCallback(
    async () => {
      if (
        startingRef.current ||
        !mountedRef.current ||
        !diditContainer
      ) {
        return;
      }

      startingRef.current = true;

      setStep("loading");
      setError(null);

      try {
        const response = await fetch(
          "/api/didit/session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        let data: DiditSessionResponse = {};

        try {
          data =
            (await response.json()) as DiditSessionResponse;
        } catch {
          throw new Error(
            "Invalid verification server response.",
          );
        }

        if (!response.ok) {
          throw new Error(
            "Failed to create verification session.",
          );
        }

        if (!data.url) {
          throw new Error(
            "Verification service did not return a session URL.",
          );
        }

        if (!mountedRef.current) {
          return;
        }

        const containerId =
          "datebu-didit-verification";

        diditContainer.id = containerId;
        diditContainer.innerHTML = "";

        if (sdkRef.current) {
          try {
            sdkRef.current.destroy();
          } catch (err) {
            console.error(
              "Didit SDK cleanup error:",
              err,
            );
          }

          sdkRef.current = null;
        }

        const sdk = DiditSdk.shared;

        sdkRef.current = sdk;

        sdk.onStateChange = (
          state,
          sdkError,
        ) => {
          if (!mountedRef.current) {
            return;
          }

          if (state === "loading") {
            setStep("loading");
          }

          if (state === "ready") {
            setStep("verifying");
          }

          if (state === "error") {
            setStep("error");

            setError(
              sdkError ||
                "Unable to load face verification.",
            );

            startingRef.current = false;
          }
        };

        sdk.onEvent = (event) => {
          if (!mountedRef.current) {
            return;
          }

          if (
            event.type === "didit:started" ||
            event.type === "didit:ready" ||
            event.type === "didit:step_started" ||
            event.type === "didit:step_changed" ||
            event.type === "didit:media_started" ||
            event.type === "didit:media_captured" ||
            event.type === "didit:verification_submitted"
          ) {
            setStep("verifying");
          }

          if (
            event.type === "didit:completed"
          ) {
            setStep("verifying");
            void waitForVerification();
          }

          if (
            event.type === "didit:error"
          ) {
            setStep("error");

            setError(
              event.data?.error ||
                "Face verification failed. Please try again.",
            );

            startingRef.current = false;
          }

          if (
            event.type === "didit:cancelled"
          ) {
            setStep("error");
            setError(
              "Verification was cancelled. Please try again.",
            );

            startingRef.current = false;
          }
        };

        sdk.onComplete = (result) => {
          if (!mountedRef.current) {
            return;
          }

          if (
            result.type === "completed"
          ) {
            setStep("verifying");

            void waitForVerification();

            return;
          }

          if (
            result.type === "cancelled"
          ) {
            setStep("error");

            setError(
              "Verification was cancelled. Please try again.",
            );

            startingRef.current = false;

            return;
          }

          if (
            result.type === "failed"
          ) {
            setStep("error");

            setError(
              result.error?.message ||
                "Face verification failed. Please try again.",
            );

            startingRef.current = false;
          }
        };

        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              resolve();
            });
          });
        });

        if (!mountedRef.current) {
          return;
        }

        setStep("verifying");

        await sdk.startVerification({
          url: data.url,

          configuration: {
            embedded: true,
            embeddedContainerId: containerId,
            loggingEnabled: false,

            showCloseButton: true,
            showExitConfirmation: true,
            closeModalOnComplete: false,

            zIndex: 50,
          },
        });

        if (mountedRef.current) {
          setStep("verifying");
        }
      } catch (err: unknown) {
        console.error(
          "Didit verification error:",
          err,
        );

        if (!mountedRef.current) {
          return;
        }

        setStep("error");

        setError(
          err instanceof Error
            ? err.message
            : "Failed to start verification.",
        );
      } finally {
        startingRef.current = false;
      }
    },
    [
      diditContainer,
      waitForVerification,
    ],
  );

  useEffect(() => {
    if (!diditContainer) {
      return;
    }

    void startVerification();
  }, [
    diditContainer,
    startVerification,
  ]);

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center px-4 py-8">
      <Card className="w-full overflow-hidden border-border bg-card shadow-xl">
        <div className="space-y-6 p-6 text-center">

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h1 className="text-xl font-black tracking-tight text-foreground">
              Face Verification
            </h1>

            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Complete a quick face verification
              to confirm your identity.
            </p>
          </div>

          <div
            ref={setDiditContainer}
            id="datebu-didit-verification"
            className="relative min-h-[500px] w-full overflow-hidden rounded-2xl"
            aria-label="Didit face verification"
          />

          <div className="flex min-h-[44px] items-center justify-center px-1">
            {error ? (
              <div className="flex w-full items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-left text-xs font-semibold text-rose-500">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />

                <span>{error}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                {step === "verified" ? (
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-emerald-600"
                    aria-hidden="true"
                  />
                ) : (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin text-emerald-600"
                    aria-hidden="true"
                  />
                )}

                <span>
                  {step === "loading" &&
                    "Preparing face verification..."}

                  {step === "verifying" &&
                    "Face verification in progress..."}

                  {step === "verified" &&
                    "Face verified"}
                </span>
              </div>
            )}
          </div>

          {step === "error" && (
            <Button
              type="button"
              onClick={() => {
                if (sdkRef.current) {
                  try {
                    sdkRef.current.destroy();
                  } catch (err) {
                    console.error(
                      "Didit reset error:",
                      err,
                    );
                  }

                  sdkRef.current = null;
                }

                if (diditContainer) {
                  diditContainer.innerHTML = "";
                }

                startingRef.current = false;
                pollingRef.current = false;

                void startVerification();
              }}
              className="w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700"
            >
              Try Again
            </Button>
          )}

          {step === "verified" && (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle2
                className="h-4 w-4"
                aria-hidden="true"
              />

              Identity verified. Taking you to DateBu...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function VerificationSuspense() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verificationSessionId =
      searchParams.get(
        "verificationSessionId",
      );

    const status =
      searchParams.get("status");

    if (
      !verificationSessionId &&
      !status
    ) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const maxAttempts = 40;
    const intervalMs = 1500;

    const checkStatus = async () => {
      if (cancelled) {
        return;
      }

      attempts++;

      try {
        const response = await fetch(
          "/api/didit/status",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (response.ok) {
          const data =
            (await response.json()) as DiditStatusResponse;

          const currentStatus = String(
            data.status ?? "",
          ).toLowerCase();

          if (currentStatus === "verified") {
            router.replace("/app");
            return;
          }

          if (
            currentStatus === "rejected" ||
            currentStatus === "declined"
          ) {
            return;
          }
        }
      } catch {
        // Retry.
      }

      if (
        attempts >= maxAttempts &&
        !cancelled
      ) {
        return;
      }
    };

    void checkStatus();

    const timer =
      window.setInterval(
        () => {
          void checkStatus();
        },
        intervalMs,
      );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
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
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center px-4 py-8">
      <Card className="w-full border-border bg-card p-6 text-center shadow-xl">
        <div className="flex flex-col items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck
              className="h-6 w-6"
              aria-hidden="true"
            />
          </div>

          <h1 className="text-xl font-black tracking-tight">
            Face Verification
          </h1>

          <Loader2
            className="h-8 w-8 animate-spin text-emerald-600"
            aria-hidden="true"
          />

          <p className="text-xs font-semibold text-muted-foreground">
            Preparing verification...
          </p>

        </div>
      </Card>
    </div>
  );
}