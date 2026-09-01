create table if not exists public.superlike_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  purchased_superlikes integer not null default 0 check (purchased_superlikes >= 0),
  updated_at timestamptz not null default now()
);
alter table public.superlike_wallets enable row level security;
drop policy if exists "Users can view own superlikes" on public.superlike_wallets;
create policy "Users can view own superlikes" on public.superlike_wallets for select using (auth.uid() = user_id);
drop policy if exists "Users can update own superlikes" on public.superlike_wallets;
create policy "Users can update own superlikes" on public.superlike_wallets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.superchat_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  purchased_superchats integer not null default 0 check (purchased_superchats >= 0),
  updated_at timestamptz not null default now()
);
alter table public.superchat_wallets enable row level security;
drop policy if exists "Users can view own superchat credits" on public.superchat_wallets;
create policy "Users can view own superchat credits" on public.superchat_wallets for select using (auth.uid() = user_id);

create table if not exists public.superlikes (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(sender_id, recipient_id)
);
alter table public.superlikes enable row level security;
drop policy if exists "Users can view own superlikes" on public.superlikes;
create policy "Users can view own superlikes" on public.superlikes for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create or replace function public.fulfill_shop_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=public as $function$
declare v_order public.shop_orders%rowtype;
begin
  select * into v_order from public.shop_orders where id=p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status='paid' and v_order.fulfilled_at is not null then return true; end if;
  if v_order.product like 'extra_likes_%' then
    insert into public.like_wallets(user_id,purchased_likes) values(v_order.user_id,v_order.quantity)
    on conflict(user_id) do update set purchased_likes=public.like_wallets.purchased_likes+excluded.purchased_likes,updated_at=now();
  elsif v_order.product like 'superlike_%' then
    insert into public.superlike_wallets(user_id,purchased_superlikes) values(v_order.user_id,v_order.quantity)
    on conflict(user_id) do update set purchased_superlikes=public.superlike_wallets.purchased_superlikes+excluded.purchased_superlikes,updated_at=now();
  elsif v_order.product like 'superchat_credit_%' then
    insert into public.superchat_wallets(user_id,purchased_superchats) values(v_order.user_id,v_order.quantity)
    on conflict(user_id) do update set purchased_superchats=public.superchat_wallets.purchased_superchats+excluded.purchased_superchats,updated_at=now();
  elsif v_order.product='superchat' then
    insert into public.superchats(sender_id,recipient_id,content,shop_order_id) values(v_order.user_id,v_order.target_user_id,coalesce(v_order.payload->>'content',''),v_order.id);
  end if;
  update public.shop_orders set status='paid',fulfilled_at=now(),updated_at=now() where id=p_order_id;
  return true;
end;
$function$;
