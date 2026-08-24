"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { registerWithEmail } from "@/services/auth.service";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDomain = universityConfig.emailDomain
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    if (!normalizedEmail) {
      setError("Enter your university email.");
      return;
    }

    if (!normalizedEmail.endsWith(`@${normalizedDomain}`)) {
      setError(
        `Please use your university email ending in @${normalizedDomain}.`,
      );
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const result = await registerWithEmail(normalizedEmail, password);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <PageContainer
        narrow
        className="flex flex-1 flex-col items-center justify-center py-12"
      >
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Join {universityConfig.appName}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Use your{" "}
              <span className="font-medium text-foreground">
                @{universityConfig.emailDomain}
              </span>{" "}
              email to get started.
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
            {success ? (
              <div className="space-y-3 text-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Check your email
                </h2>

                <p className="text-sm text-muted-foreground">
                  Your account has been created. Check your university email
                  for the verification link.
                </p>

                <Link
                  href={routes.login}
                  className="inline-block text-sm font-medium text-uni-primary hover:text-uni-primary-light"
                >
                  Continue to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    University email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={`you@${universityConfig.emailDomain}`}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-uni-primary focus:ring-2 focus:ring-uni-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-uni-primary focus:ring-2 focus:ring-uni-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Enter your password again"
                    required
                    minLength={8}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-uni-primary focus:ring-2 focus:ring-uni-primary/20"
                  />
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-uni-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-uni-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>
              </form>
            )}
          </div>

          {!success ? (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={routes.login}
                className="font-medium text-uni-primary hover:text-uni-primary-light"
              >
                Log in
              </Link>
            </p>
          ) : null}
        </div>
      </PageContainer>

      <Footer />
    </div>
  );
}
