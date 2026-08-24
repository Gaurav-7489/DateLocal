"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import { signOut } from "@/app/(app)/actions";

const appLinks = [
  { href: routes.app, label: "Home", icon: "🏠" },
  { href: routes.discover, label: "Discover", icon: "🔍" },
  { href: routes.matches, label: "Matches", icon: "💚" },
  { href: routes.messages, label: "Chat", icon: "💬" },
  { href: routes.profile, label: "Profile", icon: "👤" },
];

interface AppNavbarProps {
  userEmail: string;
}

export function AppNavbar({ userEmail }: AppNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4"
        aria-label="App navigation"
      >
        {/* Brand */}
        <Link
          href={routes.app}
          className="flex items-center gap-2 text-lg font-bold text-uni-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-uni-primary text-sm font-bold text-white">
            {universityConfig.shortName.charAt(0)}
          </span>
          <span className="hidden sm:inline">{universityConfig.appName}</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {appLinks.map((link) => {
            const isActive =
              link.href === routes.app
                ? pathname === routes.app
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-uni-primary-50 text-uni-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="text-base" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop user menu */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors hover:bg-muted cursor-pointer"
              aria-expanded={userMenuOpen}
              aria-label="User menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-uni-primary-50 text-xs font-semibold text-uni-primary">
                {userEmail.charAt(0).toUpperCase()}
              </span>
              <svg
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  userMenuOpen && "rotate-180",
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 z-50 mt-1 w-64 rounded-[var(--radius-lg)] border border-border bg-card py-1 shadow-[var(--shadow-lg)]">
                  {/* User info */}
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-medium text-foreground">
                      Account
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href={routes.profile}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <span aria-hidden="true">👤</span>
                      Your Profile
                    </Link>
                    <Link
                      href={routes.settings}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <span aria-hidden="true">⚙️</span>
                      Settings
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-border py-1">
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive transition-colors hover:bg-muted cursor-pointer"
                      >
                        <span aria-hidden="true">🚪</span>
                        Sign out
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-muted md:hidden cursor-pointer"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {appLinks.map((link) => {
              const isActive =
                link.href === routes.app
                  ? pathname === routes.app
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-uni-primary-50 text-uni-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span className="text-base" aria-hidden="true">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}

            <hr className="my-2 border-border" />

            {/* Mobile user info */}
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {userEmail}
              </p>
            </div>

            <Link
              href={routes.settings}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <span aria-hidden="true">⚙️</span>
              Settings
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-destructive hover:bg-muted cursor-pointer"
              >
                <span aria-hidden="true">🚪</span>
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
