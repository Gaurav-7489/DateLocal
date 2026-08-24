import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageContainer narrow className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Log in to your {universityConfig.appName} account
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
            <p className="text-center text-sm text-muted-foreground">
              Authentication will be implemented in Phase 2.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={routes.register} className="font-medium text-uni-primary hover:text-uni-primary-light">
              Join now
            </Link>
          </p>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
