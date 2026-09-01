-- DateBu freemium model + profile access + one-time shop products
-- Applied to production on 2026-09-01.

alter table public.profiles
  add column if not exists starter_likes_remaining integer not null default 7,
  add column if not exists daily_likes_used integer not null default 0,
  add column if not exists daily_likes_date date not null default (timezone('Asia/Kolkata', now())::date);

create table if not exists public.like_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  purchased_likes integer not null default 0 check (purchased_likes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.like_wallets enable row level security;
drop policy if exists "Users can view own like wallet" on public.like_wallets;
create policy "Users can view own like wallet" on public.like_wallets for select to authenticated using (user_id = auth.uid());
create index if not exists idx_like_wallets_user_id on public.like_wallets(user_id);

create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null check (product in ('extra_likes_5','extra_likes_15','extra_likes_30','superchat')),
  amount_paise integer not null check (amount_paise > 0),
  quantity integer not null default 0,
  target_user_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shop_orders enable row level security;
drop policy if exists "Users can view own shop orders" on public.shop_orders;
create policy "Users can view own shop orders" on public.shop_orders for select to authenticated using (user_id = auth.uid());
create index if not exists idx_shop_orders_user_id on public.shop_orders(user_id);
create index if not exists idx_shop_orders_razorpay_order_id on public.shop_orders(razorpay_order_id);

create table if not exists public.superchats (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) between 1 and 500),
  shop_order_id uuid references public.shop_orders(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','seen','accepted','declined')),
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  check (sender_id <> recipient_id)
);
alter table public.superchats enable row level security;
drop policy if exists "Users can read own superchats" on public.superchats;
create policy "Users can read own superchats" on public.superchats for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());
drop policy if exists "Recipients can update superchats" on public.superchats;
create policy "Recipients can update superchats" on public.superchats for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create index if not exists idx_superchats_recipient_status on public.superchats(recipient_id, status, created_at desc);
create index if not exists idx_superchats_sender on public.superchats(sender_id, created_at desc);

-- Atomic like allowance. Free: 7 one-time starter likes, then 2/day. Extrovert: 10/day.
-- Purchased likes are consumed only after the normal allowance is exhausted.
create or replace function public.like_profile(p_profile_id uuid)
returns table(matched boolean, match_id uuid)
language plpgsql security definer set search_path=public
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_a uuid;
  v_user_b uuid;
  v_match_id uuid;
  v_is_pro boolean := public.is_datebu_pro();
  v_today date := timezone('Asia/Kolkata', now())::date;
  v_starter integer;
  v_daily integer;
  v_purchased integer;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if v_user_id = p_profile_id then raise exception 'INVALID_PROFILE'; end if;
  if not exists (select 1 from public.profiles p where p.id = p_profile_id and p.profile_completed = true and p.ghost_mode = false) then raise exception 'PROFILE_UNAVAILABLE'; end if;
  if exists (select 1 from public.blocks b where (b.blocker_id = v_user_id and b.blocked_id = p_profile_id) or (b.blocker_id = p_profile_id and b.blocked_id = v_user_id)) then raise exception 'USER_UNAVAILABLE'; end if;

  insert into public.like_wallets(user_id) values (v_user_id) on conflict (user_id) do nothing;
  update public.profiles set daily_likes_used = 0, daily_likes_date = v_today where id = v_user_id and daily_likes_date <> v_today;
  select p.starter_likes_remaining, p.daily_likes_used into v_starter, v_daily from public.profiles p where p.id = v_user_id for update;
  select lw.purchased_likes into v_purchased from public.like_wallets lw where lw.user_id = v_user_id for update;

  if v_is_pro then
    if v_daily < 10 then
      update public.profiles set daily_likes_used = daily_likes_used + 1 where id = v_user_id;
    elsif v_purchased > 0 then
      update public.like_wallets set purchased_likes = purchased_likes - 1, updated_at = now() where user_id = v_user_id;
    else
      raise exception 'LIKE_LIMIT_REACHED';
    end if;
  elsif v_starter > 0 then
    update public.profiles set starter_likes_remaining = starter_likes_remaining - 1 where id = v_user_id;
  elsif v_daily < 2 then
    update public.profiles set daily_likes_used = daily_likes_used + 1 where id = v_user_id;
  elsif v_purchased > 0 then
    update public.like_wallets set purchased_likes = purchased_likes - 1, updated_at = now() where user_id = v_user_id;
  else
    raise exception 'LIKE_LIMIT_REACHED';
  end if;

  insert into public.likes(liker_id, liked_id) values (v_user_id, p_profile_id) on conflict (liker_id, liked_id) do nothing;
  v_user_a := least(v_user_id, p_profile_id); v_user_b := greatest(v_user_id, p_profile_id);
  if exists (select 1 from public.likes l where l.liker_id = p_profile_id and l.liked_id = v_user_id) then
    insert into public.matches(user_a, user_b) values (v_user_a, v_user_b) on conflict (user_a, user_b) do nothing returning id into v_match_id;
    if v_match_id is null then select m.id into v_match_id from public.matches m where m.user_a=v_user_a and m.user_b=v_user_b; end if;
    return query select true, v_match_id; return;
  end if;
  return query select false, null::uuid;
