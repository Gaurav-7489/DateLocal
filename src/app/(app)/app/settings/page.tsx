import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { isUniversityEmail, universityConfig } from "@/config/university";
import { SettingsClient } from "./settings-client";
import { signOut } from "@/app/(app)/actions";
import {
  ShieldCheck,
  SlidersHorizontal,
  LogOut,
  ExternalLink,
  Lock,
  GraduationCap,
  } from "lucide-react";

export const metadata: Metadata = { 
  title: "Settings & Safety | DateBu" 
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Load all required settings data in parallel
  const [
    { data: profile },
    { data: preferences },
    { data: blocks },
    { data: subscription },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("ghost_mode, display_name, department, academic_year")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("dating_preferences")
      .select("interested_in, min_age, max_age, preferred_department")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const blockedUserIds = (blocks ?? []).map((b) => b.blocked_id);
  let blockedUsers: {
    id: string;
    display_name: string;
    department: string;
  }[] = [];

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

  const isVerifiedUser = isUniversityEmail(user.email);

  const interestedInLabel =
    preferences?.interested_in?.includes("everyone") ||
    (preferences?.interested_in?.includes("men") && preferences?.interested_in?.includes("women"))
      ? "Everyone"
      : preferences?.interested_in?.[0]
      ? preferences.interested_in[0].charAt(0).toUpperCase() + preferences.interested_in[0].slice(1)
      : "Everyone";

  return (
    <div className="mx-auto max-w-md px-3.5 py-4 space-y-4 font-sans select-none pb-24">
      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Settings &amp; Safety
        </h1>
        <p className="text-[11px] text-muted-foreground font-medium">
          Manage your account, privacy, discovery visibility, and safety controls
        </p>
      </div>

      {/* 1. Student Account Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Student Account
          </span>

          {isVerifiedUser ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> Email Verified
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 border border-zinc-200">
              Pending verification
            </span>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">
            {profile?.display_name || "DateBu Student"}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {user.email}
          </p>
          <p className="text-[11px] font-medium text-emerald-700 mt-1">
            {universityConfig.name} {profile?.department ? `• ${profile.department}` : ""}
          </p>
        </div>
      </div>

      {/* 2. Matching Preferences Bento Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Dating &amp; Matching
          </span>
          <Link
            href={routes.profileSetup}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Edit
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="rounded-2xl bg-muted/40 p-2.5 border border-border/60">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">
              Show Me
            </span>
            <span className="text-xs font-extrabold text-foreground mt-0.5 block truncate">
              {interestedInLabel}
            </span>
          </div>

          <div className="rounded-2xl bg-muted/40 p-2.5 border border-border/60">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">
              Age Range
            </span>
            <span className="text-xs font-extrabold text-foreground mt-0.5 block truncate">
              {preferences?.min_age ?? 18}–{preferences?.max_age ?? 25}
            </span>
          </div>

          <div className="rounded-2xl bg-muted/40 p-2.5 border border-border/60">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">
              Dept
            </span>
            <span className="text-xs font-extrabold text-foreground mt-0.5 block truncate">
              {preferences?.preferred_department || "All"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Settings (Ghost Mode, Subscriptions & Blocked Users) */}
      <div className="space-y-3">
        <SettingsClient
          initialGhostMode={Boolean(profile?.ghost_mode)}
          blockedUsers={blockedUsers}
          currentEmail={user.email ?? ""}
          subscription={{
            plan: subscription?.plan ?? "free",
            status: subscription?.status ?? "inactive",
            currentPeriodEnd: subscription?.current_period_end ?? null,
          }}
        />
      </div>

      {/* 4. Safety & Policy Links */}
      <div className="rounded-3xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-muted/30">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3 text-zinc-500" /> Safety &amp; Policies
          </span>
        </div>

        <Link
          href={routes.safety}
          className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-xs font-semibold text-foreground"
        >
          <span>Campus Safety Center &amp; Guidelines</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </Link>

        <Link
          href={routes.privacy}
          className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-xs font-semibold text-foreground"
        >
          <span>Privacy Policy &amp; Data Rights</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </Link>

        <Link
          href={routes.terms}
          className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-xs font-semibold text-foreground"
        >
          <span>Terms of Service</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </Link>
      </div>

      {/* 5. Safe Sign Out */}
      <div className="pt-1">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Securely</span>
          </button>
        </form>
      </div>
    </div>
  );
}