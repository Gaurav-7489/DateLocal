"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { getFaceXSDK, evaluateFrame, CaptureStatus } from "@/lib/facex/client";
import { submitFaceVerification } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function FaceVerificationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [loadingModel, setLoadingModel] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("Initializing facial engine...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);

      const errorName =
        err instanceof DOMException
          ? err.name
          : err instanceof Error
            ? err.name
            : "";

      setCameraError(
        errorName === "NotAllowedError" || errorName === "PermissionDeniedError"
          ? "Camera permission denied. Allow camera access in your browser settings."
          : "Could not start camera. Ensure another application is not using it."
      );
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setInstruction("Loading high-speed WASM models...");
        await getFaceXSDK();
        if (!mounted) return;
        setLoadingModel(false);
        setInstruction("Position your face inside the guide");
        await startCamera();
      } catch (err) {
        console.error("SDK initialization failed:", err);
        if (mounted) {
          setCameraError("Failed to initialize verification models. Refresh and try again.");
          setLoadingModel(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      stopStream();
    };
  }, [startCamera, stopStream]);

  // Real-time detection loop
  useEffect(() => {
    if (loadingModel || cameraError || isVerified || isProcessing) return;

    let animFrame: number;
    let validFrames = 0;
    const requiredFrames = 12; // ~0.2s of steady detection for instant verification

    const loop = async () => {
      const video = videoRef.current;
      if (video && video.readyState === 4) {
        try {
          const sdk = await getFaceXSDK();
          const status: CaptureStatus = evaluateFrame(sdk, video);

          if (status.state === "valid") {
            validFrames++;
            const progress = Math.min(100, Math.round((validFrames / requiredFrames) * 100));
            setHoldProgress(progress);
            setInstruction("Hold still...");

            if (validFrames >= requiredFrames) {
              setIsProcessing(true);
              setInstruction("Securing student verification...");
              const res = await submitFaceVerification(status.embedding);

              if (res.success) {
                setIsVerified(true);
                stopStream();
                setTimeout(() => {
                  router.replace(routes.profileSetup);
                }, 1000);
                return;
              } else {
                setCameraError(res.error || "Verification failed. Please retry.");
                setIsProcessing(false);
                validFrames = 0;
                setHoldProgress(0);
              }
            }
          } else {
            validFrames = Math.max(0, validFrames - 1);
            setHoldProgress(0);
            if (status.state !== "ready") {
              setInstruction(status.message);
            }
          }
        } catch (e) {
          console.error("Detection cycle error:", e);
        }
      }
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animFrame);
  }, [loadingModel, cameraError, isVerified, isProcessing, router, stopStream]);

  return (
    <div className="mx-auto max-w-md px-4 py-8 flex flex-col items-center">
      <Card className="w-full p-6 space-y-6 text-center shadow-xl border-muted bg-background/95 backdrop-blur-md">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Face Verification
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            One-time selfie check to keep DateBu verified & bot-free. Video is processed on your device and never uploaded.
          </p>
        </div>

        {/* Viewport Box */}
        <div className="relative mx-auto w-64 h-80 rounded-3xl overflow-hidden bg-black border-2 border-dashed border-emerald-500/40 flex items-center justify-center shadow-2xl">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          />

          {/* Oval Guideline Overlay */}
          <div
            className={`absolute w-44 h-60 rounded-[50%] border-2 transition-all duration-300 pointer-events-none ${
              isVerified
                ? "border-emerald-500 bg-emerald-500/20 scale-105"
                : holdProgress > 0
                ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                : "border-white/50"
            }`}
          />

          {/* Verification Success Screen */}
          {isVerified && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white gap-2 animate-in fade-in duration-300">
              <Sparkles className="h-10 w-10 text-emerald-300 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="font-bold text-sm tracking-wide text-emerald-100">Identity Verified</span>
            </div>
          )}

          {/* Progress Bar */}
          {holdProgress > 0 && !isVerified && (
            <div className="absolute bottom-4 left-6 right-6 h-2 bg-black/60 backdrop-blur-sm rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Live Feedback Message */}
        <div className="min-h-[44px] flex items-center justify-center px-2">
          {cameraError ? (
            <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          ) : (
            <p className="text-xs font-semibold text-foreground/80 transition-all">
              {instruction}
            </p>
          )}
        </div>

        {/* Action Button */}
        {cameraError && (
          <Button
            variant="primary"
            size="md"
            onClick={startCamera}
            className="w-full gap-2 font-bold"
          >
            <RefreshCw className="h-4 w-4" /> Try Camera Again
          </Button>
        )}
      </Card>
    </div>
  );
}