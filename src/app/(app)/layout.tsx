import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { AppNavbar } from "@/components/layout/app-navbar";
import { PushNotifications } from "@/components/notifications/push-notifications";
import { PersonalDashboardShortcut } from "@/components/shared/personal-dashboard-shortcut";
import { isSuperAdminUser } from "@/types/roles";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  const userEmail = typeof claimsData?.claims?.email === "string" ? claimsData.claims.email : "Unknown";
  if (!userId) redirect(routes.login);

  // Extrovert is the identity authority. Middleware has already checked this
  // for the route; keep the server-side boundary here as defense in depth.
  const { data: extrovertProfile } = await supabase
    .from("extrovert_profiles")
    .select("profile_completed,trust_state")
    .eq("id", userId)
    .maybeSingle();

  if (!extrovertProfile?.profile_completed) {
    const extrovert = (process.env.EXTROVERT_URL || "http://localhost:3000").replace(/\/$/, "");
    redirect(`${extrovert}/app/setup`);
  }
  if (extrovertProfile.trust_state === "banned") {
    redirect(routes.login);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  const userRole = (profile?.role ?? "").toUpperCase();
  const ownerId = process.env.DATEBU_OWNER_ID?.trim();
  const adminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isSuperAdmin = isSuperAdminUser(userId) || userRole === "SUPER_ADMIN" || userRole === "ADMIN" || (Boolean(ownerId) && userId === ownerId) || Boolean(userEmail !== "Unknown" && adminEmails.includes(userEmail.toLowerCase()));

  return (
    <div className="flex h-[100dvh] flex-col overflow-visible bg-background overscroll-none select-none">
      <PushNotifications />
      <PersonalDashboardShortcut />
      <AppNavbar userEmail={userEmail} isSuperAdmin={isSuperAdmin} />
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
