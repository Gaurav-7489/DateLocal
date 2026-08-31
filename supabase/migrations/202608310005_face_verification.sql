-- ============================================================
-- DateBu — Face Verification
-- ============================================================
-- Verification is intentionally separate from profile photos.
--
-- IMPORTANT:
-- The verification camera image is processed client-side and
-- is NOT uploaded to Supabase.
--
-- Only the biometric reference embedding and verification state
-- are persisted.
-- ============================================================


CREATE TABLE IF NOT EXISTS public.face_verifications (
  user_id UUID PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 512-dimensional FaceX reference embedding.
  -- This is sensitive biometric information and is never publicly
  -- readable.
  reference_embedding REAL[] NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected')),

  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT face_verification_embedding_size
    CHECK (array_length(reference_embedding, 1) = 512)
);


COMMENT ON TABLE public.face_verifications IS
  'Private face-verification state and biometric reference embedding. Verification camera images are never stored.';


COMMENT ON COLUMN public.face_verifications.reference_embedding IS
  'Private 512-dimensional FaceX face embedding. Never expose to other users.';


-- ============================================================
-- updated_at
-- ============================================================

DROP TRIGGER IF EXISTS face_verifications_updated_at
ON public.face_verifications;

CREATE TRIGGER face_verifications_updated_at
  BEFORE UPDATE ON public.face_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- Index
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_face_verifications_status
  ON public.face_verifications (status);


-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.face_verifications ENABLE ROW LEVEL SECURITY;


-- A user can read ONLY their own verification record.
DROP POLICY IF EXISTS "Users can read own face verification"
ON public.face_verifications;

CREATE POLICY "Users can read own face verification"
  ON public.face_verifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());


-- A user can create ONLY their own verification record.
DROP POLICY IF EXISTS "Users can insert own face verification"
ON public.face_verifications;

CREATE POLICY "Users can insert own face verification"
  ON public.face_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());


-- A user can update ONLY their own verification record.
DROP POLICY IF EXISTS "Users can update own face verification"
ON public.face_verifications;

CREATE POLICY "Users can update own face verification"
  ON public.face_verifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- Users must NEVER be able to delete someone else's record.
DROP POLICY IF EXISTS "Users can delete own face verification"
ON public.face_verifications;

CREATE POLICY "Users can delete own face verification"
  ON public.face_verifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- Helpful view for public application queries
-- ============================================================
-- DO NOT expose the embedding.
--
-- This gives the application a safe way to determine whether
-- another profile has been verified.
-- ============================================================

CREATE OR REPLACE VIEW public.verified_profiles
WITH (security_invoker = true)
AS
SELECT
  user_id,
  status,
  verified_at
FROM public.face_verifications
WHERE status = 'verified';


-- The biometric embedding itself is deliberately NOT included.
