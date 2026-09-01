import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { AppNavbar } from "@/components/layout/app-navbar";
import { PushNotifications } from "@/components/notifications/push-notifications";
import { PersonalDashboardShortcut } from "@/components/shared/personal-dashboard-shortcut";
import { isSuperAdminUser } from "@/types/roles";

export const dynamic="force-dynamic";

export default async function AppLayout({children}:{children:React.ReactNode}){
 const supabase=await createServerSupabaseClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect(routes.login);
 const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
 const userRole=(profile?.role??"").toUpperCase();
 const ownerId=process.env.DATEBU_OWNER_ID?.trim();
 const adminEmails=(process.env.SUPER_ADMIN_EMAILS??"").split(",").map(e=>e.trim().toLowerCase()).filter(Boolean);
 const isSuperAdmin=isSuperAdminUser(user.id)||userRole==="SUPER_ADMIN"||userRole==="ADMIN"||(Boolean(ownerId)&&user.id===ownerId)||Boolean(user.email&&adminEmails.includes(user.email.toLowerCase()));
 return <div className="flex h-[100dvh] flex-col overflow-visible bg-background overscroll-none select-none"><PushNotifications/><PersonalDashboardShortcut/><AppNavbar userEmail={user.email??"Unknown"} isSuperAdmin={isSuperAdmin}/><main className="min-h-0 flex-1 overflow-y-auto">{children}</main></div>;
}
