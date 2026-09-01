/**
 * Application route constants — single source of truth.
 */
export const routes = {
  home: "/",
  about: "/about",
  safety: "/safety",
  privacy: "/privacy",
  terms: "/terms",

  login: "/login",
  register: "/register",
  verify: "/verify",
  verifyFace: "/verify/face",
  resetPassword: "/reset-password",

  app: "/app",
  discover: "/app/discover",
  matches: "/app/matches",
  messages: "/app/messages",
  profile: "/app/profile",
  profileViews: "/app/profile/views",
  profileView: "/app/profile/view",
  dashboard: "/app/dashboard",
  profilePreferences: "/app/profile/preferences",
  profileSetup: "/app/profile/setup",
  settings: "/app/settings",
  extrovert: "/app/extrovert",
  news: "/news",

  admin: {
    root: "/admin",
    users: "/admin/users",
    reports: "/admin/reports",
    moderation: "/admin/moderation",
    verification: "/admin/verification",
    analytics: "/admin/analytics",
    settings: "/admin/settings",
    auditLogs: "/admin/audit-logs",
  },
} as const;
