"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";

const publicLinks = [
  { href: routes.about, label: "About" },
  { href: routes.safety, label: "Safety" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          href={routes.home}
          className="flex items-center gap-2 text-lg font-bold text-uni-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-uni-primary text-sm font-bold text-white">
            {universityConfig.shortName.charAt(0)}
          </span>
          <span className="hidden sm:inline">{universityConfig.appName}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-uni-primary",
                pathname === link.href ? "text-uni-primary" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <Link
              href={routes.login}
              className="text-sm font-medium text-foreground transition-colors hover:text-uni-primary"
            >
              Log in
            </Link>
            <Link
              href={routes.register}
              className="rounded-[var(--radius-md)] bg-uni-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-uni-primary-light"
            >
              Join now
            </Link>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-uni-primary-50 text-uni-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border" />
            <Link
              href={routes.login}
              onClick={() => setMobileOpen(false)}
              className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Log in
            </Link>
            <Link
              href={routes.register}
              onClick={() => setMobileOpen(false)}
              className="rounded-[var(--radius-md)] bg-uni-primary px-3 py-2 text-center text-sm font-medium text-white hover:bg-uni-primary-light"
            >
              Join now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
