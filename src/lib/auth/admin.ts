import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_ROLES } from "@/types/roles";
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

  if (error || !profile || !ADMIN_ROLES.includes(profile.role)) {
    redirect(routes.app);
  }

  return {
    id: user.id,
    role: profile.role,
  };
}
