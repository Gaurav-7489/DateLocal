-- Allow authenticated users to read their own profile photo metadata.
-- Discover remains protected through the security-definer RPC.

DROP POLICY IF EXISTS "Users can view own profile photos"
ON public.profile_photos;

CREATE POLICY "Users can view own profile photos"
ON public.profile_photos
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());
