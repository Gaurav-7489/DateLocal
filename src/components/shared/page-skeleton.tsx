import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  title?: string;
  variant?:
    | "exclusive"
    | "matches"
    | "chats"
    | "chat"
    | "profile"
    | "settings"
    | "edit-profile"
    | "news"
    | "list"
    | "default";
}

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/60",
        className
      )}
    />
  );
}

export default function PageSkeleton({
  title = "Loading...",
  variant = "default",
}: PageSkeletonProps) {
  /* Matches Page Variant (2-Column Grid of Character Cards with rounded action buttons) */
  if (variant === "matches" || variant === "list") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans"
        role="status"
        aria-label={title}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Bone className="h-8 w-40 rounded-xl" />
              <Bone className="h-2.5 w-2.5 rounded-full" />
            </div>
            <Bone className="h-3.5 w-52 rounded-lg" />
          </div>
          <Bone className="h-9 w-28 rounded-full" />
        </div>

        {/* 2-Column Match Cards Grid */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-2 shadow-2xs"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-100">
                <Bone className="h-full w-full rounded-2xl" />
                <div className="absolute right-2 top-2">
                  <Bone className="h-5 w-16 rounded-full" />
                </div>
                <div className="absolute bottom-2 left-2 space-y-1">
                  <Bone className="h-4 w-24 rounded-md" />
                  <Bone className="h-3 w-16 rounded-md" />
                </div>
              </div>
              <div className="pt-2">
                <Bone className="h-9 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Messages / Chats List Page Variant (New Matches avatar row + stacked list items) */
  if (variant === "chats") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans"
        role="status"
        aria-label={title}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Bone className="h-6 w-6 rounded-lg" />
              <Bone className="h-7 w-36 rounded-xl" />
            </div>
            <Bone className="h-3.5 w-56 rounded-lg" />
          </div>
          <Bone className="h-9 w-24 rounded-2xl" />
        </div>

        {/* New Matches Row */}
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Bone className="h-4 w-4 rounded-md" />
            <Bone className="h-3.5 w-28 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center space-y-1.5">
              <Bone className="h-16 w-16 rounded-2xl" />
              <Bone className="h-3 w-12 rounded-md" />
            </div>
          </div>
        </div>

        {/* Messages Stack */}
        <div className="space-y-2.5">
          <Bone className="h-3.5 w-20 rounded-md" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <Bone className="h-14 w-14 shrink-0 rounded-2xl" />
                <div className="space-y-2">
                  <Bone className="h-4 w-28 rounded-md" />
                  <Bone className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Bone className="h-3 w-8 self-center rounded-md" />
            </div>
          ))}
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* News & Feedback Page Variant */
  if (variant === "news") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans"
        role="status"
        aria-label={title}
      >
        <Bone className="mb-3 h-6 w-32 rounded-full" />
        <Bone className="mb-2 h-8 w-56 rounded-xl" />
        <div className="mb-6 space-y-1.5">
          <Bone className="h-3.5 w-full rounded-lg" />
          <Bone className="h-3.5 w-4/5 rounded-lg" />
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
            <Bone className="h-4 w-44 rounded-md" />
          </div>

          <div className="space-y-3 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
            <div className="space-y-1.5">
              <Bone className="h-5 w-36 rounded-md" />
              <Bone className="h-3.5 w-full rounded-md" />
              <Bone className="h-3.5 w-2/3 rounded-md" />
            </div>
            <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
              <Bone className="h-3.5 w-full rounded-md" />
              <Bone className="mt-1.5 h-3.5 w-1/3 rounded-md" />
            </div>
          </div>
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Single Conversation / Chat Room Variant */
  if (variant === "chat") {
    return (
      <div
        className="mx-auto flex h-full min-h-[85dvh] w-full max-w-lg flex-1 flex-col justify-between px-4 py-3 font-sans"
        role="status"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-full" />
            <Bone className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Bone className="h-4 w-28 rounded-md" />
              <Bone className="h-3 w-16 rounded-md" />
            </div>
          </div>
          <Bone className="h-8 w-8 rounded-full" />
        </div>

        <div className="flex flex-1 flex-col justify-end space-y-3.5 py-4">
          <Bone className="mx-auto h-3 w-20 rounded-full" />
          <div className="flex items-end gap-2">
            <Bone className="h-7 w-7 shrink-0 rounded-full" />
            <Bone className="h-10 w-44 rounded-2xl rounded-bl-xs" />
          </div>
          <div className="flex justify-end">
            <Bone className="h-12 w-52 rounded-2xl rounded-br-xs bg-emerald-100" />
          </div>
          <div className="flex items-end gap-2">
            <Bone className="h-7 w-7 shrink-0 rounded-full" />
            <Bone className="h-14 w-60 rounded-2xl rounded-bl-xs" />
          </div>
          <div className="flex justify-end">
            <Bone className="h-9 w-32 rounded-2xl rounded-br-xs bg-emerald-100" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Bone className="h-12 flex-1 rounded-2xl" />
          <Bone className="h-12 w-12 shrink-0 rounded-2xl" />
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Settings Page Variant */
  if (variant === "settings") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans"
        role="status"
        aria-label={title}
      >
        <Bone className="mb-2 h-8 w-56 rounded-xl" />
        <div className="mb-6 space-y-1.5">
          <Bone className="h-3.5 w-full rounded-lg" />
          <Bone className="h-3.5 w-4/5 rounded-lg" />
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
            <Bone className="h-3.5 w-36 rounded-md" />
            <div className="space-y-2 pt-1">
              <Bone className="h-5 w-28 rounded-md" />
              <Bone className="h-3.5 w-56 rounded-md" />
            </div>
            <div className="pt-2">
              <Bone className="h-8 w-28 rounded-full" />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <Bone className="h-5 w-36 rounded-md" />
              <Bone className="h-7 w-12 rounded-full" />
            </div>
            <div className="space-y-3 pt-1">
              <Bone className="h-10 w-full rounded-xl" />
              <Bone className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Profile / You Page Variant */
  if (variant === "profile") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans"
        role="status"
        aria-label={title}
      >
        <div className="mb-4 space-y-1.5">
          <Bone className="h-8 w-40 rounded-xl" />
          <Bone className="h-4 w-64 rounded-lg" />
        </div>

        <div className="mb-5 flex items-center gap-3">
          <Bone className="h-10 w-32 rounded-2xl" />
          <Bone className="h-10 w-28 rounded-2xl" />
        </div>

        <div className="space-y-5 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
          <div className="flex justify-center pt-2">
            <Bone className="h-40 w-40 rounded-3xl" />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2.5">
              <Bone className="h-6 w-32 rounded-lg" />
              <Bone className="h-5 w-16 rounded-full" />
            </div>
            <Bone className="h-4 w-40 rounded-md" />
            <Bone className="h-3.5 w-32 rounded-md" />
          </div>

          <div className="space-y-2 pt-2">
            <Bone className="h-3.5 w-24 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <Bone className="h-7 w-24 rounded-full" />
              <Bone className="h-7 w-20 rounded-full" />
              <Bone className="h-7 w-28 rounded-full" />
              <Bone className="h-7 w-16 rounded-full" />
            </div>
          </div>
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Edit Profile Form Page Variant */
  if (variant === "edit-profile") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans"
        role="status"
        aria-label={title}
      >
        <Bone className="mb-3 h-6 w-28 rounded-full" />
        <Bone className="mb-2 h-8 w-52 rounded-xl" />
        <div className="mb-6 space-y-1.5">
          <Bone className="h-3.5 w-full rounded-lg" />
          <Bone className="h-3.5 w-3/4 rounded-lg" />
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
          <Bone className="h-5 w-40 rounded-md mb-2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <Bone className="h-3.5 w-24 rounded-md" />
                <Bone className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Exclusive / Extrovert Variant */
  if (variant === "exclusive") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-4 font-sans"
        role="status"
        aria-label={title}
      >
        <Bone className="mb-3 h-6 w-32 rounded-full" />
        <Bone className="mb-2 h-8 w-60 rounded-xl" />
        <div className="mb-6 space-y-1.5">
          <Bone className="h-3.5 w-full rounded-lg" />
          <Bone className="h-3.5 w-4/5 rounded-lg" />
        </div>

        <div className="space-y-3.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Bone className="h-5 w-28 rounded-md" />
                <Bone className="h-4 w-16 rounded-full" />
              </div>
              <Bone className="h-8 w-24 rounded-lg" />
              <Bone className="h-3.5 w-full rounded-md" />
              <Bone className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Default generic fallback */
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col gap-4 p-4 font-sans">
      <Bone className="h-8 w-1/2 rounded-xl" />
      <Bone className="h-48 w-full rounded-3xl" />
      <Bone className="h-24 w-full rounded-2xl" />
      <span className="sr-only">{title}</span>
    </div>
  );
}