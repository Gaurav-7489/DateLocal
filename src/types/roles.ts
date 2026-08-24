/**
 * User roles — matches database CHECK constraint.
 */
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MODERATOR"
  | "VERIFIED_STUDENT"
  | "STUDENT"
  | "SUSPENDED"
  | "BANNED";

/** Roles with administrative access */
export const ADMIN_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
] as const;

/** Roles invisible to normal student discovery/search */
export const INVISIBLE_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
] as const;
