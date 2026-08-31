-- ============================================================
-- DateBu: Discover seen state, match realtime, and super admin
-- ============================================================

-- 1. Persist profiles that have actually been shown in Discover.
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

-- 2. Promote the configured owner account to SUPER_ADMIN.
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE id = '598413f6-3f47-44ae-a03c-c26f128f5d0b';

-- 3. Ensure match/message inserts are visible through Supabase Realtime.
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
