import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Matches" };

export default function MatchesPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon="💚"
        title="Matches"
        description="Your matches will appear here once matching is implemented in Phase 6."
      />
    </div>
  );
}
