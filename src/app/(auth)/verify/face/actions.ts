"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type FaceVerificationResult = {
  success: boolean;
  error?: string;
};

/**
 * Securely stores the 512-dimension reference embedding.
 * Strict PostgreSQL CHECK enforces exact 512 dimensions.
 */
export async function submitFaceVerification(
  embedding: number[]
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

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized session. Please log in again." };
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