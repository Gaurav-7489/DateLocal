alter table public.extrovert_profiles
  add column if not exists profile_photo_path text;

create index if not exists idx_extrovert_profiles_profile_photo_path
  on public.extrovert_profiles(profile_photo_path)
  where profile_photo_path is not null;
