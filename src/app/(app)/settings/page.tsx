import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon="⚙️"
        title="Settings"
        description="Account settings will be available once authentication is implemented in Phase 2."
      />
    </div>
  );
}
