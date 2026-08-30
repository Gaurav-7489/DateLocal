create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news_posts enable row level security;
drop policy if exists "Anyone can read news" on public.news_posts;
create policy "Anyone can read news" on public.news_posts for select to anon, authenticated using (true);
