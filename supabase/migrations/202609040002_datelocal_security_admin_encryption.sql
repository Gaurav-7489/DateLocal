begin;

alter table public.messages add column if not exists ciphertext text;
alter table public.messages add column if not exists encryption_version smallint not null default 0;
alter table public.messages alter column content drop not null;

create table if not exists public.message_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_key text not null,
  algorithm text not null default 'ECDH-P256-AES-256-GCM',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.message_keys enable row level security;
revoke all on table public.message_keys from anon;
grant select, insert, update on table public.message_keys to authenticated;
drop policy if exists "message_keys_read_authenticated" on public.message_keys;
create policy "message_keys_read_authenticated" on public.message_keys for select to authenticated using (true);
drop policy if exists "message_keys_insert_own" on public.message_keys;
create policy "message_keys_insert_own" on public.message_keys for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "message_keys_update_own" on public.message_keys;
create policy "message_keys_update_own" on public.message_keys for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.reports add column if not exists reviewed_by uuid references auth.users(id);
alter table public.reports add column if not exists reviewed_at timestamptz;
alter table public.reports add column if not exists admin_note text;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_logs enable row level security;
revoke all on table public.admin_audit_logs from anon, authenticated;

create index if not exists messages_match_created_idx on public.messages(match_id, created_at desc);
create index if not exists reports_status_created_idx on public.reports(status, created_at desc);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs(created_at desc);

commit;
