import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Matches" };

export default function MatchesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <EmptyState
        icon="💚"
        title="No matches yet"
        description="Your matches will appear here once you start discovering people. Complete your profile to get started."
      >
        <Link href={routes.discover}>
          <Button variant="primary" size="md">
            Start discovering
          </Button>
        </Link>
      </EmptyState>
    </div>
  );
}
