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

export default function PageSkeleton({
  title = "Loading...",
  variant = "default",
}: PageSkeletonProps) {
  /* Matches Page Variant */
  if (variant === "matches" || variant === "list") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-3"
        role="status"
        aria-label={title}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="skeleton h-6 w-6 rounded-full" />
              <div className="skeleton h-7 w-40 rounded-lg" />
            </div>
            <div className="skeleton h-3.5 w-44 rounded-md" />
          </div>

          <div className="skeleton h-9 w-28 rounded-2xl" />
        </div>

        <div className="overflow-hidden rounded-[2.2rem] border border-[rgb(var(--border-color))]/70 bg-[rgb(var(--bg-surface))] shadow-lg">
          <div className="relative h-[min(50dvh,390px)] w-full overflow-hidden bg-[rgb(var(--skeleton-base))]">
            <div className="skeleton h-full w-full" />
            <div className="absolute right-4 top-4 z-10">
              <div className="skeleton h-7 w-24 rounded-full border border-white/20 shadow-sm" />
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <div className="skeleton h-7 w-52 rounded-lg" />
              <div className="skeleton h-4 w-36 rounded-md" />
              <div className="skeleton h-3.5 w-64 rounded-md pt-0.5" />
            </div>

            <div className="skeleton h-12 w-full rounded-2xl shadow-sm" />
          </div>
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* News & Feedback Page Variant */
  if (variant === "news") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-3"
        role="status"
        aria-label={title}
      >
        <div className="skeleton mb-3 h-7 w-36 rounded-full" />
        <div className="skeleton mb-2 h-8 w-60 rounded-lg" />
        <div className="mb-6 space-y-1.5">
          <div className="skeleton h-3.5 w-full rounded-md" />
          <div className="skeleton h-3.5 w-4/5 rounded-md" />
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-5 shadow-sm">
            <div className="skeleton h-4 w-48 rounded-md" />
          </div>

          <div className="space-y-4 rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-5 shadow-sm">
            <div className="space-y-1.5">
              <div className="skeleton h-5 w-36 rounded-md" />
              <div className="skeleton h-3.5 w-full rounded-md" />
              <div className="skeleton h-3.5 w-2/3 rounded-md" />
            </div>

            <div className="rounded-2xl bg-[rgb(var(--text-secondary))]/10 p-4">
              <div className="skeleton h-3.5 w-full rounded-md" />
              <div className="skeleton mt-1.5 h-3.5 w-1/3 rounded-md" />
            </div>
          </div>
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Messages / Chats List Page Variant */
  if (variant === "chats") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-3"
        role="status"
        aria-label={title}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="skeleton h-6 w-6 rounded-md" />
              <div className="skeleton h-7 w-32 rounded-lg" />
            </div>
            <div className="skeleton h-3.5 w-48 rounded-md" />
            <div className="skeleton h-3.5 w-20 rounded-md" />
          </div>
          <div className="skeleton h-9 w-28 rounded-2xl" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-4 shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="skeleton h-14 w-14 shrink-0 rounded-2xl" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-36 rounded-md" />
                  <div className="skeleton h-3 w-20 rounded-md" />
                </div>
              </div>
              <div className="skeleton h-3 w-12 self-start rounded-md" />
            </div>
          ))}
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Settings & Safety Page Variant */
  if (variant === "settings") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-3"
        role="status"
        aria-label={title}
      >
        <div className="skeleton mb-2 h-8 w-60 rounded-lg" />
        <div className="mb-6 space-y-1.5">
          <div className="skeleton h-3.5 w-full rounded-md" />
          <div className="skeleton h-3.5 w-4/5 rounded-md" />
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-5 shadow-sm">
            <div className="skeleton h-3.5 w-36 rounded-md" />
            <div className="space-y-2 pt-1">
              <div className="skeleton h-5 w-28 rounded-md" />
              <div className="skeleton h-3.5 w-64 rounded-md font-mono" />
              <div className="skeleton h-3.5 w-32 rounded-md" />
            </div>
            <div className="pt-2">
              <div className="skeleton h-8 w-32 rounded-full" />
            </div>
          </div>

          <div className="space-y-5 rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="skeleton h-5 w-5 shrink-0 rounded-sm" />
                <div className="space-y-1.5">
                  <div className="skeleton h-5 w-44 rounded-md" />
                  <div className="skeleton h-3.5 w-60 rounded-md" />
                </div>
              </div>
              <div className="skeleton h-8 w-14 rounded-xl" />
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <div className="skeleton h-3 w-24 rounded-md" />
                <div className="skeleton h-4 w-32 rounded-md" />
              </div>
              <div className="space-y-1">
                <div className="skeleton h-3 w-20 rounded-md" />
                <div className="skeleton h-4 w-24 rounded-md" />
              </div>
              <div className="space-y-1">
                <div className="skeleton h-3 w-24 rounded-md" />
                <div className="skeleton h-4 w-14 rounded-md" />
              </div>
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
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-3"
        role="status"
        aria-label={title}
      >
        <div className="skeleton mb-3 h-7 w-28 rounded-full" />
        <div className="skeleton mb-2 h-8 w-56 rounded-lg" />
        <div className="mb-6 space-y-1.5">
          <div className="skeleton h-3.5 w-full rounded-md" />
          <div className="skeleton h-3.5 w-24 rounded-md" />
        </div>

        <div className="space-y-5 rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-5 shadow-sm">
          <div className="skeleton h-6 w-44 rounded-md" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-28 rounded-md" />
              <div className="skeleton h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-24 rounded-md" />
              <div className="skeleton h-11 w-full rounded-xl" />
              <div className="skeleton h-3 w-48 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-20 rounded-md" />
              <div className="skeleton h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-28 rounded-md" />
              <div className="skeleton h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-32 rounded-md" />
              <div className="skeleton h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-12 rounded-md" />
              <div className="skeleton h-20 w-full rounded-xl" />
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
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-3"
        role="status"
        aria-label={title}
      >
        <div className="mb-4 space-y-1.5">
          <div className="skeleton h-8 w-44 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded-md" />
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="skeleton h-10 w-32 rounded-xl" />
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>

        <div className="space-y-5 rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-5 shadow-sm">
          <div className="flex justify-center pt-2">
            <div className="skeleton h-44 w-44 rounded-3xl" />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="skeleton h-7 w-32 rounded-lg" />
              <div className="skeleton h-6 w-10 rounded-md" />
              <div className="skeleton h-6 w-20 rounded-full" />
            </div>
            <div className="skeleton h-4 w-40 rounded-md" />
            <div className="skeleton h-3.5 w-32 rounded-md" />
          </div>

          <div className="pt-1">
            <div className="skeleton h-4 w-28 rounded-md" />
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="skeleton h-3.5 w-24 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <div className="skeleton h-7 w-28 rounded-full" />
              <div className="skeleton h-7 w-20 rounded-full" />
              <div className="skeleton h-7 w-16 rounded-full" />
              <div className="skeleton h-7 w-32 rounded-full" />
              <div className="skeleton h-7 w-20 rounded-full" />
              <div className="skeleton h-7 w-24 rounded-full" />
              <div className="skeleton h-7 w-18 rounded-full" />
              <div className="skeleton h-7 w-24 rounded-full" />
              <div className="skeleton h-7 w-20 rounded-full" />
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
        className="mx-auto flex h-full min-h-[85dvh] w-full max-w-lg flex-1 flex-col justify-between px-4 py-2"
        role="status"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-[rgb(var(--border-color))]/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-28 rounded-md" />
              <div className="skeleton h-3 w-16 rounded-md" />
            </div>
          </div>
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>

        <div className="flex flex-1 flex-col justify-end space-y-4 py-4">
          <div className="skeleton mx-auto h-3 w-20 rounded-full" />
          <div className="flex items-end gap-2">
            <div className="skeleton h-7 w-7 shrink-0 rounded-full" />
            <div className="skeleton h-10 w-44 rounded-2xl rounded-bl-sm" />
          </div>
          <div className="flex justify-end">
            <div className="skeleton h-12 w-52 rounded-2xl rounded-br-sm" />
          </div>
          <div className="flex items-end gap-2">
            <div className="skeleton h-7 w-7 shrink-0 rounded-full" />
            <div className="space-y-1.5">
              <div className="skeleton h-14 w-60 rounded-2xl rounded-bl-sm" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="skeleton h-9 w-32 rounded-2xl rounded-br-sm" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className="skeleton h-12 flex-1 rounded-full" />
          <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Exclusive Access Variant */
  if (variant === "exclusive") {
    return (
      <div
        className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col px-4 py-3"
        role="status"
        aria-label={title}
      >
        <div className="skeleton mb-3 h-7 w-36 rounded-full" />
        <div className="skeleton mb-2 h-8 w-4/5 rounded-lg" />
        <div className="mb-6 space-y-1.5">
          <div className="skeleton h-3.5 w-full rounded-md" />
          <div className="skeleton h-3.5 w-3/4 rounded-md" />
        </div>

        <div className="space-y-4 rounded-3xl border border-[rgb(var(--border-color))]/50 bg-[rgb(var(--bg-surface))] p-4 shadow-sm">
          <div className="flex items-start gap-3.5 pb-1">
            <div className="skeleton h-12 w-12 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2 pt-0.5">
              <div className="skeleton h-5 w-36 rounded-md" />
              <div className="skeleton h-3.5 w-full rounded-md" />
              <div className="skeleton h-3.5 w-4/5 rounded-md" />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[rgb(var(--border-color))]/40 bg-[rgb(var(--bg-primary))] p-3.5"
              >
                <div className="flex items-center gap-2">
                  <div className="skeleton h-4 w-4 rounded-sm" />
                  <div className="skeleton h-4 w-28 rounded-md" />
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="skeleton h-3 w-5/6 rounded-md" />
                  <div className="skeleton h-3 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <span className="sr-only">{title}</span>
      </div>
    );
  }

  /* Default generic fallback */
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col gap-4 p-4">
      <div className="skeleton h-8 w-1/2 rounded-lg" />
      <div className="skeleton h-48 w-full rounded-2xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
      <span className="sr-only">{title}</span>
    </div>
  );
}
