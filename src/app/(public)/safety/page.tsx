import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";

export const metadata: Metadata = { title: "Safety" };

export default function SafetyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageContainer narrow>
        <h1 className="mb-6 text-3xl font-bold text-foreground">Safety</h1>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Your safety is our top priority. {universityConfig.appName} is designed to
            create a secure environment for university students.
          </p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Verified community</h2>
          <p>Every member is verified through their {universityConfig.name} email address.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Your controls</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>Block anyone at any time</li>
            <li>Report inappropriate behavior</li>
            <li>Control your profile visibility</li>
            <li>Delete your account and data</li>
          </ul>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Moderation</h2>
          <p>Our moderation team reviews reports and takes action to keep the platform safe.</p>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
