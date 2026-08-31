-- Didit replaces the old FaceX browser-side embedding.
-- Didit verification is tracked by session/status instead.
ALTER TABLE public.face_verifications
  ALTER COLUMN reference_embedding DROP NOT NULL;
