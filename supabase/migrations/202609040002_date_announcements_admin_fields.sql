alter table public.news_posts
  add column if not exists post_type text not null default 'announcement'
  check (post_type in ('announcement','update','maintenance'));

alter table public.news_posts
  add column if not exists is_published boolean not null default true;

create index if not exists idx_news_posts_published_created_at
  on public.news_posts(is_published, created_at desc);
