import Link from "next/link";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-5xl" aria-hidden="true">🔍</span>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href={routes.home}
        className="mt-2 rounded-[var(--radius-md)] bg-uni-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-uni-primary-light"
      >
        Go home
      </Link>
    </div>
  );
}
