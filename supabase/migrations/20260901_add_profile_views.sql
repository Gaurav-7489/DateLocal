create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references auth.users(id) on delete cascade,
  viewed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint profile_views_not_self check (viewer_id <> viewed_id)
);

create index if not exists profile_views_viewed_id_created_at_idx
  on public.profile_views (viewed_id, created_at desc);
create index if not exists profile_views_viewer_id_created_at_idx
  on public.profile_views (viewer_id, created_at desc);

alter table public.profile_views enable row level security;

drop policy if exists "Users can insert their own profile views" on public.profile_views;
create policy "Users can insert their own profile views"
  on public.profile_views for insert
  to authenticated
  with check (auth.uid() = viewer_id and viewer_id <> viewed_id);

drop policy if exists "Users can read views of their profile" on public.profile_views;
create policy "Users can read views of their profile"
  on public.profile_views for select
  to authenticated
  using (auth.uid() = viewed_id);
