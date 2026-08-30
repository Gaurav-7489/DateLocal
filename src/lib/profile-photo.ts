const PROFILE_PHOTO_BUCKET = "profile-photos";

/**
 * Returns a small, CDN-transformable public image URL. Keeping the source
 * image bounded avoids fetching camera originals before Next.js optimizes it.
 */
export function getProfilePhotoUrl(
  storagePath: string | null | undefined,
  width: number,
) {
  if (!storagePath) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;

  const encodedPath = storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `${baseUrl}/storage/v1/render/image/public/${PROFILE_PHOTO_BUCKET}/${encodedPath}?width=${width}&quality=70`;
}
