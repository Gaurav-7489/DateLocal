revoke all on function public.fulfill_shop_order(uuid) from public, anon, authenticated;
grant execute on function public.fulfill_shop_order(uuid) to service_role;
revoke all on function public.send_superlike(uuid) from public, anon;
grant execute on function public.send_superlike(uuid) to authenticated;
revoke all on function public.send_superchat_with_credit(uuid,text) from public, anon;
grant execute on function public.send_superchat_with_credit(uuid,text) to authenticated;
