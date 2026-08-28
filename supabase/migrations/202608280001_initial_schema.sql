-- ============================================================
-- DateBu — Phase 3: Initial Database Schema
-- ============================================================
-- Migration: 0001_initial_schema.sql
-- Description: Creates foundational tables, RLS policies,
--              indexes, triggers, and seeds initial interests.
--              Fully idempotent to allow safe replay.
-- ============================================================

-- ============================================================
-- UTILITY: updated_at trigger function
-- ============================================================

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


-- ============================================================
-- TABLE: profiles
-- ============================================================
-- One-to-one with auth.users. Created during profile setup
-- (not on registration), matching the existing app flow.

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  date_of_birth   DATE NOT NULL,
  gender          TEXT NOT NULL
                    CHECK (gender IN ('man', 'woman', 'non-binary', 'other', 'prefer-not-to-say')),
  department      TEXT NOT NULL,
  academic_year   TEXT NOT NULL
                    CHECK (academic_year IN ('1st-year', '2nd-year', '3rd-year', '4th-year', '5th-year', 'postgraduate')),
  bio             TEXT,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile data, one-to-one with auth.users.';

-- updated_at trigger
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON public.profiles (profile_completed)
  WHERE profile_completed = true;
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles (gender);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles (department);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read completed profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read completed profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (profile_completed = true OR id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- ============================================================
-- TABLE: interests
-- ============================================================
-- Global reference data. Read-only for normal users.

CREATE TABLE IF NOT EXISTS public.interests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.interests IS 'Global interest catalog. Admin-managed.';

-- RLS
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read interests" ON public.interests;
CREATE POLICY "Authenticated users can read interests"
  ON public.interests FOR SELECT
  TO authenticated
  USING (true);


-- ============================================================
-- TABLE: profile_interests
-- ============================================================
-- Many-to-many: profiles <-> interests

CREATE TABLE IF NOT EXISTS public.profile_interests (
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (profile_id, interest_id)
);

COMMENT ON TABLE public.profile_interests IS 'Many-to-many relationship between profiles and interests.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_interests_interest_id ON public.profile_interests (interest_id);

-- RLS
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read profile interests" ON public.profile_interests;
CREATE POLICY "Authenticated users can read profile interests"
  ON public.profile_interests FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile interests" ON public.profile_interests;
CREATE POLICY "Users can insert own profile interests"
  ON public.profile_interests FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own profile interests" ON public.profile_interests;
CREATE POLICY "Users can delete own profile interests"
  ON public.profile_interests FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());


-- ============================================================
-- TABLE: profile_photos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profile_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profile_photos IS 'Photo metadata for profile images stored in Supabase Storage.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_photos_profile_id ON public.profile_photos (profile_id);

-- RLS
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read profile photos" ON public.profile_photos;
CREATE POLICY "Authenticated users can read profile photos"
  ON public.profile_photos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile photos" ON public.profile_photos;
CREATE POLICY "Users can insert own profile photos"
  ON public.profile_photos FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile photos" ON public.profile_photos;
CREATE POLICY "Users can update own profile photos"
  ON public.profile_photos FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own profile photos" ON public.profile_photos;
CREATE POLICY "Users can delete own profile photos"
  ON public.profile_photos FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());


-- ============================================================
-- TABLE: dating_preferences
-- ============================================================
-- One-to-one with auth.users. Stores dating filter preferences.

CREATE TABLE IF NOT EXISTS public.dating_preferences (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  interested_in         TEXT[] NOT NULL DEFAULT '{}',
  min_age               SMALLINT NOT NULL DEFAULT 18
                          CHECK (min_age >= 18 AND min_age <= 99),
  max_age               SMALLINT NOT NULL DEFAULT 25
                          CHECK (max_age >= 18 AND max_age <= 99),
  preferred_department  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (min_age <= max_age)
);

COMMENT ON TABLE public.dating_preferences IS 'User dating filter preferences.';

-- updated_at trigger
DROP TRIGGER IF EXISTS dating_preferences_updated_at ON public.dating_preferences;
CREATE TRIGGER dating_preferences_updated_at
  BEFORE UPDATE ON public.dating_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.dating_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own preferences" ON public.dating_preferences;
CREATE POLICY "Users can read own preferences"
  ON public.dating_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.dating_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.dating_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own preferences" ON public.dating_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.dating_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- TABLE: likes
-- ============================================================
-- Tracks directional likes between users.

CREATE TABLE IF NOT EXISTS public.likes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (liker_id, liked_id),
  CHECK (liker_id != liked_id)
);

COMMENT ON TABLE public.likes IS 'Directional likes between users.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON public.likes (liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id ON public.likes (liked_id);
CREATE INDEX IF NOT EXISTS idx_likes_reciprocal ON public.likes (liked_id, liker_id);

-- RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own likes" ON public.likes;
CREATE POLICY "Users can read own likes"
  ON public.likes FOR SELECT
  TO authenticated
  USING (liker_id = auth.uid() OR liked_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own likes" ON public.likes;
CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (liker_id = auth.uid());


-- ============================================================
-- TABLE: matches
-- ============================================================
-- Mutual matches. user_a < user_b enforced for uniqueness.

CREATE TABLE IF NOT EXISTS public.matches (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)
);

COMMENT ON TABLE public.matches IS 'Mutual matches between two users.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches (user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches (user_b);

-- RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own matches" ON public.matches;
CREATE POLICY "Users can read own matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid());

DROP POLICY IF EXISTS "Users can insert matches" ON public.matches;
CREATE POLICY "Users can insert matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());


-- ============================================================
-- SEED DATA: interests
-- ============================================================

INSERT INTO public.interests (name) VALUES
  ('Music'),
  ('Movies'),
  ('Gaming'),
  ('Programming'),
  ('Sports'),
  ('Travel'),
  ('Photography'),
  ('Reading'),
  ('Fitness'),
  ('Art'),
  ('Cooking'),
  ('Food'),
  ('Anime'),
  ('Dance'),
  ('Football'),
  ('Cricket'),
  ('Basketball'),
  ('Hiking'),
  ('Yoga'),
  ('Fashion'),
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
