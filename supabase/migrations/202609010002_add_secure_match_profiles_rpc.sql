create or replace function public.get_match_profiles(p_user_ids uuid[])
returns table (
  id uuid,
  display_name text,
  date_of_birth date,
  gender text,
  department text,
  academic_year text,
  bio text,
  campus_residency text,
  relationship_goal text,
  zodiac text,
  profile_photos jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    p.date_of_birth,
    p.gender,
    p.department,
    p.academic_year,
    p.bio,
    p.campus_residency,
    p.relationship_goal,
    p.zodiac,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'storage_path', pp.storage_path,
            'display_order', pp.display_order,
            'is_primary', pp.is_primary
          ) order by pp.is_primary desc, pp.display_order asc
        )
        from public.profile_photos pp
        where pp.profile_id = p.id
      ),
      '[]'::jsonb
    ) as profile_photos
  from public.profiles p
  where p.id = any(p_user_ids)
    and exists (
      select 1
      from public.matches m
      where (m.user_a = auth.uid() and m.user_b = p.id)
         or (m.user_b = auth.uid() and m.user_a = p.id)
    )
    and not exists (
      select 1
      from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = auth.uid())
    );
$$;

revoke all on function public.get_match_profiles(uuid[]) from public;
grant execute on function public.get_match_profiles(uuid[]) to authenticated;
