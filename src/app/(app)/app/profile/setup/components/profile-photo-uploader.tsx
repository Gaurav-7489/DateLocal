"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProfilePhotoUploaderProps {
  userId: string;
  existingPhotoUrl?: string | null;
  onPhotoUploaded: (storagePath: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePhotoUploader({
  userId,
  existingPhotoUrl,
  onPhotoUploaded,
}: ProfilePhotoUploaderProps) {
  const supabase = createClient();

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingPhotoUrl ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
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
        setError("Failed to upload photo. Please try again.");
        return;
      }

     const { data, error: signedUrlError } = await supabase.storage
  .from("profile-photos")
  .createSignedUrl(filePath, 60 * 60);

if (signedUrlError) {
  console.error("Signed URL error:", signedUrlError);
  setError("Photo uploaded, but preview could not be loaded.");
  return;
}

setPreviewUrl(data.signedUrl);
onPhotoUploaded(filePath);
      onPhotoUploaded(filePath);
    } catch (err) {
      console.error("Photo upload error:", err);
      setError("Something went wrong while uploading the photo.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Profile Photo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a clear photo so people can recognize you.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              No photo
            </span>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="profile-photo"
            className={`inline-flex cursor-pointer items-center rounded-[var(--radius-md)] bg-uni-primary px-4 py-2 text-sm font-medium text-white transition-opacity ${
              isUploading
                ? "cursor-not-allowed opacity-60"
                : "hover:opacity-90"
            }`}
          >
            {isUploading
              ? "Uploading..."
              : previewUrl
                ? "Change photo"
                : "Upload photo"}

            <input
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <p className="mt-2 text-xs text-muted-foreground">
            JPG, PNG or WebP · Maximum 5 MB
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}