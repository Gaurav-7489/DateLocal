/**
 * University + product branding configuration.
 * Extrovert is the identity/social foundation; DateLocal is the dating layer.
 */
export const universityConfig = {
  name: process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "University Name",
  shortName: process.env.NEXT_PUBLIC_UNIVERSITY_SHORT_NAME ?? "University",
  emailDomain: process.env.NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN ?? "university.edu",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "DateLocal",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
} as const;

export function isUniversityEmail(email?: string | null): boolean {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedDomain = universityConfig.emailDomain
    .trim()
    .toLowerCase()
    .replace(/^@/, "");

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return false;
  }

  return normalizedEmail.endsWith(`@${normalizedDomain}`);
}
