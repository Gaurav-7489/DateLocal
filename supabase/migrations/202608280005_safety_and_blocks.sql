-- ============================================================
-- DateBu — Phase 5: Safety, Blocks, Reports & Ghost Mode
-- ============================================================
-- Migration: 202608280005_safety_and_blocks.sql
-- Description: Adds ghost_mode to profiles, creates blocks and
--              reports tables with RLS and indexes.
-- ============================================================

-- 1. Add ghost_mode column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ghost_mode BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_ghost_mode
  ON public.profiles (ghost_mode) WHERE ghost_mode = false;


-- 2. TABLE: blocks
CREATE TABLE IF NOT EXISTS public.blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

COMMENT ON TABLE public.blocks IS 'Tracks user block relationships to exclude from discovery, matching, and messaging.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_id ON public.blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks (blocked_id);
CREATE INDEX IF NOT EXISTS idx_blocks_pair ON public.blocks (blocker_id, blocked_id);

-- RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own blocks" ON public.blocks;
CREATE POLICY "Users can read own blocks"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own blocks" ON public.blocks;
CREATE POLICY "Users can insert own blocks"
  ON public.blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own blocks" ON public.blocks;
CREATE POLICY "Users can delete own blocks"
  ON public.blocks FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());


-- 3. TABLE: reports
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (length(trim(reason)) > 0),
  CHECK (reporter_id != reported_id)
);

COMMENT ON TABLE public.reports IS 'User safety reports submitted for moderation.';

-- updated_at trigger
DROP TRIGGER IF EXISTS reports_updated_at ON public.reports;
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON public.reports (reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);

-- RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submitted reports" ON public.reports;
CREATE POLICY "Users can view own submitted reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can submit reports" ON public.reports;
CREATE POLICY "Users can submit reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

