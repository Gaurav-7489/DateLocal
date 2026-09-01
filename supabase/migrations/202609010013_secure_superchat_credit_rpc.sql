create or replace function public.send_superchat_with_credit(p_recipient_id uuid,p_content text)
returns boolean language plpgsql security definer set search_path=public as $function$
declare v_sender uuid := auth.uid(); v_balance integer;
begin
  if v_sender is null then raise exception 'AUTH_REQUIRED'; end if;
  if v_sender = p_recipient_id then raise exception 'INVALID_PROFILE'; end if;
  if length(trim(coalesce(p_content,''))) < 1 or length(p_content) > 500 then raise exception 'INVALID_CONTENT'; end if;
  if not exists (select 1 from public.profiles where id=p_recipient_id and profile_completed=true and ghost_mode=false) then raise exception 'PROFILE_UNAVAILABLE'; end if;
  if exists (select 1 from public.blocks where (blocker_id=v_sender and blocked_id=p_recipient_id) or (blocker_id=p_recipient_id and blocked_id=v_sender)) then raise exception 'USER_UNAVAILABLE'; end if;
  select purchased_superchats into v_balance from public.superchat_wallets where user_id=v_sender for update;
  if coalesce(v_balance,0) < 1 then raise exception 'SUPERCHAT_EMPTY'; end if;
  insert into public.superchats(sender_id,recipient_id,content) values(v_sender,p_recipient_id,trim(p_content));
  update public.superchat_wallets set purchased_superchats=purchased_superchats-1,updated_at=now() where user_id=v_sender;
  return true;
end;
$function$;
grant execute on function public.send_superchat_with_credit(uuid,text) to authenticated;
