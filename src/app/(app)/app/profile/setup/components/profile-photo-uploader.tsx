"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, User, X, Star } from "lucide-react";

interface ProfilePhotoUploaderProps {
  userId: string;
  existingPhotoUrls?: string[];
  existingPhotoPaths?: string[];
  onPhotosUploaded: (storagePaths: string[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PHOTOS = 6;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePhotoUploader({
  userId,
  existingPhotoUrls = [],
  existingPhotoPaths = [],
  onPhotosUploaded,
}: ProfilePhotoUploaderProps) {
  const supabase = createClient();

  const [previewUrls, setPreviewUrls] = useState<string[]>(
    existingPhotoUrls,
  );
  const [photoPaths, setPhotoPaths] = useState<string[]>(
    existingPhotoPaths,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    setError("");

    const remainingSlots = MAX_PHOTOS - photoPaths.length;

    if (remainingSlots <= 0) {
      setError(`You can upload up to ${MAX_PHOTOS} photos.`);
      event.target.value = "";
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(`You can upload up to ${MAX_PHOTOS} photos.`);
    }

    for (const file of filesToUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Please upload only JPG, PNG, or WebP images.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be 5 MB or smaller.");
        event.target.value = "";
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadedPaths: string[] = [];
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const extension =
          file.type === "image/jpeg"
            ? "jpg"
            : file.type === "image/png"
              ? "png"
              : "webp";

        const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          console.error("Photo upload error:", uploadError);
          setError("Failed to upload one of the photos. Please try again.");
          continue;
        }

        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("profile-photos")
            .createSignedUrl(filePath, 60 * 60);

        const photoUrl =
          !signedUrlError && signedUrlData?.signedUrl
            ? signedUrlData.signedUrl
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${filePath}`;

        uploadedPaths.push(filePath);
        uploadedUrls.push(photoUrl);
      }

      if (uploadedPaths.length > 0) {
        const nextPaths = [...photoPaths, ...uploadedPaths];
        const nextUrls = [...previewUrls, ...uploadedUrls];

        setPhotoPaths(nextPaths);
        setPreviewUrls(nextUrls);

        onPhotosUploaded(nextPaths);
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setError("Something went wrong while uploading the photos.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function removePhoto(index: number) {
    const nextPaths = photoPaths.filter((_, i) => i !== index);
    const nextUrls = previewUrls.filter((_, i) => i !== index);

    setPhotoPaths(nextPaths);
    setPreviewUrls(nextUrls);
    onPhotosUploaded(nextPaths);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">
          Profile Photos
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Add up to {MAX_PHOTOS} photos. Your first photo will be your main
          profile photo.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {previewUrls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-square overflow-hidden rounded-2xl border-2 border-zinc-200 bg-muted"
          >
            <Image
              src={url}
              alt={`Profile photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="120px"
            />

            {index === 0 && (
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[9px] font-bold text-white">
                <Star className="h-3 w-3 fill-current" />
                Main
              </div>
            )}

            <button
              type="button"
              onClick={() => removePhoto(index)}
              disabled={isUploading}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-rose-600 disabled:opacity-50"
              aria-label={`Remove photo ${index + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {photoPaths.length < MAX_PHOTOS && (
          <label
            htmlFor="profile-photos"
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-50 ${
              isUploading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}

            <span className="text-[10px] font-bold">
              {isUploading ? "Uploading..." : "Add Photos"}
            </span>

            <input
              id="profile-photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isUploading}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {previewUrls.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-muted-foreground">
          <User className="h-4 w-4 shrink-0" />
          <span>
            Add at least one clear photo so fellow students can recognize you.
          </span>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {photoPaths.length}/{MAX_PHOTOS} photos · JPG, PNG or WebP · Up to 5 MB
        each
      </p>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
