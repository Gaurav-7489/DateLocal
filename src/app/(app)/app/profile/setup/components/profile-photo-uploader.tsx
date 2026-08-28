"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, User } from "lucide-react";

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

      // Generate signed URL for immediate secure preview
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(filePath, 60 * 60);

      if (signedUrlError) {
        // Fallback to public URL format if signed URL fails
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${filePath}`;
        setPreviewUrl(publicUrl);
      } else {
        setPreviewUrl(signedUrlData.signedUrl);
      }

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
        <h2 className="text-base font-bold text-foreground">
          Profile Photo
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Add a clear photo so fellow students recognize you.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl border-2 border-emerald-500 bg-muted shadow-sm">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile preview"
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
              <User className="h-10 w-10 stroke-1" />
              <span className="text-[10px] mt-1">No photo</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <label
            htmlFor="profile-photo"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 ${
              isUploading
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>{previewUrl ? "Change Photo" : "Upload Photo"}</span>
              </>
            )}

            <input
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <p className="text-[11px] text-muted-foreground">
            JPG, PNG or WebP · Up to 5 MB
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}