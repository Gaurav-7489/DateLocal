create unique index if not exists likes_liker_liked_unique on public.likes (liker_id, liked_id);
create unique index if not exists passes_passer_passed_unique on public.passes (passer_id, passed_id);
create unique index if not exists blocks_blocker_blocked_unique on public.blocks (blocker_id, blocked_id);
create unique index if not exists matches_users_unique on public.matches (user_a, user_b);

create or replace function public.get_discover_profiles(
  p_excluded_ids uuid[] default '{}',
  p_limit integer default 20
)
returns table(id uuid, display_name text, date_of_birth date, gender text, department text, academic_year text, bio text, ghost_mode boolean, created_at timestamptz, profile_photos jsonb, profile_interests jsonb)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.display_name, p.date_of_birth, p.gender, p.department, p.academic_year, p.bio, p.ghost_mode, p.created_at,
    coalesce((select jsonb_agg(jsonb_build_object('storage_path', pp.storage_path, 'display_order', pp.display_order, 'is_primary', pp.is_primary) order by pp.is_primary desc, pp.display_order asc) from public.profile_photos pp where pp.profile_id = p.id), '[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object('interests', jsonb_build_object('id', i.id, 'name', i.name))) from public.profile_interests pi join public.interests i on i.id = pi.interest_id where pi.profile_id = p.id), '[]'::jsonb)
  from public.profiles p
  where p.profile_completed = true
    and p.ghost_mode = false
    and p.id <> auth.uid()
    and not (p.id = any(coalesce(p_excluded_ids, '{}')))
    and not exists (select 1 from public.likes l where l.liker_id = auth.uid() and l.liked_id = p.id)
    and not exists (select 1 from public.passes ps where ps.passer_id = auth.uid() and ps.passed_id = p.id)
    and not exists (select 1 from public.blocks b where (b.blocker_id = auth.uid() and b.blocked_id = p.id) or (b.blocker_id = p.id and b.blocked_id = auth.uid()))
  order by p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

grant execute on function public.get_discover_profiles(uuid[], integer) to authenticated;