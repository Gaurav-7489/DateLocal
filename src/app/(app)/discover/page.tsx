import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon="🔍"
        title="Discover"
        description="Profile discovery will be available after authentication is implemented in Phase 5."
      />
    </div>
  );
}
