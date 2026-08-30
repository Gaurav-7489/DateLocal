/**
 * User roles — matches database CHECK constraint.
 */
export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
  "VERIFIED_STUDENT",
  "STUDENT",
  "SUSPENDED",
  "BANNED",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

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

/** Active student roles eligible for core interactions */
export const ACTIVE_STUDENT_ROLES: readonly UserRole[] = [
  "VERIFIED_STUDENT",
  "STUDENT",
] as const;

/** Blocked/restricted roles that cannot perform actions */
export const RESTRICTED_ROLES: readonly UserRole[] = [
  "SUSPENDED",
  "BANNED",
] as const;

/* ================= Constant-Time Guard Sets ================= */

const ADMIN_ROLE_SET = new Set<UserRole>(ADMIN_ROLES);
const INVISIBLE_ROLE_SET = new Set<UserRole>(INVISIBLE_ROLES);
const ACTIVE_STUDENT_ROLE_SET = new Set<UserRole>(ACTIVE_STUDENT_ROLES);
const RESTRICTED_ROLE_SET = new Set<UserRole>(RESTRICTED_ROLES);

/* ================= O(1) Fast Type Guards & Helper Utilities ================= */

export const isAdminRole = (role?: string | null): role is "SUPER_ADMIN" | "ADMIN" | "MODERATOR" =>
  Boolean(role && ADMIN_ROLE_SET.has(role as UserRole));

export const isInvisibleRole = (role?: string | null): role is "SUPER_ADMIN" | "ADMIN" =>
  Boolean(role && INVISIBLE_ROLE_SET.has(role as UserRole));

export const isActiveStudent = (role?: string | null): role is "VERIFIED_STUDENT" | "STUDENT" =>
  Boolean(role && ACTIVE_STUDENT_ROLE_SET.has(role as UserRole));

export const isRestrictedRole = (role?: string | null): role is "SUSPENDED" | "BANNED" =>
  Boolean(role && RESTRICTED_ROLE_SET.has(role as UserRole));

export const isVerifiedStudent = (role?: string | null): role is "VERIFIED_STUDENT" =>
  role === "VERIFIED_STUDENT";

export const isSuperAdmin = (role?: string | null): role is "SUPER_ADMIN" =>
  role === "SUPER_ADMIN";