import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon="👤"
        title="Profile"
        description="Profile creation will be available once profiles are implemented in Phase 4."
      />
    </div>
  );
}
