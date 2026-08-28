-- ============================================================
-- TABLE: passes
-- ============================================================
-- Tracks directional passes between users.

CREATE TABLE IF NOT EXISTS public.passes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (passer_id, passed_id),
  CHECK (passer_id != passed_id)
);

COMMENT ON TABLE public.passes IS 'Directional passes between users.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_passes_passer_id ON public.passes (passer_id);
CREATE INDEX IF NOT EXISTS idx_passes_passed_id ON public.passes (passed_id);

-- RLS
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- Users can read passes they sent
DROP POLICY IF EXISTS "Users can read own passes" ON public.passes;
CREATE POLICY "Users can read own passes"
  ON public.passes FOR SELECT
  TO authenticated
  USING (passer_id = auth.uid());

-- Users can insert passes they send
DROP POLICY IF EXISTS "Users can insert own passes" ON public.passes;
CREATE POLICY "Users can insert own passes"
  ON public.passes FOR INSERT
  TO authenticated
  WITH CHECK (passer_id = auth.uid());
