import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <PageContainer narrow>
        <h1 className="mb-6 text-3xl font-bold text-foreground">About {universityConfig.appName}</h1>
        <div className="space-y-4 text-muted-foreground">
          <p>
            {universityConfig.appName} is a private social platform built exclusively for
            verified {universityConfig.name} students.
          </p>
          <p>
            Our mission is to create a safe, meaningful space where students can discover
            friends, study partners, and genuine connections within their own campus community.
          </p>
          <p>
            Unlike generic social apps, every member is verified through their university
            email — ensuring a trusted, university-only experience.
          </p>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
