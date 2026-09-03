alter table public.profiles
  add column if not exists identity_type text not null default 'student',
  add column if not exists institution_name text,
  add column if not exists field_of_study text,
  add column if not exists job_title text,
  add column if not exists employer_name text,
  add column if not exists role_description text;

alter table public.profiles alter column department drop not null;
alter table public.profiles alter column academic_year drop not null;
create index if not exists idx_profiles_identity_type on public.profiles(identity_type);

create or replace function public.sync_datelocal_identity_from_extrovert()
returns trigger language plpgsql security definer set search_path=public as $function$
declare identity public.extrovert_profiles%rowtype;
begin
  select * into identity from public.extrovert_profiles where id=new.id;
  if identity.id is null then raise exception 'Extrovert identity is required before using Extrovert Date'; end if;
  new.display_name:=identity.display_name;
  new.date_of_birth:=identity.date_of_birth;
  new.gender:=identity.gender;
  new.department:=identity.department;
  new.academic_year:=identity.academic_year;
  new.identity_type:=coalesce(identity.identity_type,'student');
  new.institution_name:=identity.institution_name;
  new.field_of_study:=identity.field_of_study;
  new.job_title:=identity.job_title;
  new.employer_name:=identity.employer_name;
  new.role_description:=identity.role_description;
  return new;
end;
$function$;

drop trigger if exists trg_datelocal_identity_authority on public.profiles;
create trigger trg_datelocal_identity_authority
before insert or update of display_name,date_of_birth,gender,department,academic_year,identity_type,institution_name,field_of_study,job_title,employer_name,role_description
on public.profiles for each row execute function public.sync_datelocal_identity_from_extrovert();

update public.profiles p set
  identity_type=coalesce(e.identity_type,'student'), institution_name=e.institution_name,
  field_of_study=e.field_of_study, job_title=e.job_title, employer_name=e.employer_name,
  role_description=e.role_description
from public.extrovert_profiles e where e.id=p.id;
