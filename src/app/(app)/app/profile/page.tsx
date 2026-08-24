import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage how others see you on DateBu
        </p>
      </div>

      {/* Current account info */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-uni-primary-50 text-2xl font-bold text-uni-primary">
            {(user?.email?.charAt(0) ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              {user?.user_metadata?.full_name ||
                user?.email?.split("@")[0] ||
                "Student"}
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

      {/* Profile completion prompt */}
      <Card className="border-uni-primary-100 bg-uni-primary-50/50">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <span className="text-4xl" aria-hidden="true">
            ✨
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">
              Your profile isn&apos;t set up yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your profile to start appearing in discovery and matching
              with other students.
            </p>
          </div>
          <Link href={routes.profileSetup}>
            <Button variant="primary" size="md">
              Set up profile
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
