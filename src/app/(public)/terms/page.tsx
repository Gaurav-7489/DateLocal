import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { Scale, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = { 
  title: "Terms of Service | DateBu" 
};

export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href={routes.settings}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to App
          </Link>
          <div className="flex items-center gap-2 pt-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Scale className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Terms of Service
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Effective Date: August 2026 • Governing use of {universityConfig.appName}.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          
          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Eligibility
            </h2>
            <p>
              You must be at least 17 years old and an active student or faculty affiliate of {universityConfig.name} with verified institutional email credentials to create and maintain an account.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" /> 2. Community Standards
            </h2>
            <p>
              You agree not to impersonate others, upload copyrighted or illicit media, transmit spam, or engage in predatory or abusive behavior. Violation of these rules results in instant revocation of platform access.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" /> 3. Subscriptions & Payments
            </h2>
            <p>
              DateBu Extrovert recurring plans are processed securely through Razorpay. Subscriptions automatically renew according to your billing frequency unless cancelled prior to the renewal date via Settings.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
