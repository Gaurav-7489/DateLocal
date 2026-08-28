-- ============================================================
-- DateBu Pro Subscription Foundation
-- ============================================================

-- ------------------------------------------------------------
-- 1. Subscription table
-- ------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique,

  -- free / pro
  plan text not null default 'free'
    check (plan in ('free', 'pro')),

  -- inactive / trialing / active / cancelled / expired
  status text not null default 'inactive'
    check (
      status in (
        'inactive',
        'trialing',
        'active',
        'cancelled',
        'expired'
      )
    ),

  -- One-time introductory trial
  trial_started_at timestamptz,
  trial_ends_at timestamptz,

  -- Paid subscription period
  current_period_start timestamptz,
  current_period_end timestamptz,

  -- Razorpay references
  razorpay_customer_id text,
  razorpay_subscription_id text,

  -- Useful payment metadata
  last_payment_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 2. Indexes
-- ------------------------------------------------------------

create index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions(status);

create index if not exists subscriptions_period_end_idx
  on public.subscriptions(current_period_end);


-- ------------------------------------------------------------
-- 3. Updated-at trigger
-- ------------------------------------------------------------

create or replace function public.set_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_updated_at
on public.subscriptions;

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_subscription_updated_at();


-- ------------------------------------------------------------
-- 4. Enable Row Level Security
-- ------------------------------------------------------------

alter table public.subscriptions enable row level security;


-- ------------------------------------------------------------
-- 5. Users can read their own subscription
-- ------------------------------------------------------------

drop policy if exists "Users can view own subscription"
on public.subscriptions;

create policy "Users can view own subscription"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 6. Users CANNOT directly create/update/delete subscriptions
--
-- Important:
-- Payment/subscription changes will eventually happen through
-- trusted server-side code / Razorpay webhook handling.
-- ------------------------------------------------------------

drop policy if exists "Users cannot insert subscriptions"
on public.subscriptions;

drop policy if exists "Users cannot update subscriptions"
on public.subscriptions;

drop policy if exists "Users cannot delete subscriptions"
on public.subscriptions;


-- ------------------------------------------------------------
-- 7. Helper function:
--    Is the current user actually Pro?
--
-- This checks the DATE as well as status.
-- Therefore an expired subscription automatically behaves
-- like Free even if the row still says active/trialing.
-- ------------------------------------------------------------

create or replace function public.is_datebu_pro()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = auth.uid()
      and plan = 'pro'
      and status in ('trialing', 'active')
      and (
        (status = 'trialing' and trial_ends_at > now())
        or
        (status = 'active' and current_period_end > now())
      )
  );
$$;


-- ------------------------------------------------------------
-- 8. Helper function:
--    Return complete subscription information for current user
-- ------------------------------------------------------------

create or replace function public.get_my_subscription()
returns table (
  plan text,
  status text,
  is_pro boolean,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.plan,
    s.status,

    (
      s.plan = 'pro'
      and s.status in ('trialing', 'active')
      and (
        (s.status = 'trialing' and s.trial_ends_at > now())
        or
        (s.status = 'active' and s.current_period_end > now())
      )
    ) as is_pro,

    s.trial_started_at,
    s.trial_ends_at,
    s.current_period_start,
    s.current_period_end

  from public.subscriptions s
  where s.user_id = auth.uid();
$$;


-- ------------------------------------------------------------
-- 9. Grant access to the helper functions
-- ------------------------------------------------------------

grant execute on function public.is_datebu_pro()
to authenticated;

grant execute on function public.get_my_subscription()
to authenticated;


-- ------------------------------------------------------------
-- 10. Comments / documentation
-- ------------------------------------------------------------

comment on table public.subscriptions is
  'DateBu Pro subscription and one-time trial state.';

comment on column public.subscriptions.trial_started_at is
  'Timestamp when the users one-time DateBu Pro trial started.';

comment on column public.subscriptions.trial_ends_at is
  'Timestamp when the one-time DateBu Pro trial expires.';

comment on column public.subscriptions.current_period_end is
  'End of the currently paid Pro subscription period.';

comment on column public.subscriptions.razorpay_subscription_id is
  'Razorpay subscription identifier used for recurring billing.';
