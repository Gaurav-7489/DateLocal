-- Securely expose only the Pro status needed by Discover ranking.
-- The subscriptions table remains private to each account.
CREATE OR REPLACE FUNCTION public.get_extrovert_user_ids(p_user_ids uuid[])
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id
  FROM public.subscriptions s
  WHERE s.user_id = ANY(p_user_ids)
    AND s.plan = 'pro'
    AND (
      (s.status = 'trialing' AND s.trial_ends_at > now())
      OR
      (s.status = 'active' AND s.current_period_end > now())
    );
$$;

REVOKE ALL ON FUNCTION public.get_extrovert_user_ids(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_extrovert_user_ids(uuid[]) TO authenticated;

COMMENT ON FUNCTION public.get_extrovert_user_ids(uuid[]) IS
  'Returns only currently active DateBu Extrovert user IDs for discovery ranking; no subscription details are exposed.';
