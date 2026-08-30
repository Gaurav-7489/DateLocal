import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { ShieldCheck, Lock, Eye, Database, Trash2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = { 
  title: "Privacy Policy | DateBu" 
};

export const dynamic = "force-static";

export default function PrivacyPage() {
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
              <Lock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: August 2026 • Exclusive to verified {universityConfig.name} students.
          </p>
        </div>

        {/* Bento Policy Cards */}
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          
          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1. Campus Verification & Identity
            </h2>
            <p>
              {universityConfig.appName} requires an authentic {universityConfig.name} institutional email address. We do not sell, rent, or trade student email addresses or identity records to third-party ad networks.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" /> 2. Data We Collect
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Profile Information:</strong> Display name, date of birth (for age verification), gender, department, academic year, lifestyle badges, and uploaded deck photos.</li>
              <li><strong>Usage Activity:</strong> Matches, likes, passes, and Realtime messaging records required to deliver the core chat service.</li>
              <li><strong>Safety Logs:</strong> Report submissions and blocking data stored exclusively for moderation enforcement.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" /> 3. Ghost Mode & Visibility
            </h2>
            <p>
              Subscribers can enable <strong>Ghost Mode</strong> at any time to remove their card immediately from the Discover deck during exams or breaks. Existing mutual matches and active conversations remain accessible.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" /> 4. Data Retention & Deletion
            </h2>
            <p>
              You retain full ownership of your data. You may delete individual photos or request a full account purge through settings. Deleting your account completely removes your photos, match history, and chat transcripts from active servers.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
