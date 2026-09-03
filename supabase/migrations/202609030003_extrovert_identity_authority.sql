-- DateLocal may store a mirrored profile row for dating joins, but shared identity
-- fields are always sourced from Extrovert. This prevents a DateLocal edit from
-- silently diverging from the verified identity.
CREATE OR REPLACE FUNCTION public.sync_datelocal_identity_from_extrovert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  identity public.extrovert_profiles%ROWTYPE;
BEGIN
  SELECT * INTO identity FROM public.extrovert_profiles WHERE id = NEW.id;
  IF identity.id IS NULL THEN
    RAISE EXCEPTION 'Extrovert identity is required before using DateLocal';
  END IF;

  NEW.display_name := identity.display_name;
  NEW.date_of_birth := identity.date_of_birth;
  NEW.gender := identity.gender;
  NEW.department := identity.department;
  NEW.academic_year := identity.academic_year;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_datelocal_identity_authority ON public.profiles;
CREATE TRIGGER trg_datelocal_identity_authority
BEFORE INSERT OR UPDATE OF display_name, date_of_birth, gender, department, academic_year
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_datelocal_identity_from_extrovert();
