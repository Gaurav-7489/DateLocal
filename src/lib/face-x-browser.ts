"use client";

type FaceXSDKConstructor = new (options?: {
  detSize?: number;
  threshold?: number;
  detWeightsUrl?: string;
  embWeightsUrl?: string;
  onProgress?: (message: string) => void;
}) => FaceXSDKInstance;

type FaceXFace = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
  kps: number[];
};

type FaceXSDKInstance = {
  load: () => Promise<FaceXSDKInstance>;
  verify: (source: HTMLVideoElement, referenceEmbedding: Float32Array) => {
    match: boolean;
    similarity: number;
    faces: FaceXFace[];
    embedding?: Float32Array;
    noFace?: boolean;
    ms: number;
  };
  captureReference: (source: HTMLImageElement | HTMLVideoElement) => {
    embedding: Float32Array;
    face: FaceXFace;
    alignedCanvas: HTMLCanvasElement;
  } | null;
  process: (source: HTMLVideoElement | HTMLImageElement) => {
    faces: FaceXFace[];
    embeddings: Float32Array[];
    ms: number;
  };
  cosSim: (a: Float32Array, b: Float32Array) => number;
};

type LivenessConstructor = new (options?: {
  historySize?: number;
  motionThreshold?: number;
}) => LivenessInstance;

type LivenessInstance = {
  update: (face: FaceXFace | null) => {
    alive: boolean;
    confidence: number;
    reason: string;
    details?: {
      motion: number;
      blinks: number;
      sizeVar: number;
    };
  };
  reset: () => void;
};

declare global {
  interface Window {
    FaceXSDK?: FaceXSDKConstructor;
    LivenessDetector?: LivenessConstructor;
    __datebuFaceXPromise?: Promise<FaceXSDKInstance>;
  }
}

const FACEX_COMMIT = "af7ca9937705a10901ca4b72c4eb19ef49a4ac53";
const FACEX_CDN = `https://cdn.jsdelivr.net/gh/facex-engine/facex@${FACEX_COMMIT}/wasm`;
const DETECTOR_WEIGHTS = `https://cdn.jsdelivr.net/gh/facex-engine/facex@${FACEX_COMMIT}/weights/yunet_fp32.bin`;
const EMBEDDING_WEIGHTS = "/models/edgeface_xs_fp32.bin";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-datebu-facex="${src}"]`,
    );

    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.datebuFacex = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

export async function loadDateBuFaceX(
  onProgress?: (message: string) => void,
): Promise<FaceXSDKInstance> {
  if (typeof window === "undefined") {
    throw new Error("Face verification only runs in the browser.");
  }

  if (window.__datebuFaceXPromise) return window.__datebuFaceXPromise;

  window.__datebuFaceXPromise = (async () => {
    onProgress?.("Loading face engine…");

    await loadScript(`${FACEX_CDN}/detect.js`);
    await loadScript(`${FACEX_CDN}/facex.js`);
    await loadScript(`${FACEX_CDN}/align.js`);
    await loadScript(`${FACEX_CDN}/facex-sdk.js`);
    await loadScript(`${FACEX_CDN}/liveness.js`);

    if (!window.FaceXSDK || !window.LivenessDetector) {
      throw new Error("Face engine failed to initialize.");
    }

    const sdk = new window.FaceXSDK({
      detSize: 160,
      threshold: 0.3,
      detWeightsUrl: DETECTOR_WEIGHTS,
      embWeightsUrl: EMBEDDING_WEIGHTS,
      onProgress,
    });

    await sdk.load();
    return sdk;
  })();

  try {
    return await window.__datebuFaceXPromise;
  } catch (error) {
    window.__datebuFaceXPromise = undefined;
    throw error;
  }
}

export function createDateBuLivenessDetector() {
  if (!window.LivenessDetector) {
    throw new Error("Liveness engine is not loaded.");
  }

  return new window.LivenessDetector({
    historySize: 24,
    motionThreshold: 1.25,
  });
}

export type { FaceXFace, FaceXSDKInstance, LivenessInstance };
