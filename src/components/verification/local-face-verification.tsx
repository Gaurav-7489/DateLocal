"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Loader2, ShieldCheck, RotateCcw, AlertCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  createDateBuLivenessDetector,
  loadDateBuFaceX,
  type FaceXFace,
  type FaceXSDKInstance,
  type LivenessInstance,
} from "@/lib/face-x-browser";

type Phase = "boot" | "camera" | "checking" | "success" | "error";

type Challenge = "position" | "turn";

const MATCH_THRESHOLD = 0.42;
const DETECTION_INTERVAL = 180;

function getYaw(face: FaceXFace) {
  const [lex, ley, rex, rey, nx, ny] = face.kps;
  const eyeMidX = (lex + rex) / 2;
  const eyeDistance = Math.max(Math.abs(rex - lex), 1);
  return (nx - eyeMidX) / eyeDistance;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load your profile photo."));
    image.src = src;
  });
}

export function LocalFaceVerification() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<FaceXSDKInstance | null>(null);
  const livenessRef = useRef<LivenessInstance | null>(null);
  const referenceRef = useRef<Float32Array | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRunRef = useRef(0);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const challengeRef = useRef<Challenge>("position");
  const baselineYawRef = useRef<number | null>(null);
  const challengeFramesRef = useRef(0);
  const finalMatchesRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("boot");
  const [message, setMessage] = useState("Preparing face verification…");
  const [engineProgress, setEngineProgress] = useState(0);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  const start = useCallback(async () => {
    if (phase === "checking") return;

    setError(null);
    setSimilarity(null);
    setPhase("boot");
    setMessage("Loading the local face engine…");
    setEngineProgress(5);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is unavailable. Open DateBu over HTTPS or localhost.");
      }

      const [referenceResponse, engine] = await Promise.all([
        fetch("/api/face/reference/image", { cache: "no-store" }),
        loadDateBuFaceX((progress) => {
          if (!mountedRef.current) return;
          if (progress.includes("detector")) setEngineProgress(45);
          else if (progress.includes("embedding")) setEngineProgress(75);
          else if (progress === "Ready") setEngineProgress(100);
          else setEngineProgress((value) => Math.min(value + 10, 90));
          setMessage(progress);
        }),
      ]);

      if (!referenceResponse.ok) {
        const body = await referenceResponse.text();
        throw new Error(body || "Add a clear primary profile photo first.");
      }

      const referenceBlob = await referenceResponse.blob();
      const referenceUrl = URL.createObjectURL(referenceBlob);
      let referenceImage: HTMLImageElement;

      try {
        referenceImage = await loadImage(referenceUrl);
      } finally {
        URL.revokeObjectURL(referenceUrl);
      }

      const referenceResult = engine.process(referenceImage);
      if (referenceResult.faces.length !== 1 || referenceResult.embeddings.length !== 1) {
        throw new Error("Your primary profile photo must contain exactly one clear face.");
      }

      referenceRef.current = referenceResult.embeddings[0];
      engineRef.current = engine;

      setMessage("Starting camera…");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 720, max: 1280 },
          height: { ideal: 720, max: 1280 },
          frameRate: { ideal: 24, max: 30 },
        },
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (!videoRef.current) throw new Error("Camera view is unavailable.");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      livenessRef.current = createDateBuLivenessDetector();
      challengeRef.current = "position";
      baselineYawRef.current = null;
      challengeFramesRef.current = 0;
      finalMatchesRef.current = 0;
      lastRunRef.current = 0;
      setPhase("checking");
      setMessage("Center your face inside the frame.");
    } catch (cause) {
      stopCamera();
      const text = cause instanceof Error ? cause.message : "Face verification could not start.";
      setError(text);
      setMessage("Verification could not start");
      setPhase("error");
    }
  }, [phase, stopCamera]);

  const finishVerification = useCallback(async () => {
    if (!referenceRef.current) throw new Error("Reference face is missing.");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Your session expired. Please sign in again.");

    const { error: saveError } = await supabase.from("face_verifications").upsert({
      user_id: user.id,
      reference_embedding: Array.from(referenceRef.current),
      status: "verified",
      verified_at: new Date().toISOString(),
    });

    if (saveError) throw saveError;

    stopCamera();
    if (mountedRef.current) {
      setPhase("success");
      setMessage("Face verified");
      window.setTimeout(() => router.replace("/app"), 500);
    }
  }, [router, stopCamera]);

  const runFrame = useCallback(async (now: number) => {
    rafRef.current = requestAnimationFrame(runFrame);

    if (!mountedRef.current || phase !== "checking") return;
    if (busyRef.current || now - lastRunRef.current < DETECTION_INTERVAL) return;
    if (!videoRef.current || videoRef.current.readyState < 2 || !engineRef.current) return;

    busyRef.current = true;
    lastRunRef.current = now;

    try {
      const result = engineRef.current.process(videoRef.current);
      if (result.faces.length !== 1) {
        challengeFramesRef.current = 0;
        setMessage(result.faces.length === 0 ? "Move into the frame." : "Only one face can be verified at a time.");
        return;
      }

      const face = result.faces[0];
      if (face.score < 0.55) {
        setMessage("Move a little closer and improve the lighting.");
        return;
      }

      const liveness = livenessRef.current?.update(face);
      const yaw = getYaw(face);
      if (baselineYawRef.current === null) baselineYawRef.current = yaw;

      const yawDelta = Math.abs(yaw - baselineYawRef.current);
      const hasTurned = yawDelta > 0.14;
      const hasMotion = (liveness?.details?.motion ?? 0) > 0.9;

      if (challengeRef.current === "position") {
        const width = face.x2 - face.x1;
        const height = face.y2 - face.y1;
        const centerX = (face.x1 + face.x2) / 2;
        const centerY = (face.y1 + face.y2) / 2;
        const video = videoRef.current;
        const normalizedX = centerX / video.videoWidth;
        const normalizedY = centerY / video.videoHeight;

        const goodPosition =
          width > video.videoWidth * 0.22 &&
          height > video.videoHeight * 0.22 &&
          normalizedX > 0.3 && normalizedX < 0.7 &&
          normalizedY > 0.2 && normalizedY < 0.8;

        if (!goodPosition) {
          challengeFramesRef.current = 0;
          setMessage("Center your face inside the frame.");
          return;
        }

        challengeFramesRef.current += 1;
        if (challengeFramesRef.current < 4) {
          setMessage("Hold still…");
          return;
        }

        challengeRef.current = "turn";
        baselineYawRef.current = yaw;
        challengeFramesRef.current = 0;
        setMessage("Now turn your head slightly, then face forward again.");
        return;
      }

      if (challengeRef.current === "turn") {
        if (hasTurned && hasMotion) {
          challengeFramesRef.current += 1;
        } else if (challengeFramesRef.current > 0 && !hasTurned) {
          // Keep the completed movement; the next phase confirms the face again.
          challengeFramesRef.current += 1;
        }

        if (challengeFramesRef.current < 3) {
          setMessage(hasTurned ? "Good. Face forward again." : "Turn your head slightly.");
          return;
        }

        challengeRef.current = "position";
        challengeFramesRef.current = 0;
        finalMatchesRef.current = 0;
        baselineYawRef.current = yaw;
        setMessage("Checking your face…");
      }

      const reference = referenceRef.current;
      if (!reference) return;

      const similarityNow = engineRef.current.cosSim(result.embeddings[0], reference);
      setSimilarity(similarityNow);

      if (similarityNow >= MATCH_THRESHOLD) {
        finalMatchesRef.current += 1;
      } else {
        finalMatchesRef.current = 0;
      }

      if (finalMatchesRef.current >= 3) {
        await finishVerification();
      }
    } catch (cause) {
      console.error("Local face verification frame failed:", cause);
    } finally {
      busyRef.current = false;
    }
  }, [finishVerification, phase]);

  useEffect(() => {
    if (phase !== "checking") {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    rafRef.current = requestAnimationFrame(runFrame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [phase, runFrame]);

  const retry = () => {
    stopCamera();
    setPhase("boot");
    setError(null);
    setSimilarity(null);
    void start();
  };

  return (
    <main className="min-h-[100svh] bg-[#f6f8f7] px-4 py-5 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-[430px] flex-col rounded-[28px] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
        <div className="px-2 pt-2 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-6 w-6" strokeWidth={2.1} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em]">Face verification</h1>
          <p className="mx-auto mt-2 max-w-[310px] text-sm leading-5 text-slate-500">
            A quick live face check to confirm your profile belongs to you.
          </p>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-[24px] bg-slate-950 aspect-[3/4]">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full w-full object-cover ${phase === "checking" ? "opacity-100" : "opacity-0"}`}
            style={{ transform: "scaleX(-1)" }}
          />

          {phase !== "checking" && phase !== "success" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-white">
              {phase === "boot" ? (
                <>
                  <Loader2 className="mb-4 h-7 w-7 animate-spin text-emerald-300" />
                  <p className="text-sm font-medium">{message}</p>
                  <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${engineProgress}%` }} />
                  </div>
                </>
              ) : phase === "error" ? (
                <>
                  <AlertCircle className="mb-4 h-8 w-8 text-rose-300" />
                  <p className="text-sm font-medium">{error ?? message}</p>
                  <button onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950">
                    <RotateCcw className="h-4 w-4" /> Try again
                  </button>
                </>
              ) : (
                <>
                  <Camera className="mb-4 h-8 w-8 text-emerald-300" />
                  <p className="text-sm font-medium">Ready for the camera</p>
                </>
              )}
            </div>
          )}

          {phase === "checking" && (
            <>
              <div className="pointer-events-none absolute inset-[12%_13%] rounded-[38%] border-2 border-white/75 shadow-[0_0_0_9999px_rgba(2,6,23,0.22)]" />
              <div className="absolute inset-x-0 bottom-4 px-4">
                <div className="rounded-2xl bg-black/55 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-md">
                  {message}
                  {similarity !== null && (
                    <span className="ml-2 text-emerald-300">{Math.round(similarity * 100)}%</span>
                  )}
                </div>
              </div>
            </>
          )}

          {phase === "success" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600 text-white">
              <CheckCircle2 className="h-14 w-14" strokeWidth={1.7} />
              <p className="mt-4 text-xl font-semibold">Face verified</p>
              <p className="mt-1 text-sm text-emerald-50">Your profile is confirmed.</p>
            </div>
          )}
        </div>

        <div className="mt-auto px-2 pt-4">
          {phase === "boot" && (
            <button
              onClick={start}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-semibold text-white transition active:scale-[0.99]"
            >
              <Camera className="h-4 w-4" /> Start verification
            </button>
          )}

          {phase === "camera" && (
            <button
              onClick={start}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-semibold text-white"
            >
              <Camera className="h-4 w-4" /> Start camera
            </button>
          )}

          <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">
            Camera frames are processed locally in your browser. DateBu does not upload the verification selfie.
          </p>
        </div>
      </div>
    </main>
  );
}
