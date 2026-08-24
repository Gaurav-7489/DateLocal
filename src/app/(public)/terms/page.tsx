import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageContainer narrow>
        <h1 className="mb-6 text-3xl font-bold text-foreground">Terms of Service</h1>
        <div className="space-y-4 text-muted-foreground">
          <p>
            By using {universityConfig.appName}, you agree to abide by these terms. This
            platform is exclusively for verified {universityConfig.name} students.
          </p>
          <p className="rounded-[var(--radius-md)] border border-border bg-muted p-4 text-sm">
            This is a placeholder terms of service. Complete terms will be published
            before the platform launches.
          </p>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
