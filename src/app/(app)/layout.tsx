import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

/**
 * Authenticated app layout.
 * Protects all /app/* routes — redirects unauthenticated users to login.
 * Provides the app shell: navbar, content area.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection: redirect to login if not authenticated
  if (!user) {
    redirect(routes.login);
  }

  // Get the user's authorization role directly from Supabase
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const userRole = (profile?.role ?? "").toUpperCase();
  const ownerId = process.env.DATEBU_OWNER_ID?.trim();
  const adminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isSuperAdmin =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    (Boolean(ownerId) && user.id === ownerId) ||
    (Boolean(user.email) && adminEmails.includes(user.email!.toLowerCase()));

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <AppNavbar
        userEmail={user.email ?? "Unknown"}
        isSuperAdmin={isSuperAdmin}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">{children}</div>
    </div>
  );
}