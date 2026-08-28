"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { resendVerificationEmail } from "@/services/auth.service";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus("idle");
    setMessage("");

    const result = await resendVerificationEmail(email.trim().toLowerCase());
    setLoading(false);

    if (result.success) {
      setStatus("success");
      setMessage("Verification email has been resent. Please check your inbox and spam folder.");
    } else {
      setStatus("error");
      setMessage(result.error || "Failed to resend email. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <PageContainer narrow className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Mail className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We sent a verification link to your {universityConfig.name} email address.
            Click the link in the email to activate your account and start discovering matches.
          </p>

          <div className="mt-6 rounded-2xl bg-muted/60 p-4 text-left text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Didn&apos;t receive the email?</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Check your spam or junk folder.</li>
              <li>Ensure you registered with your official @{universityConfig.emailDomain.replace(/^@/, "")} ID.</li>
              <li>Wait a couple minutes before requesting a new link.</li>
            </ul>
          </div>

          <form onSubmit={handleResend} className="mt-6 space-y-3">
            <input
              type="email"
              placeholder={`Enter your student email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />

            {status === "success" && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={loading || !email.trim()}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </span>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <Link
              href={routes.login}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Already verified? Log in here →
            </Link>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </div>
  );
}
