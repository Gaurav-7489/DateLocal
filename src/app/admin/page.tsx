import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

const adminSections = [
  { href: routes.admin.root, label: "Dashboard", icon: "📊", description: "Platform overview and key metrics" },
  { href: routes.admin.users, label: "Users", icon: "👥", description: "User management and verification" },
  { href: routes.admin.reports, label: "Reports", icon: "🚩", description: "Review and resolve user reports" },
  { href: routes.admin.verification, label: "Verification", icon: "✅", description: "University email verification queue" },
  { href: routes.admin.moderation, label: "Moderation", icon: "🛡️", description: "Content moderation and user actions" },
  { href: routes.admin.analytics, label: "Analytics", icon: "📈", description: "Platform analytics and insights" },
  { href: routes.admin.settings, label: "Settings", icon: "⚙️", description: "Platform configuration" },
  { href: routes.admin.auditLogs, label: "Audit Logs", icon: "📋", description: "Administrative action history" },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin header — no public navbar, no creator info */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <span className="text-sm font-semibold text-foreground">Administration</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Control Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform administration and management
          </p>
        </div>

        {/* Coming soon notice */}
        <div className="mb-8 rounded-[var(--radius-lg)] border border-dept-accent-100 bg-dept-accent-50 p-4">
          <p className="text-sm text-dept-accent">
            <strong>Phase 1 — Foundation.</strong> Administrative functionality will be
            implemented in Phase 9. This shell demonstrates the intended navigation
            structure.
          </p>
        </div>

        {/* Section grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              key={section.label}
              href={section.href}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{section.icon}</span>
                <span className="font-semibold text-foreground">{section.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{section.description}</p>
              <span className="mt-auto inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Coming soon
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
