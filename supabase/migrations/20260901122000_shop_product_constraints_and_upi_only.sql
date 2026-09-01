-- Keep the shop catalog and production constraint in sync.
alter table public.shop_orders drop constraint if exists shop_orders_product_check;
alter table public.shop_orders add constraint shop_orders_product_check
  check (product in (
    'extra_likes_5',
    'extra_likes_15',
    'extra_likes_30',
    'superlike_1',
    'superlike_5',
    'superchat_credit_1',
    'superchat_credit_3',
    'superchat'
  ));
