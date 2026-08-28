-- ============================================================
-- DateBu Razorpay Webhook Idempotency
-- ============================================================

create table if not exists public.razorpay_webhook_events (
  id uuid primary key default gen_random_uuid(),

  razorpay_event_id text not null unique,

  event_type text not null,

  processed_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

-- Only trusted server-side webhook processing should access this.
alter table public.razorpay_webhook_events enable row level security;

-- No client access.
revoke all on public.razorpay_webhook_events from anon;
revoke all on public.razorpay_webhook_events from authenticated;
