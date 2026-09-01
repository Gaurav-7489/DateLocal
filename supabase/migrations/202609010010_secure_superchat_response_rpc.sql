drop policy if exists "Recipients can update superchats" on public.superchats;
create or replace function public.respond_to_superchat(p_superchat_id uuid,p_accept boolean)
returns table(match_id uuid)
language plpgsql security definer set search_path=public
as $$
declare v_request public.superchats%rowtype; v_user uuid:=auth.uid(); v_a uuid; v_b uuid; v_match uuid;
begin
  select * into v_request from public.superchats where id=p_superchat_id and recipient_id=v_user for update;
  if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
  if v_request.status <> 'pending' then raise exception 'REQUEST_ALREADY_HANDLED'; end if;
  if exists(select 1 from public.blocks b where (b.blocker_id=v_user and b.blocked_id=v_request.sender_id) or (b.blocker_id=v_request.sender_id and b.blocked_id=v_user)) then raise exception 'USER_UNAVAILABLE'; end if;
  if not p_accept then update public.superchats set status='declined',seen_at=now() where id=p_superchat_id; return query select null::uuid; return; end if;
  v_a:=least(v_user,v_request.sender_id); v_b:=greatest(v_user,v_request.sender_id);
  insert into public.matches(user_a,user_b) values(v_a,v_b) on conflict(user_a,user_b) do nothing returning id into v_match;
  if v_match is null then select id into v_match from public.matches where user_a=v_a and user_b=v_b; end if;
  update public.superchats set status='accepted',seen_at=now() where id=p_superchat_id;
  return query select v_match;
end;
$$;
revoke all on function public.respond_to_superchat(uuid,boolean) from public;
grant execute on function public.respond_to_superchat(uuid,boolean) to authenticated;
