-- Remove confirmed legacy tables/schemas that are no longer referenced by the standalone app.
DROP TABLE IF EXISTS public.users;
DROP SCHEMA IF EXISTS extrovert CASCADE;

-- Give the remaining trigger functions/trigger names standalone Extrovert names.
ALTER FUNCTION public.sync_extrovert_identity_to_datebu() RENAME TO sync_extrovert_identity_to_profile;
ALTER TRIGGER trg_sync_extrovert_identity_to_datebu ON public.extrovert_profiles RENAME TO extrovert_profile_sync;
ALTER FUNCTION public.sync_datelocal_identity_from_extrovert() RENAME TO sync_profile_identity_from_extrovert;
ALTER TRIGGER trg_datelocal_identity_authority ON public.profiles RENAME TO extrovert_identity_authority;

-- Keep authenticated-only RLS checks efficient by evaluating auth.uid() once per statement.
DROP POLICY IF EXISTS extrovert_profile_self_read ON public.extrovert_profiles;
CREATE POLICY extrovert_profile_self_read ON public.extrovert_profiles FOR SELECT TO authenticated USING (id = (select auth.uid()));
DROP POLICY IF EXISTS extrovert_profile_self_insert ON public.extrovert_profiles;
CREATE POLICY extrovert_profile_self_insert ON public.extrovert_profiles FOR INSERT TO authenticated WITH CHECK (id = (select auth.uid()));
DROP POLICY IF EXISTS extrovert_profile_self_update ON public.extrovert_profiles;
CREATE POLICY extrovert_profile_self_update ON public.extrovert_profiles FOR UPDATE TO authenticated USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS extrovert_reports_insert ON public.extrovert_reports;
CREATE POLICY extrovert_reports_insert ON public.extrovert_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = (select auth.uid()) AND reported_id <> (select auth.uid()));
DROP POLICY IF EXISTS extrovert_blocks_participant ON public.extrovert_blocks;
CREATE POLICY extrovert_blocks_participant ON public.extrovert_blocks FOR ALL TO authenticated USING (blocker_id = (select auth.uid())) WITH CHECK (blocker_id = (select auth.uid()) AND blocked_id <> (select auth.uid()));
DROP POLICY IF EXISTS "users can read own verification sessions" ON public.extrovert_verification_sessions;
CREATE POLICY "users can read own verification sessions" ON public.extrovert_verification_sessions FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "users can read own area verifications" ON public.extrovert_area_verifications;
CREATE POLICY "users can read own area verifications" ON public.extrovert_area_verifications FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS token_wallet_select_own ON public.extrovert_token_wallets;
CREATE POLICY token_wallet_select_own ON public.extrovert_token_wallets FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS token_ledger_select_own ON public.extrovert_token_ledger;
CREATE POLICY token_ledger_select_own ON public.extrovert_token_ledger FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
