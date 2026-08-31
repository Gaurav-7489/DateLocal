-- ============================================================
-- DateBu private profiles / controlled Discover access
-- ============================================================

-- Remove the overly broad profile SELECT policies.
drop policy if exists "Users can view profiles" on public.profiles;
drop policy if exists "Authenticated users can read completed profiles" on public.profiles;

-- Remove the overly broad nested-data SELECT policies.
drop policy if exists "Authenticated users can read profile photos" on public.profile_photos;
drop policy if exists "Authenticated users can read profile interests" on public.profile_interests;

-- ------------------------------------------------------------
-- Own profile access
-- ------------------------------------------------------------

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- ------------------------------------------------------------
-- Controlled Discover RPC
-- ------------------------------------------------------------

create or replace function public.get_discover_profiles(
  p_excluded_ids uuid[] default '{}',
  p_limit integer default 20
)
returns table (
  id uuid,
  display_name text,
  date_of_birth date,
  gender text,
  department text,
  academic_year text,
  bio text,
  ghost_mode boolean,
  created_at timestamptz,
  profile_photos jsonb,
  profile_interests jsonb
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
    p.ghost_mode,
    p.created_at,

    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'storage_path', pp.storage_path,
            'display_order', pp.display_order,
            'is_primary', pp.is_primary
          )
          order by
            pp.is_primary desc,
            pp.display_order asc
        )
        from public.profile_photos pp
        where pp.profile_id = p.id
      ),
      '[]'::jsonb
    ) as profile_photos,

    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'interests',
            jsonb_build_object(
              'id', i.id,
              'name', i.name
            )
          )
        )
        from public.profile_interests pi
        join public.interests i
          on i.id = pi.interest_id
        where pi.profile_id = p.id
      ),
      '[]'::jsonb
    ) as profile_interests

  from public.profiles p

  where
    p.profile_completed = true
    and p.ghost_mode = false
    and p.id <> auth.uid()
    and not (p.id = any(coalesce(p_excluded_ids, '{}')))

  order by p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

-- ------------------------------------------------------------
-- Security for RPC
-- ------------------------------------------------------------

revoke all
on function public.get_discover_profiles(uuid[], integer)
from public;

grant execute
on function public.get_discover_profiles(uuid[], integer)
to authenticated;
