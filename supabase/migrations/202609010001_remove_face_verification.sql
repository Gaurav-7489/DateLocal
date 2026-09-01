-- Remove the deprecated face-verification system.
-- Historical face-verification migrations remain in the repository as migration history;
-- this migration removes the objects from the live database.

drop view if exists public.verified_profiles;

drop trigger if exists tr_invalidate_face_verification on public.profile_photos;
drop trigger if exists face_verifications_updated_at on public.face_verifications;

drop function if exists public.handle_profile_photo_change();

drop table if exists public.face_verifications;
