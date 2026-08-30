"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  Loader2, 
  X, 
  Star, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  Camera, 
  Sparkles 
} from "lucide-react";

interface ProfilePhotoUploaderProps {
  userId: string;
  existingPhotoUrls?: string[];
  existingPhotoPaths?: string[];
  onPhotosUploaded: (storagePaths: string[]) => void;
}

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 6 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePhotoUploader({
  userId,
  existingPhotoUrls = [],
  existingPhotoPaths = [],
  onPhotosUploaded,
}: ProfilePhotoUploaderProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrls, setPreviewUrls] = useState<string[]>(existingPhotoUrls);
  const [photoPaths, setPhotoPaths] = useState<string[]>(existingPhotoPaths);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Target slot index when tapping a specific empty placeholder or replacing an existing one
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);

  // Modal crop state
  const [currentCropImage, setCurrentCropImage] = useState<string | null>(null);
  const [currentFileType, setCurrentFileType] = useState<string>("image/jpeg");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropAreaComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const triggerUpload = (slotIndex: number) => {
    if (isUploading) return;
    setTargetSlotIndex(slotIndex);
    fileInputRef.current?.click();
  };

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload JPG, PNG, or WebP images only.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 6 MB.");
      event.target.value = "";
      return;
    }

    setCurrentFileType(file.type || "image/jpeg");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);

    const reader = new FileReader();
    reader.onload = () => {
      setCurrentCropImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  }

  async function handleApplyCrop() {
    if (!currentCropImage || !croppedAreaPixels) return;

    try {
      setIsUploading(true);

      const croppedBlob = await getCroppedImg(
        currentCropImage,
        croppedAreaPixels,
        rotation,
        currentFileType
      );

      if (!croppedBlob) {
        throw new Error("Could not process cropped image.");
      }

      const extension = currentFileType === "image/png" ? "png" : currentFileType === "image/webp" ? "webp" : "jpg";
      const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, croppedBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: currentFileType,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        setError("Failed to upload photo. Please try again.");
        return;
      }

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(filePath, 60 * 60);

      const photoUrl =
        !signedUrlError && signedUrlData?.signedUrl
          ? signedUrlData.signedUrl
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${filePath}`;

      let nextPaths = [...photoPaths];
      let nextUrls = [...previewUrls];

      if (targetSlotIndex !== null && targetSlotIndex < photoPaths.length) {
        // Replacing existing slot
        nextPaths[targetSlotIndex] = filePath;
        nextUrls[targetSlotIndex] = photoUrl;
      } else {
        // Appending to next available slot
        nextPaths = [...nextPaths, filePath];
        nextUrls = [...nextUrls, photoUrl];
      }

      setPhotoPaths(nextPaths);
      setPreviewUrls(nextUrls);
      onPhotosUploaded(nextPaths);
    } catch (err) {
      console.error("Cropping error:", err);
      setError("An error occurred while cropping the image.");
    } finally {
      setIsUploading(false);
      setCurrentCropImage(null);
      setTargetSlotIndex(null);
    }
  }

  function handleCancelCrop() {
    setCurrentCropImage(null);
    setTargetSlotIndex(null);
  }

  function removePhoto(e: React.MouseEvent, index: number) {
    e.stopPropagation();
    const nextPaths = photoPaths.filter((_, i) => i !== index);
    const nextUrls = previewUrls.filter((_, i) => i !== index);

    setPhotoPaths(nextPaths);
    setPreviewUrls(nextUrls);
    onPhotosUploaded(nextPaths);
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-600" />
            Profile Deck Photos
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tap any slot to frame or replace your 6 deck photos.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          {photoPaths.length}/6 Added
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 6-Slot Visual Card Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {Array.from({ length: MAX_PHOTOS }).map((_, slotIdx) => {
          const url = previewUrls[slotIdx];
          const isMain = slotIdx === 0;

          if (url) {
            return (
              <div
                key={slotIdx}
                onClick={() => triggerUpload(slotIdx)}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-zinc-950 shadow-xs cursor-pointer hover:border-emerald-500 transition-all"
              >
                <Image
                  src={url}
                  alt={`Profile slot ${slotIdx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 30vw, 160px"
                />

                {isMain ? (
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-xs">
                    <Star className="h-2.5 w-2.5 fill-current" /> Main Card
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur-xs">
                    {slotIdx + 1}
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => removePhoto(e, slotIdx)}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-rose-600 active:scale-90"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-black/80 to-transparent text-[9px] text-center text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tap to replace
                </div>
              </div>
            );
          }

          return (
            <button
              type="button"
              key={slotIdx}
              onClick={() => triggerUpload(slotIdx)}
              disabled={isUploading}
              className={`relative flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed transition-all active:scale-95 cursor-pointer ${
                slotIdx === photoPaths.length
                  ? "border-emerald-400 bg-emerald-50/50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-100/60 shadow-2xs"
                  : "border-zinc-200 bg-zinc-50 text-zinc-400 hover:border-zinc-300"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                slotIdx === photoPaths.length ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-500"
              }`}>
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold">
                {slotIdx === 0 ? "Main Photo" : `Slot ${slotIdx + 1}`}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {/* Frame Cropper Modal */}
      {currentCropImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative flex h-[90dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Frame Card Slot
                </h3>
                <p className="text-[10px] text-zinc-400">Pinch or zoom to fit the 4:5 deck card</p>
              </div>
              <button
                type="button"
                onClick={handleCancelCrop}
                disabled={isUploading}
                className="rounded-full bg-zinc-900 p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex-1 bg-black">
              <Cropper
                image={currentCropImage}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4 / 5}
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropAreaComplete}
              />
            </div>

            <div className="space-y-3 border-t border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ZoomOut className="h-4 w-4 text-zinc-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.05}
                  aria-label="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-500"
                />
                <ZoomIn className="h-4 w-4 text-zinc-400" />
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="ml-1 rounded-xl border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 active:scale-95"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  disabled={isUploading}
                  className="rounded-xl border border-zinc-700 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={isUploading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Apply Crop
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= High-Res Canvas Cropping Engine ================= */

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  mimeType = "image/jpeg"
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => resolve(blob), mimeType, 0.92);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}