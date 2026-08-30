import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { ShieldCheck, Flag, UserX, AlertTriangle, ArrowLeft, HeartHandshake } from "lucide-react";

export const metadata: Metadata = { 
  title: "Safety & Guidelines | DateBu" 
};

export const dynamic = "force-static";

export default function SafetyPage() {
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
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Campus Safety & Guidelines
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Maintaining a respectful, secure dating community at {universityConfig.name}.
          </p>
        </div>

        {/* Safety Pillars Bento */}
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          
          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" /> 1. Campus Code of Conduct
            </h2>
            <p>
              {universityConfig.appName} is designed for authentic student interactions. Harassment, hate speech, stalking, non-consensual sharing of private conversations, or commercial spam will lead to immediate permanent banishment and campus email blacklisting.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-600" /> 2. One-Tap Blocking
            </h2>
            <p>
              You can block any user at any moment from the Discover card top menu or inside 1-on-1 chat. Blocking immediately unmatches both profiles, removes the conversation thread, and guarantees you will never see each other in the deck again.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-600" /> 3. 24/7 Moderation Queue
            </h2>
            <p>
              Reports submitted in-app are routed directly to the Executive Moderation Desk. Moderation audits include verification check revivals, temporary strike assignments, and permanent account suspensions.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> 4. Meeting in Person
            </h2>
            <p>
              When meeting a campus match for the first time, always choose well-lit public campus spots (such as the Central Canteen, Nescafe, or Library lawns) and notify a friend of your plans.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
