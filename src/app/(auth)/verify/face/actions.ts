"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfilePhotoUrl } from "@/lib/profile-photo";

export type FaceVerificationResult = {
  success: boolean;
  error?: string;
};

export type ReferencePhotoResult = {
  success: boolean;
  photoUrl?: string;
  error?: string;
};

/**
 * Retrieves the signed/public URL for the authenticated user's primary profile photo.
 */
export async function getReferencePhoto(): Promise<ReferencePhotoResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized session. Please log in again." };
  }

  const { data: primaryPhoto, error: photoError } = await supabase
    .from("profile_photos")
    .select("storage_path")
    .eq("profile_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (photoError || !primaryPhoto?.storage_path) {
    return {
      success: false,
      error: "No main profile photo found. Please complete profile setup first.",
    };
  }

  const photoUrl = getProfilePhotoUrl(primaryPhoto.storage_path, 640);
  if (!photoUrl) {
    return { success: false, error: "Unable to load your main profile photo." };
  }

  return { success: true, photoUrl };
}

/**
 * Securely stores the 512-dimension reference embedding upon successful live match.
 */
export async function submitFaceVerification(
  embedding: number[],
  similarityScore: number
): Promise<FaceVerificationResult> {
  if (!Array.isArray(embedding) || embedding.length !== 512) {
    return { success: false, error: "Invalid biometric reference vector length." };
  }

  const isValidFloats = embedding.every(
    (n) => typeof n === "number" && !Number.isNaN(n) && Number.isFinite(n)
  );

  if (!isValidFloats) {
    return { success: false, error: "Vector contains invalid float values." };
  }

  if (typeof similarityScore !== "number" || similarityScore < 0.65) {
    return { success: false, error: "Verification similarity score does not meet threshold." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized session. Please log in again." };
  }

  // Ensure user has a valid primary photo before marking verified
  const { data: primaryPhoto } = await supabase
    .from("profile_photos")
    .select("id")
    .eq("profile_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (!primaryPhoto) {
    return { success: false, error: "Main profile photo missing. Upload photo in Profile Setup." };
  }

  const { error } = await supabase.from("face_verifications").upsert(
    {
      user_id: user.id,
      reference_embedding: embedding,
      status: "verified",
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Face verification upsert failed:", error);
    return { success: false, error: "Failed to persist verification status. Try again." };
  }

  return { success: true };
}