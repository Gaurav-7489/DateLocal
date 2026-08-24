import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = { title: "Verify" };

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageContainer narrow className="flex flex-1 flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <span className="text-4xl" aria-hidden="true">📧</span>
          <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Email verification will be implemented in Phase 3.
          </p>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
