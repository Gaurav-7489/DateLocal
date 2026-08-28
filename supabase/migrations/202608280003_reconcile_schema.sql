-- ============================================================
-- DateBu — 0002: Schema Reconciliation
-- ============================================================
--
-- Purpose:
--   Reconcile the remote Supabase database (created manually
--   before the migration system) with the intended schema from
--   0001_initial_schema.sql and the application frontend.
--
-- Safety:
--   - Does NOT drop/truncate/recreate any table
--   - Preserves all existing rows
--   - All NOT NULL conversions verified: 0 NULL values exist
--   - profile_photos has 0 rows: column changes are safe
--   - All operations are idempotent or guarded with IF checks
--     to allow safe re-run after partial failure
--
-- Pre-migration data inspection performed 2026-08-27:
--   profiles:           2 rows, 0 NULLs in target columns
--   dating_preferences: 2 rows, 0 NULLs in min_age/max_age
--   profile_photos:     0 rows
--   profile_interests:  8 rows
--   interests:          20 rows
-- ============================================================


-- ============================================================
-- 1. profile_photos: RENAME user_id → profile_id
-- ============================================================
-- The actual DB column is "user_id" but the application code,
-- migration 0001, TypeScript types, and RLS policies all
-- expect "profile_id".
--
-- profile_photos currently has 0 rows — this is a safe rename.
-- PostgreSQL RENAME COLUMN preserves the FK, indexes, and
-- default; we just need to update RLS policies afterwards.
--
-- Guarded: only renames if user_id still exists (safe for re-run).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profile_photos'
      AND column_name  = 'user_id'
  ) THEN
    ALTER TABLE public.profile_photos RENAME COLUMN user_id TO profile_id;
  END IF;
END;
$$;


-- ============================================================
-- 2. profile_photos: ADD is_primary
-- ============================================================
-- The frontend (discover-client.tsx) queries and sorts by
-- is_primary. Column does not exist in the remote DB.
-- 0 existing rows, so DEFAULT false is safe.
-- IF NOT EXISTS makes this idempotent.

ALTER TABLE public.profile_photos
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;


-- ============================================================
-- 3. profile_photos: UPDATE RLS POLICIES
-- ============================================================
-- After renaming user_id → profile_id, existing policies that
-- reference "user_id" must be updated.
--
-- Rather than guessing policy names, we drop ALL existing
-- policies on profile_photos and recreate the canonical set.
-- This guarantees no orphaned/duplicate policies regardless
-- of what the remote DB named them.

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profile_photos'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profile_photos', pol.policyname);
  END LOOP;
END;
$$;

-- Recreate canonical policies using profile_id
CREATE POLICY "Authenticated users can read profile photos"
  ON public.profile_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile photos"
  ON public.profile_photos FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own profile photos"
  ON public.profile_photos FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own profile photos"
  ON public.profile_photos FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());


-- ============================================================
-- 4. profiles: DROP unused username column
-- ============================================================
-- Pre-migration check: username is NULL for all 2 rows.
-- Zero references in application code, types, or migrations.
-- No indexes, constraints, triggers, or policies depend on it.
-- IF EXISTS makes this idempotent.

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS username;


-- ============================================================
-- 5. profiles: ADD NOT NULL constraints
-- ============================================================
-- Pre-migration check: 0 NULL values in any of these columns
-- across all 2 existing rows. Safe to apply.
-- SET NOT NULL is idempotent (no-op if already NOT NULL).

ALTER TABLE public.profiles
  ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN date_of_birth SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN gender SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN department SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN academic_year SET NOT NULL;


