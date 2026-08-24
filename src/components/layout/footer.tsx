import { universityConfig } from "@/config/university";
import { routes } from "@/config/routes";
import Link from "next/link";

const footerLinks = [
  { href: routes.about, label: "About" },
  { href: routes.safety, label: "Safety" },
  { href: routes.privacy, label: "Privacy" },
  { href: routes.terms, label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {universityConfig.appName}. For {universityConfig.name} students only.
        </p>
        <nav className="flex gap-4" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
