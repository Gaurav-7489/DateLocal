import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { AppNavbar } from "@/components/layout/app-navbar";

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

  // Get the user's authorization role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Only the designated owner account gets the direct Admin button.
  const isSuperAdmin =
    profile?.role === "SUPER_ADMIN" &&
    user.id === process.env.DATEBU_OWNER_ID;

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