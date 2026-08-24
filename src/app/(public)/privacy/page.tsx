import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageContainer narrow>
        <h1 className="mb-6 text-3xl font-bold text-foreground">Privacy Policy</h1>
        <div className="space-y-4 text-muted-foreground">
          <p>
            {universityConfig.appName} is committed to protecting your privacy. This policy
            outlines how we collect, use, and protect your information.
          </p>
          <p className="rounded-[var(--radius-md)] border border-border bg-muted p-4 text-sm">
            This is a placeholder privacy policy. A complete privacy policy will be
            published before the platform launches.
          </p>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
