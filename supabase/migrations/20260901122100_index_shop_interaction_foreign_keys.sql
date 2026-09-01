create index if not exists idx_shop_orders_target_user_id on public.shop_orders(target_user_id);
create index if not exists idx_superchats_shop_order_id on public.superchats(shop_order_id);
create index if not exists idx_superlikes_recipient_id on public.superlikes(recipient_id);
