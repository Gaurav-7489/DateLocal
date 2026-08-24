import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Join" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageContainer narrow className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Join {universityConfig.appName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your <span className="font-medium text-foreground">@{universityConfig.emailDomain}</span> email to get started
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
            <p className="text-center text-sm text-muted-foreground">
              Registration will be implemented in Phase 2.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={routes.login} className="font-medium text-uni-primary hover:text-uni-primary-light">
              Log in
            </Link>
          </p>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
