import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsClient } from "./settings-client";
import { signOut } from "@/app/(app)/actions";
import {
  ShieldCheck,
  SlidersHorizontal,
  LogOut,
  ExternalLink,
  Lock,
} from "lucide-react";

export const metadata: Metadata = { title: "Settings & Privacy" };

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Load user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("ghost_mode, display_name")
    .eq("id", user.id)
    .maybeSingle();

  // Load dating preferences
  const { data: preferences } = await supabase
    .from("dating_preferences")
    .select("interested_in, min_age, max_age, preferred_department")
    .eq("user_id", user.id)
    .maybeSingle();

  // Load blocked users
  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id);

  const blockedUserIds = (blocks ?? []).map((b) => b.blocked_id);

  let blockedUsers: { id: string; display_name: string; department: string }[] = [];
  if (blockedUserIds.length > 0) {
    const { data: blockedProfiles } = await supabase
      .from("profiles")
      .select("id, display_name, department")
      .in("id", blockedUserIds);

    blockedUsers = (blockedProfiles ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name,
      department: p.department,
    }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
          Settings &amp; Safety
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your account, privacy, discovery visibility, and safety controls
        </p>
      </div>

      {/* Account Card */}
      <Card className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Student Account
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {profile?.display_name || "DateBu Student"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {user.email}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {universityConfig.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Verified Student
            </span>
          </div>
        </div>
      </Card>

      {/* Matching Preferences Quick Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
              Dating &amp; Matching Preferences
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control the age range and departments you discover.
            </p>
          </div>

          <Link href={routes.profileSetup}>
            <Button variant="outline" size="sm" className="text-xs">
              Edit
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="rounded-2xl bg-muted/50 p-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Interested in
            </span>
            <span className="font-semibold text-foreground capitalize mt-0.5 block">
              {preferences?.interested_in?.join(", ") || "Everyone"}
            </span>
          </div>

          <div className="rounded-2xl bg-muted/50 p-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Age Range
            </span>
            <span className="font-semibold text-foreground mt-0.5 block">
              {preferences?.min_age ?? 18} – {preferences?.max_age ?? 25} yrs
            </span>
          </div>

          <div className="rounded-2xl bg-muted/50 p-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Department
            </span>
            <span className="font-semibold text-foreground mt-0.5 block">
              {preferences?.preferred_department || "All Departments"}
            </span>
          </div>
        </div>
      </Card>

      {/* Ghost Mode & Blocked Users (Client Component) */}
      <SettingsClient
        initialGhostMode={Boolean(profile?.ghost_mode)}
        blockedUsers={blockedUsers}
      />

      {/* Safety & Guidelines Links */}
      <Card className="p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          Safety &amp; Policies
        </h2>

        <div className="divide-y divide-border text-xs">
          <Link
            href={routes.safety}
            className="flex items-center justify-between py-2.5 font-medium text-foreground hover:text-emerald-600 transition"
          >
            <span>Campus Safety Center &amp; Guidelines</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>

          <Link
            href={routes.privacy}
            className="flex items-center justify-between py-2.5 font-medium text-foreground hover:text-emerald-600 transition"
          >
            <span>Privacy Policy &amp; Data Rights</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>

          <Link
            href={routes.terms}
            className="flex items-center justify-between py-2.5 font-medium text-foreground hover:text-emerald-600 transition"
          >
            <span>Terms of Service</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
        </div>
      </Card>

      {/* Sign Out Card */}
      <Card className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Sign Out</h2>
          <p className="text-xs text-muted-foreground">
            End your active session on this device
          </p>
        </div>

        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </form>
      </Card>
    </div>
  );
}
