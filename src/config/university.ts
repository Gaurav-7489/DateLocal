/** Extrovert product configuration. Social and Date are optional experiences in one app. */
export const universityConfig = {
  name: process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "University Name",
  shortName: process.env.NEXT_PUBLIC_UNIVERSITY_SHORT_NAME ?? "University",
  emailDomain: process.env.NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN ?? "university.edu",
  appName: "Extrovert",
  tagline: "Connect your vibe, friends and more",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
} as const;

export function isUniversityEmail(email?: string | null): boolean {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedDomain = universityConfig.emailDomain.trim().toLowerCase().replace(/^@/, "");
  if (!normalizedEmail || !normalizedEmail.includes("@")) return false;
  return normalizedEmail.endsWith(`@${normalizedDomain}`);
}
