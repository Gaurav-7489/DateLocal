import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_ROLES, isSuperAdminUser } from "@/types/roles";
import type { UserRole } from "@/types/roles";
import { routes } from "@/config/routes";

export interface AdminUser {
  id: string;
  role: UserRole;
}

export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const hasAdminRole = Boolean(profile?.role && ADMIN_ROLES.includes(profile.role));
  const hasOwnerIdentity = isSuperAdminUser(user.id);

  if (error || (!hasAdminRole && !hasOwnerIdentity)) {
    redirect(routes.app);
  }

  return {
    id: user.id,
    role: hasOwnerIdentity ? "SUPER_ADMIN" : profile!.role,
  };
}
