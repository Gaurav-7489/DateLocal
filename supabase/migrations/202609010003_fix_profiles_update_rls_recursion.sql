-- Fix recursive profiles UPDATE RLS policy.
-- The previous policy queried public.profiles from inside a public.profiles policy,
-- which caused: "infinite recursion detected in policy for relation profiles".

ALTER POLICY "Users can update own profile"
ON public.profiles
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = 'STUDENT'::user_role
);
