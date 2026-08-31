"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FlowStep = "loading" | "redirecting" | "verifying" | "verified" | "error";

function VerificationContent() {
  const [step, setStep] = useState<FlowStep>("loading");
  const [error, setError] = useState<string | null>(null);

  const startVerification = useCallback(async () => {
    setStep("loading");
    setError(null);

    try {
      const res = await fetch("/api/didit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to start verification.");
      }

      const data = (await res.json()) as { url: string };
      setStep("redirecting");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start verification.");
      setStep("error");
    }
  }, []);

  useEffect(() => {
    void startVerification();
  }, [startVerification]);

  return (
    <div className="mx-auto max-w-md px-4 py-8 flex flex-col items-center">
      <Card className="w-full p-6 space-y-6 text-center shadow-xl border-border bg-card">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Identity Verification
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Complete a quick secure verification to confirm your identity.
          </p>
        </div>

        <div className="min-h-[120px] flex items-center justify-center">
          {step === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold text-foreground/80">
                Starting verification...
              </p>
            </div>
          )}

          {step === "redirecting" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold text-foreground/80">
                Redirecting to secure verification...
              </p>
            </div>
          )}

          {step === "verifying" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold text-foreground/80">
                Verification in progress...
              </p>
            </div>
          )}

          {step === "verified" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <p className="text-xs font-semibold text-foreground/80">
                Identity verified
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <p className="text-xs font-semibold text-rose-600">{error}</p>
            </div>
          )}
        </div>

        {step === "error" && (
          <Button
            onClick={startVerification}
            className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3"
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

  useEffect(() => {
    const verificationSessionId = searchParams.get("verificationSessionId");
    const status = searchParams.get("status");

    if (verificationSessionId && status === "Approved") {
      // Start polling the server-side status.
      let cancelled = false;
      let attempts = 0;
      const maxAttempts = 30;
      const intervalMs = 2000;

      const timer = setInterval(async () => {
        if (cancelled) return;
        attempts++;

        try {
          const res = await fetch("/api/didit/status");
          if (!res.ok) throw new Error("Failed to check status.");

          const data = (await res.json()) as { status: string };
          if (data.status === "verified") {
            clearInterval(timer);
            router.replace("/app");
          } else if (data.status === "rejected") {
            clearInterval(timer);
            // Force re-render by reloading without query params.
            window.location.href = "/verify/face";
          } else if (attempts >= maxAttempts) {
            clearInterval(timer);
            window.location.href = "/verify/face?error=timeout";
          }
        } catch {
          // Retry on transient errors.
        }
      }, intervalMs);

      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }

    if (status === "Declined") {
      window.location.href = "/verify/face?error=declined";
    }
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
    <div className="mx-auto max-w-md px-4 py-8 flex flex-col items-center">
      <Card className="w-full p-6 space-y-6 text-center shadow-xl border-border bg-card">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Identity Verification
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Complete a quick secure verification to confirm your identity.
          </p>
        </div>
        <div className="min-h-[120px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </Card>
    </div>
  );
}
