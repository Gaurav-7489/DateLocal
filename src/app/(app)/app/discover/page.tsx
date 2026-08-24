import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <EmptyState
        icon="🔍"
        title="Discover"
        description="Profile discovery will be available once profiles are set up. Complete your profile to start discovering other students."
      >
        <Link href={routes.profileSetup}>
          <Button variant="primary" size="md">
            Complete your profile
          </Button>
        </Link>
      </EmptyState>
    </div>
  );
}
