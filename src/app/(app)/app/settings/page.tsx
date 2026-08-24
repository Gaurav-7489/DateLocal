import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Account section */}
      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-uni-primary-50 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-xs font-medium text-uni-primary">
                Verified
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Coming soon */}
      <Card className="border-dept-accent-100 bg-dept-accent-50">
        <div className="flex gap-3">
          <span className="text-xl" aria-hidden="true">
            ℹ️
          </span>
          <div>
            <p className="font-medium text-dept-accent">More settings coming soon</p>
            <p className="mt-1 text-sm text-dept-accent/80">
              Additional settings for notifications, privacy, discovery preferences, and
              account management will be available in future updates.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
