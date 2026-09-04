DROP POLICY IF EXISTS extrovert_reward_self_read ON public.extrovert_reward_ledger;
CREATE POLICY extrovert_reward_self_read ON public.extrovert_reward_ledger FOR SELECT TO authenticated USING (recipient_id = (select auth.uid()));
