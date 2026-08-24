import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

const quickActions = [
  {
    href: routes.discover,
    icon: "🔍",
    title: "Discover",
    description: "Browse verified students from your university",
    color: "bg-uni-primary-50 text-uni-primary",
  },
  {
    href: routes.matches,
    icon: "💚",
    title: "Matches",
    description: "See who you've connected with",
    color: "bg-green-50 text-green-700",
  },
  {
    href: routes.messages,
    icon: "💬",
    title: "Chat",
    description: "Continue your conversations",
    color: "bg-dept-accent-50 text-dept-accent",
  },
  {
    href: routes.profile,
    icon: "👤",
    title: "Profile",
    description: "View and manage your profile",
    color: "bg-amber-50 text-amber-700",
  },
];

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extract a display name from user metadata or email
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Welcome header */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Welcome back, {displayName} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your {universityConfig.appName} dashboard
        </p>
      </section>

      {/* Profile completion CTA */}
      <section className="mb-8">
        <Card className="relative overflow-hidden border-uni-primary-100 bg-gradient-to-r from-uni-primary-50 to-background">
          {/* Decorative element */}
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-uni-primary-100 opacity-50 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  ✨
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  Complete your profile
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your DateBu profile to start discovering people at{" "}
                {universityConfig.name}. Add your interests, photos, and a bio
                to make meaningful connections.
              </p>

              {/* Progress indicator */}
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-border">
                  <div
                    className="h-2 rounded-full bg-uni-primary transition-all"
                    style={{ width: "0%" }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Not started
                </span>
              </div>
            </div>

            <Link
              href={routes.profileSetup}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-uni-primary px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all hover:bg-uni-primary-light hover:shadow-[var(--shadow-md)]"
            >
              Get started
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </Card>
      </section>

      {/* Account info */}
      <section className="mb-8">
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Account
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-uni-primary-50 text-lg font-bold text-uni-primary">
              {(user?.email?.charAt(0) ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{displayName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-uni-primary-50 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-xs font-medium text-uni-primary">
                Verified
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* Quick actions grid */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full transition-all duration-200 group-hover:border-uni-primary-200 group-hover:shadow-[var(--shadow-md)]">
                <div
                  className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-lg ${action.color}`}
                >
                  <span aria-hidden="true">{action.icon}</span>
                </div>
                <h3 className="font-semibold text-foreground">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}