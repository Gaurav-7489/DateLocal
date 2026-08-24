import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <EmptyState
        icon="💬"
        title="No conversations yet"
        description="Messages from your matches will appear here. Match with someone to start chatting."
      >
        <Link href={routes.discover}>
          <Button variant="primary" size="md">
            Find people
          </Button>
        </Link>
      </EmptyState>
    </div>
  );
}
