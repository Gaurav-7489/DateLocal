-- Serves the exact Discover candidate scan: eligible, visible profiles in
-- newest-first order. Existing single-column indexes do not cover this filter
-- and ordering combination.
CREATE INDEX IF NOT EXISTS idx_profiles_discover_created_at
  ON public.profiles (created_at DESC)
  WHERE profile_completed = true AND ghost_mode = false;
