/**
 * University branding configuration.
 * All university-specific values centralized here.
 * Change branding by updating env vars — zero component rewrites.
 */
export const universityConfig = {
  name: process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "University Name",
  shortName: process.env.NEXT_PUBLIC_UNIVERSITY_SHORT_NAME ?? "University",
  emailDomain: process.env.NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN ?? "university.edu",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "DateBu",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
