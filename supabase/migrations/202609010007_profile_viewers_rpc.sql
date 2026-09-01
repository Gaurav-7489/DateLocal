create or replace function public.get_profile_viewers(p_limit integer default 100)
returns table(viewer_id uuid, viewed_at timestamptz, display_name text, date_of_birth date, department text, academic_year text, profile_photos jsonb)
language sql stable security definer set search_path=public
as $$
  select distinct on (pv.viewer_id)
    pv.viewer_id, pv.created_at, p.display_name, p.date_of_birth, p.department, p.academic_year,
    coalesce((select jsonb_agg(jsonb_build_object('storage_path',pp.storage_path,'is_primary',pp.is_primary,'display_order',pp.display_order) order by pp.is_primary desc,pp.display_order asc) from public.profile_photos pp where pp.profile_id=p.id),'[]'::jsonb)
  from public.profile_views pv
  join public.profiles p on p.id=pv.viewer_id
  where pv.viewed_id=auth.uid() and p.profile_completed=true and p.ghost_mode=false
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=auth.uid()))
  order by pv.viewer_id, pv.created_at desc
  limit greatest(1,least(coalesce(p_limit,100),100));
$$;
revoke all on function public.get_profile_viewers(integer) from public;
grant execute on function public.get_profile_viewers(integer) to authenticated;
