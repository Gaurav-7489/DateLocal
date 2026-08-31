-- ============================================================
-- DateBu: Discover seen state, match realtime, and super admin
-- ============================================================

CREATE TABLE IF NOT EXISTS public.discover_views (
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, profile_id),
  CHECK (user_id <> profile_id)
);

CREATE INDEX IF NOT EXISTS idx_discover_views_user_id
  ON public.discover_views (user_id);

ALTER TABLE public.discover_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own discover views" ON public.discover_views;
CREATE POLICY "Users can read own discover views"
  ON public.discover_views
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own discover views" ON public.discover_views;
CREATE POLICY "Users can insert own discover views"
  ON public.discover_views
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Keep database dating-preference validation aligned with the app's
-- current 17+ profile rules.
ALTER TABLE public.dating_preferences
  DROP CONSTRAINT IF EXISTS dating_preferences_min_age_check,
  DROP CONSTRAINT IF EXISTS dating_preferences_max_age_check;

ALTER TABLE public.dating_preferences
  ADD CONSTRAINT dating_preferences_min_age_check
    CHECK (min_age >= 17 AND min_age <= 99),
  ADD CONSTRAINT dating_preferences_max_age_check
    CHECK (max_age >= 17 AND max_age <= 99);

-- Return a batch while persisting only the active/top profile as seen.
-- Likes and passes remain the durable interaction exclusions.
CREATE OR REPLACE FUNCTION public.get_discover_profiles(
  p_excluded_ids uuid[] default '{}',
  p_limit integer default 20
)
RETURNS TABLE (
  id uuid,
  display_name text,
  date_of_birth date,
  gender text,
  department text,
  academic_year text,
  bio text,
  ghost_mode boolean,
  created_at timestamptz,
  profile_photos jsonb,
  profile_interests jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH candidates AS MATERIALIZED (
    SELECT p.*
    FROM public.profiles p
    WHERE
      p.profile_completed = true
      AND p.ghost_mode = false
      AND p.id <> auth.uid()
      AND NOT (p.id = ANY(COALESCE(p_excluded_ids, '{}')))
      AND NOT EXISTS (
        SELECT 1
        FROM public.discover_views dv
        WHERE dv.user_id = auth.uid()
          AND dv.profile_id = p.id
      )
    ORDER BY p.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100))
  ),
  mark_seen AS (
    INSERT INTO public.discover_views (user_id, profile_id)
    SELECT auth.uid(), c.id
    FROM candidates c
    ORDER BY c.created_at DESC
    LIMIT 1
    ON CONFLICT (user_id, profile_id) DO NOTHING
    RETURNING profile_id
  )
  SELECT
    c.id,
    c.display_name,
    c.date_of_birth,
    c.gender,
    c.department,
    c.academic_year,
    c.bio,
    c.ghost_mode,
    c.created_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'storage_path', pp.storage_path,
            'display_order', pp.display_order,
            'is_primary', pp.is_primary
          )
          ORDER BY pp.is_primary DESC, pp.display_order ASC
        )
        FROM public.profile_photos pp
        WHERE pp.profile_id = c.id
      ),
      '[]'::jsonb
    ) AS profile_photos,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'interests', jsonb_build_object('id', i.id, 'name', i.name)
          )
        )
        FROM public.profile_interests pi
        JOIN public.interests i ON i.id = pi.interest_id
        WHERE pi.profile_id = c.id
      ),
      '[]'::jsonb
    ) AS profile_interests
  FROM candidates c;
$$;

REVOKE ALL
ON FUNCTION public.get_discover_profiles(uuid[], integer)
FROM public;

GRANT EXECUTE
ON FUNCTION public.get_discover_profiles(uuid[], integer)
TO authenticated;

-- Promote the configured owner account to SUPER_ADMIN.
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE id = '598413f6-3f47-44ae-a03c-c26f128f5d0b';

-- Ensure match/message inserts are visible through Supabase Realtime.
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END
$$;