-- ============================================================
-- 6. profiles: ADD CHECK constraints
-- ============================================================
-- Existing values: gender IN ('man', 'woman'), academic_year
-- IN ('3rd-year', '4th-year'). Both within the allowed sets.
-- Guarded: only adds if constraint name does not already exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_gender_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_gender_check
        CHECK (gender IN ('man', 'woman', 'non-binary', 'other', 'prefer-not-to-say'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_academic_year_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_academic_year_check
        CHECK (academic_year IN ('1st-year', '2nd-year', '3rd-year', '4th-year', '5th-year', 'postgraduate'));
  END IF;
END;
$$;


-- ============================================================
-- 7. dating_preferences: ADD NOT NULL + CHECK constraints
-- ============================================================
-- Pre-migration check: 0 NULLs in min_age/max_age.
-- Existing values: min_age=18, max_age=25 (both rows).
-- SET NOT NULL / SET DEFAULT are idempotent.
-- ADD CONSTRAINT is guarded with IF NOT EXISTS.

ALTER TABLE public.dating_preferences
  ALTER COLUMN min_age SET NOT NULL;

ALTER TABLE public.dating_preferences
  ALTER COLUMN min_age SET DEFAULT 18;

ALTER TABLE public.dating_preferences
  ALTER COLUMN max_age SET NOT NULL;

ALTER TABLE public.dating_preferences
  ALTER COLUMN max_age SET DEFAULT 25;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dating_preferences_min_age_check'
      AND conrelid = 'public.dating_preferences'::regclass
  ) THEN
    ALTER TABLE public.dating_preferences
      ADD CONSTRAINT dating_preferences_min_age_check
        CHECK (min_age >= 18 AND min_age <= 99);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dating_preferences_max_age_check'
      AND conrelid = 'public.dating_preferences'::regclass
  ) THEN
    ALTER TABLE public.dating_preferences
      ADD CONSTRAINT dating_preferences_max_age_check
        CHECK (max_age >= 18 AND max_age <= 99);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dating_preferences_age_range_check'
      AND conrelid = 'public.dating_preferences'::regclass
  ) THEN
    ALTER TABLE public.dating_preferences
      ADD CONSTRAINT dating_preferences_age_range_check
        CHECK (min_age <= max_age);
  END IF;
END;
$$;


-- ============================================================
-- 8. Seed missing interests
-- ============================================================
-- Current: 20 interests.
-- Adding 15 missing from the intended seed list.
-- Existing 5 extras (AI, Coding, Dancing, Entrepreneurship,
-- Singing) are preserved — they may be in use.
-- ON CONFLICT DO NOTHING makes this idempotent.

INSERT INTO public.interests (name) VALUES
  ('Food'),
  ('Dance'),
  ('Basketball'),
  ('Hiking'),
  ('Yoga'),
  ('Writing'),
  ('Volunteering'),
  ('Podcasts'),
  ('Startups'),
  ('Science'),
  ('History'),
  ('Languages'),
  ('Board Games'),
  ('Theatre'),
  ('Meditation')
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- 9. Ensure updated_at trigger function and triggers
-- ============================================================
-- CREATE OR REPLACE FUNCTION is idempotent.
-- Trigger creation is guarded with IF NOT EXISTS check.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
  ) THEN
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'dating_preferences_updated_at'
  ) THEN
    CREATE TRIGGER dating_preferences_updated_at
      BEFORE UPDATE ON public.dating_preferences
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;


-- ============================================================
-- 10. Ensure indexes exist
-- ============================================================
-- CREATE INDEX IF NOT EXISTS is idempotent.

CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed
  ON public.profiles (profile_completed) WHERE profile_completed = true;
CREATE INDEX IF NOT EXISTS idx_profiles_gender
  ON public.profiles (gender);
CREATE INDEX IF NOT EXISTS idx_profiles_department
  ON public.profiles (department);

CREATE INDEX IF NOT EXISTS idx_profile_interests_interest_id
  ON public.profile_interests (interest_id);

CREATE INDEX IF NOT EXISTS idx_profile_photos_profile_id
  ON public.profile_photos (profile_id);

CREATE INDEX IF NOT EXISTS idx_likes_liker_id
  ON public.likes (liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id
  ON public.likes (liked_id);
CREATE INDEX IF NOT EXISTS idx_likes_reciprocal
  ON public.likes (liked_id, liker_id);

CREATE INDEX IF NOT EXISTS idx_matches_user_a
  ON public.matches (user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b
  ON public.matches (user_b);


-- ============================================================
-- END OF RECONCILIATION
-- ============================================================
-- Summary of changes:
--   1. profile_photos.user_id → profile_id (rename, guarded)
--   2. profile_photos.is_primary added (IF NOT EXISTS)
--   3. profile_photos RLS policies: drop all + recreate canonical
--   4. profiles.username dropped (IF EXISTS)
--   5. profiles: 5 columns set NOT NULL (idempotent)
--   6. profiles: CHECK constraints added (guarded)
--   7. dating_preferences: NOT NULL + defaults + CHECKs (guarded)
--   8. 15 missing interests seeded (ON CONFLICT DO NOTHING)
--   9. updated_at trigger function + triggers ensured (guarded)
--  10. All intended indexes ensured (IF NOT EXISTS)
--
-- Idempotency:
--   All operations are safe to re-run after partial failure.
--   Exception: Step 3 (RLS policies) drops and recreates all
--   policies on profile_photos each time — this is by design
--   to ensure a clean canonical set.
-- ============================================================