end;
$$;
grant execute on function public.like_profile(uuid) to authenticated;

create or replace function public.get_like_status()
returns table(starter_remaining integer, daily_used integer, daily_limit integer, purchased_remaining integer, is_pro boolean)
language sql stable security definer set search_path=public
as $$
  select p.starter_likes_remaining,
         case when p.daily_likes_date = timezone('Asia/Kolkata', now())::date then p.daily_likes_used else 0 end,
         case when public.is_datebu_pro() then 10 else 2 end,
         coalesce(lw.purchased_likes,0),
         public.is_datebu_pro()
  from public.profiles p
  left join public.like_wallets lw on lw.user_id=p.id
  where p.id=auth.uid();
$$;
grant execute on function public.get_like_status() to authenticated;

-- Secure profile viewing RPC used from matches/chat/discover profile links.
create or replace function public.get_student_profile(p_user_id uuid)
returns table(id uuid, display_name text, date_of_birth date, gender text, department text, academic_year text, bio text, profile_completed boolean, ghost_mode boolean, campus_residency text, relationship_goal text, zodiac text, sleep_habit text, caffeine_pref text, weekend_vibe text, prompt_question text, prompt_answer text, profile_photos jsonb, profile_interests jsonb)
language sql stable security definer set search_path=public
as $$
  select p.id,p.display_name,p.date_of_birth,p.gender,p.department,p.academic_year,p.bio,p.profile_completed,p.ghost_mode,p.campus_residency,p.relationship_goal,p.zodiac,p.sleep_habit,p.caffeine_pref,p.weekend_vibe,p.prompt_question,p.prompt_answer,
    coalesce((select jsonb_agg(jsonb_build_object('id',pp.id,'storage_path',pp.storage_path,'is_primary',pp.is_primary,'display_order',pp.display_order) order by pp.is_primary desc,pp.display_order asc) from public.profile_photos pp where pp.profile_id=p.id),'[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'name',i.name)) from public.profile_interests pi join public.interests i on i.id=pi.interest_id where pi.profile_id=p.id),'[]'::jsonb)
  from public.profiles p
  where p.id=p_user_id and p.profile_completed=true and p.ghost_mode=false and p.id<>auth.uid()
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=auth.uid()));
$$;
revoke all on function public.get_student_profile(uuid) from public;
grant execute on function public.get_student_profile(uuid) to authenticated;

create or replace function public.fulfill_shop_order(p_order_id uuid)
returns boolean
language plpgsql security definer set search_path=public
as $$
declare v_order public.shop_orders%rowtype;
begin
  select * into v_order from public.shop_orders where id=p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status='paid' and v_order.fulfilled_at is not null then return true; end if;
  if v_order.product like 'extra_likes_%' then
    insert into public.like_wallets(user_id,purchased_likes) values(v_order.user_id,v_order.quantity)
    on conflict(user_id) do update set purchased_likes=public.like_wallets.purchased_likes+excluded.purchased_likes,updated_at=now();
  elsif v_order.product='superchat' then
    insert into public.superchats(sender_id,recipient_id,content,shop_order_id)
    values(v_order.user_id,v_order.target_user_id,coalesce(v_order.payload->>'content',''),v_order.id);
  end if;
  update public.shop_orders set status='paid', fulfilled_at=now(), updated_at=now() where id=p_order_id;
  return true;
end;
$$;
revoke all on function public.fulfill_shop_order(uuid) from public;
