-- A user must be able to see a block relationship involving them for the
-- application's two-way block checks to work. This does not grant access to
-- unrelated relationships.
DROP POLICY IF EXISTS "Users can read own blocks" ON public.blocks;
CREATE POLICY "Users can read block relationships involving them"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid() OR blocked_id = auth.uid());

-- Keep user-controlled profile-photo metadata bounded even if a client bypasses
-- the form UI. Six is the product limit enforced by the uploader.
CREATE OR REPLACE FUNCTION public.enforce_profile_photo_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.profile_photos
    WHERE profile_id = NEW.profile_id
  ) >= 6 THEN
    RAISE EXCEPTION 'A profile can have at most six photos';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_photos_limit ON public.profile_photos;
CREATE TRIGGER profile_photos_limit
  BEFORE INSERT ON public.profile_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_photo_limit();
