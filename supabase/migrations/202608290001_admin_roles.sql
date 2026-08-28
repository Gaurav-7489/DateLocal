-- ============================================================
-- DateBu Admin Roles
-- ============================================================
-- Adds a database-enforced role system to profiles.
-- Normal users default to STUDENT and cannot change their role
-- through the normal profile update policy.
-- ============================================================

-- 1. Role enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'user_role'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.user_role AS ENUM (
      'SUPER_ADMIN',
      'ADMIN',
      'MODERATOR',
      'VERIFIED_STUDENT',
      'STUDENT',
      'SUSPENDED',
      'BANNED'
    );
  END IF;
END
$$;

-- 2. Add role to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.user_role
  NOT NULL DEFAULT 'STUDENT';

-- 3. Index for admin/user filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

-- 4. Replace the normal profile update policy.
--
-- Users can update their own profile fields, but the role must
-- remain unchanged. This prevents a student from promoting
-- themselves to ADMIN through the normal Supabase client.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (
      SELECT p.role
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
    )
  );

-- 5. Keep role protected from normal INSERT as well.
--
-- A newly-created profile must always start as STUDENT.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role = 'STUDENT'
  );

-- 6. Helpful documentation
COMMENT ON COLUMN public.profiles.role IS
  'Authorization role. Defaults to STUDENT and is controlled by trusted server/admin operations.';
