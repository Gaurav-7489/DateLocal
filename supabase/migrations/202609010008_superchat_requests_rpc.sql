create or replace function public.get_superchat_requests()
returns table(id uuid,sender_id uuid,content text,created_at timestamptz,display_name text,department text,academic_year text,profile_photos jsonb)
language sql stable security definer set search_path=public
as $$
  select sc.id,sc.sender_id,sc.content,sc.created_at,p.display_name,p.department,p.academic_year,
    coalesce((select jsonb_agg(jsonb_build_object('storage_path',pp.storage_path,'is_primary',pp.is_primary,'display_order',pp.display_order) order by pp.is_primary desc,pp.display_order asc) from public.profile_photos pp where pp.profile_id=p.id),'[]'::jsonb)
  from public.superchats sc join public.profiles p on p.id=sc.sender_id
  where sc.recipient_id=auth.uid() and sc.status='pending'
    and p.profile_completed=true and p.ghost_mode=false
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=auth.uid()))
  order by sc.created_at desc limit 20;
$$;
revoke all on function public.get_superchat_requests() from public;
grant execute on function public.get_superchat_requests() to authenticated;
