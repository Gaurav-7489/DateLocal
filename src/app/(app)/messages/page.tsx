import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon="💬"
        title="Messages"
        description="Realtime chat will be available once messaging is implemented in Phase 7."
      />
    </div>
  );
}
