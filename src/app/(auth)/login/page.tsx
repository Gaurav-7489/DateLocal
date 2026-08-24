"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <PageContainer
        narrow
        className="flex flex-1 flex-col items-center justify-center"
      >
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Log in to your {universityConfig.appName} account
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-card p-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                University email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`you@${universityConfig.emailDomain}`}
                required
                autoComplete="email"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-uni-primary"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-uni-primary"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-uni-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={routes.register}
              className="font-medium text-uni-primary hover:text-uni-primary-light"
            >
              Join now
            </Link>
          </p>
        </div>
      </PageContainer>

      <Footer />
    </div>
  );
}