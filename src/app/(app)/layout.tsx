import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Authenticated app layout.
 * Protects all /app/* routes — redirects unauthenticated users to login.
 * Provides the app shell: navbar, content area, footer.
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

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar userEmail={user.email ?? "Unknown"} />

      <div className="flex-1">{children}</div>

      <Footer />
    </div>
  );
}
