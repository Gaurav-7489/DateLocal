"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import {
  getFaceXSDK,
  evaluateFrame,
  extractReferenceFromImage,
  computeCosineSimilarity,
  type CaptureStatus,
} from "@/lib/facex/client";
import { getReferencePhoto, submitFaceVerification } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Camera,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type FlowStep = "loading_reference" | "ready" | "capturing" | "verified" | "error";

export default function FaceVerificationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<FlowStep>("loading_reference");
  const [referencePhotoUrl, setReferencePhotoUrl] = useState<string | null>(null);
  const [referenceEmbedding, setReferenceEmbedding] = useState<number[] | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("Loading reference profile photo...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setHoldProgress(0);
    setStep("capturing");
    setInstruction("Position your face inside the guide");

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
      setStep("error");
    }
  }, []);

  // 1. Fetch Reference Photo and Compute Reference Embedding
  useEffect(() => {
    let mounted = true;

    async function initReference() {
      try {
        setInstruction("Fetching your primary profile photo...");
        const photoRes = await getReferencePhoto();
        if (!mounted) return;

        if (!photoRes.success || !photoRes.photoUrl) {
          setCameraError(photoRes.error || "Please upload a primary profile photo first.");
          setStep("error");
          return;
        }

        setReferencePhotoUrl(photoRes.photoUrl);
        setInstruction("Initializing facial AI engine...");

        const sdk = await getFaceXSDK();
        if (!mounted) return;

        setInstruction("Extracting biometric reference from photo...");

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = photoRes.photoUrl;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load reference image bitmap."));
        });

        const extraction = extractReferenceFromImage(sdk, img);
        if (!mounted) return;

        if (extraction.faceCount === 0 || extraction.embedding.length !== 512) {
          setCameraError("Could not detect a clear face in your main profile photo. Please upload a clear photo.");
          setStep("error");
          return;
        }

        if (extraction.faceCount > 1) {
          setCameraError("Multiple faces detected in your main profile photo. Please upload a solo photo.");
          setStep("error");
          return;
        }

        setReferenceEmbedding(extraction.embedding);
        setStep("ready");
        setInstruction("Reference profile face ready. Start camera to verify.");
      } catch (err: unknown) {
        console.error("Reference initialization error:", err);
        if (mounted) {
          setCameraError(err instanceof Error ? err.message : "Failed to prepare reference photo.");
          setStep("error");
        }
      }
    }

    initReference();

    return () => {
      mounted = false;
      stopStream();
    };
  }, [stopStream]);

  // 2. Real-time Live Camera Verification Loop
  useEffect(() => {
    if (step !== "capturing" || cameraError || isProcessing || !referenceEmbedding) return;

    let animFrame: number;
    let validFrames = 0;
    const requiredFrames = 12;
    const SIMILARITY_THRESHOLD = 0.68;

    const loop = async () => {
      const video = videoRef.current;
      if (video && video.readyState === 4) {
        try {
          const sdk = await getFaceXSDK();
          const status: CaptureStatus = evaluateFrame(sdk, video);

          if (status.state === "valid") {
            const similarity = computeCosineSimilarity(referenceEmbedding, status.embedding);

            if (similarity >= SIMILARITY_THRESHOLD) {
              validFrames++;
              const progress = Math.min(100, Math.round((validFrames / requiredFrames) * 100));
              setHoldProgress(progress);
              setInstruction("Matching with profile photo... Hold still");

              if (validFrames >= requiredFrames) {
                setIsProcessing(true);
                setInstruction("Verifying identity with server...");
                stopStream();

                const res = await submitFaceVerification(referenceEmbedding, similarity);

                if (res.success) {
                  setStep("verified");
                  setInstruction("Identity verified successfully!");
                  setTimeout(() => {
                    router.replace(routes.app);
                  }, 1200);
                  return;
                } else {
                  setCameraError(res.error || "Verification failed. Please retry.");
                  setStep("error");
                  setIsProcessing(false);
                  validFrames = 0;
                  setHoldProgress(0);
                  return;
                }
              }
            } else {
              validFrames = Math.max(0, validFrames - 1);
              setHoldProgress(0);
              setInstruction("Face does not match your main profile photo.");
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
  }, [step, cameraError, isProcessing, referenceEmbedding, router, stopStream]);

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
            Quick selfie check to match you with your main profile photo. Video is processed locally on your device and never uploaded.
          </p>
        </div>

        {/* Viewport Box */}
        <div className="relative mx-auto w-64 h-80 rounded-3xl overflow-hidden bg-black border-2 border-dashed border-emerald-500/40 flex items-center justify-center shadow-2xl">
          {step === "capturing" ? (
            <>
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
                  holdProgress > 0
                    ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                    : "border-white/50"
                }`}
              />

              {/* Progress Bar */}
              {holdProgress > 0 && (
                <div className="absolute bottom-4 left-6 right-6 h-2 bg-black/60 backdrop-blur-sm rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
              )}
            </>
          ) : step === "verified" ? (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white gap-2 animate-in fade-in duration-300">
              <Sparkles className="h-10 w-10 text-emerald-300 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="font-bold text-sm tracking-wide text-emerald-100">Identity Verified</span>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-4">
              {referencePhotoUrl ? (
                <div className="relative w-36 h-48 rounded-2xl overflow-hidden border border-zinc-700 shadow-inner">
                  <Image
                    src={referencePhotoUrl}
                    alt="Reference profile card"
                    fill
                    className="object-cover"
                    sizes="160px"
                    priority
                  />
                </div>
              ) : (
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              )}
              <span className="mt-3 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                Main Reference Photo
              </span>
            </div>
          )}
        </div>

        {/* Feedback Message */}
        <div className="min-h-[44px] flex items-center justify-center px-2">
          {cameraError ? (
            <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          ) : (
            <p className="text-xs font-semibold text-foreground/80 transition-all flex items-center gap-2">
              {step === "loading_reference" && <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />}
              {step === "verified" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              <span>{instruction}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {step === "ready" && (
            <Button
              variant="primary"
              size="md"
              onClick={startCamera}
              className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3"
            >
              <Camera className="h-4 w-4" /> Start Face Match
            </Button>
          )}

          {step === "error" && (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={startCamera}
                disabled={!referenceEmbedding}
                className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3"
              >
                <RefreshCw className="h-4 w-4" /> Try Camera Again
              </Button>
              <Link
                href={routes.profileSetup}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Profile Setup
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}