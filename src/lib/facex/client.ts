import type { FaceXSDK as FaceXSDKType, Face } from "../../../vendor/facex-wasm/facex-sdk";

let sdkInstance: FaceXSDKType | null = null;
let initPromise: Promise<FaceXSDKType> | null = null;

interface FaceXModule {
  default: new (options?: {
    detSize?: number;
    threshold?: number;
    detWeightsUrl?: string;
    embWeightsUrl?: string;
  }) => FaceXSDKType;
}

/**
 * Singleton loader for FaceX WASM SDK.
 * Loads engine binaries with client-side caching.
 */
export async function getFaceXSDK(): Promise<FaceXSDKType> {
  if (sdkInstance && sdkInstance.ready) {
    return sdkInstance;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const mod = (await import("../../../vendor/facex-wasm/facex-sdk.js")) as unknown as FaceXModule;
    const sdk: FaceXSDKType = new mod.default({
      detSize: 160,
      detWeightsUrl: "/facex/det_500m_int8.bin",
      embWeightsUrl: "/facex/edgeface_xs_fp32.bin",
    });

    await sdk.load();
    sdkInstance = sdk;
    return sdk;
  })();

  return initPromise;
}

export type CaptureStatus =
  | { state: "ready" }
  | { state: "no_face"; message: string }
  | { state: "multiple_faces"; message: string }
  | { state: "too_small"; message: string }
  | { state: "valid"; embedding: number[]; face: Face };

/**
 * Calculates cosine similarity between two 512-dimension biometric embeddings.
 */
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Extracts reference face embedding from an HTMLImageElement or Canvas.
 */
export function extractReferenceFromImage(
  sdk: FaceXSDKType,
  imageElement: HTMLImageElement | HTMLCanvasElement
): { embedding: number[]; faceCount: number } {
  const faces = sdk.detect(imageElement);
  if (!faces || faces.length === 0) {
    return { embedding: [], faceCount: 0 };
  }
  if (faces.length > 1) {
    return { embedding: [], faceCount: faces.length };
  }

  const ref = sdk.captureReference(imageElement);
  if (!ref || !ref.embedding || ref.embedding.length !== 512) {
    return { embedding: [], faceCount: 0 };
  }

  return {
    embedding: Array.from(ref.embedding),
    faceCount: 1,
  };
}

/**
 * Evaluates live video frames at 60fps with zero DOM overhead.
 */
export function evaluateFrame(
  sdk: FaceXSDKType,
  video: HTMLVideoElement
): CaptureStatus {
  if (!video.videoWidth || !video.videoHeight) {
    return { state: "ready" };
  }

  const faces = sdk.detect(video);

  if (!faces || faces.length === 0) {
    return { state: "no_face", message: "Center your face in the frame" };
  }

  if (faces.length > 1) {
    return { state: "multiple_faces", message: "Multiple faces detected. Be alone in frame." };
  }

  const face = faces[0];
  if (!face) {
    return { state: "no_face", message: "Center your face in the frame" };
  }

  const faceWidth = face.x2 - face.x1;
  const faceHeight = face.y2 - face.y1;
  const frameArea = video.videoWidth * video.videoHeight;
  const faceArea = faceWidth * faceHeight;

  // Face must occupy at least 8% of the camera frame
  if (faceArea / frameArea < 0.08) {
    return { state: "too_small", message: "Move slightly closer to the camera" };
  }

  const ref = sdk.captureReference(video);
  if (!ref || !ref.embedding || ref.embedding.length !== 512) {
    return { state: "no_face", message: "Hold still and look directly at the screen" };
  }

  return {
    state: "valid",
    embedding: Array.from(ref.embedding),
    face: ref.face,
  };
}