-- ============================================================
-- DateBu — Didit Verification Integration
-- ============================================================
-- Replaces the old FaceX browser-side verification with Didit.
-- Adds a link to the Didit session and removes the hard
-- dependency on the FaceX reference embedding.
-- ============================================================

-- Allow existing records without an embedding (FaceX retired).
ALTER TABLE public.face_verifications
  ALTER COLUMN reference_embedding DROP NOT NULL;

-- Link each record to the originating Didit session.
ALTER TABLE public.face_verifications
  ADD COLUMN IF NOT EXISTS didit_session_id TEXT UNIQUE;

-- Fast lookup by Didit session for the webhook.
CREATE INDEX IF NOT EXISTS idx_face_verifications_didit_session
  ON public.face_verifications (didit_session_id);

COMMENT ON COLUMN public.face_verifications.didit_session_id IS
  'Didit session UUID. Used to correlate webhook events to DateBu users.';
