-- Repair migration for Didit verification.
-- Migration 202608310007 is already recorded as applied,
-- but didit_session_id is missing from the actual table.

ALTER TABLE public.face_verifications
  ADD COLUMN IF NOT EXISTS didit_session_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS
  idx_face_verifications_didit_session_unique
  ON public.face_verifications (didit_session_id);

COMMENT ON COLUMN public.face_verifications.didit_session_id IS
  'Didit session UUID. Used to correlate webhook events to DateBu users.';
