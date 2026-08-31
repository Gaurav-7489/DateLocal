-- ============================================================
-- DateBu — Invalidate Face Verification on Primary Photo Change
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_profile_photo_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.is_primary = true) OR
     (TG_OP = 'UPDATE' AND (NEW.is_primary = true OR OLD.is_primary = true) AND (NEW.storage_path <> OLD.storage_path OR NEW.is_primary <> OLD.is_primary)) OR
     (TG_OP = 'DELETE' AND OLD.is_primary = true) THEN

     UPDATE public.face_verifications
     SET status = 'pending',
         reference_embedding = NULL,
         verified_at = NULL,
         updated_at = NOW()
     WHERE user_id = COALESCE(NEW.profile_id, OLD.profile_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS tr_invalidate_face_verification ON public.profile_photos;

CREATE TRIGGER tr_invalidate_face_verification
AFTER INSERT OR UPDATE OR DELETE ON public.profile_photos
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_photo_change();