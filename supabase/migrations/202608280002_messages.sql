-- ============================================================
-- TABLE: messages
-- ============================================================
-- Messages belong to a mutual match.

CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (length(trim(content)) > 0),
  CHECK (length(content) <= 2000)
);

COMMENT ON TABLE public.messages IS 'Messages exchanged between matched users.';

-- Indexes
CREATE INDEX idx_messages_match_id_created_at
  ON public.messages (match_id, created_at);

CREATE INDEX idx_messages_sender_id
  ON public.messages (sender_id);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages from their own matches
CREATE POLICY "Users can read messages in own matches"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches
      WHERE matches.id = messages.match_id
        AND (matches.user_a = auth.uid() OR matches.user_b = auth.uid())
    )
  );

-- Users can send messages only in their own matches
CREATE POLICY "Users can send messages in own matches"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.matches
      WHERE matches.id = messages.match_id
        AND (matches.user_a = auth.uid() OR matches.user_b = auth.uid())
    )
  );
