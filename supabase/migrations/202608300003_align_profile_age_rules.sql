-- Keep database age rules aligned with the profile form's 14+ requirement.
alter table public.dating_preferences
  drop constraint if exists dating_preferences_min_age_check,
  drop constraint if exists dating_preferences_max_age_check;

alter table public.dating_preferences
  add constraint dating_preferences_min_age_check
    check (min_age >= 14 and min_age <= 99),
  add constraint dating_preferences_max_age_check
    check (max_age >= 14 and max_age <= 99);
