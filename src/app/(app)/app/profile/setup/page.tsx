import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { universityConfig } from "@/config/university";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Profile Setup" };

const setupSteps = [
  {
    step: 1,
    title: "Basic Info",
    description: "Your name, age, and department",
    icon: "📝",
  },
  {
    step: 2,
    title: "Photos",
    description: "Add photos to your profile",
    icon: "📸",
  },
  {
    step: 3,
    title: "About You",
    description: "Write a bio and share your interests",
    icon: "💭",
  },
  {
    step: 4,
    title: "Preferences",
    description: "Set your discovery preferences",
    icon: "🎯",
  },
];

export default async function ProfileSetupPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-uni-primary-100 bg-uni-primary-50 px-4 py-1.5 text-sm font-medium text-uni-primary">
          <span className="h-2 w-2 rounded-full bg-uni-primary" aria-hidden="true" />
          Profile Setup
        </span>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Create your {universityConfig.appName} profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Let other {universityConfig.name} students get to know you.
          Your profile is how you&apos;ll make connections on campus.
        </p>
      </div>

      {/* Current account */}
      <Card className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-uni-primary-50 text-sm font-bold text-uni-primary">
            {(user?.email?.charAt(0) ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              Your university account
            </p>
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

      {/* Setup steps preview */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Setup Steps
        </h2>
        <div className="space-y-3">
          {setupSteps.map((item) => (
            <Card
              key={item.step}
              className="flex items-center gap-4 opacity-75"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border text-lg">
                <span aria-hidden="true">{item.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {item.step}
                  </span>
                </div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Coming soon
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Info notice */}
      <Card className="border-dept-accent-100 bg-dept-accent-50">
        <div className="flex gap-3">
          <span className="text-xl" aria-hidden="true">
            ℹ️
          </span>
          <div>
            <p className="font-medium text-dept-accent">
              Profile setup coming soon
            </p>
            <p className="mt-1 text-sm text-dept-accent/80">
              We&apos;re building a thoughtful profile experience for{" "}
              {universityConfig.name} students. The profile setup form will let
              you add your name, photos, bio, interests, department, and
              discovery preferences. Check back soon!
            </p>
          </div>
        </div>
      </Card>

      {/* Back to dashboard */}
      <div className="mt-6 text-center">
        <Link
          href={routes.app}
          className="text-sm font-medium text-uni-primary transition-colors hover:text-uni-primary-light"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
