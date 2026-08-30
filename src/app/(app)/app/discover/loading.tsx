export default function DiscoverLoading() {
  return (
    <div
      className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col px-2 py-2 sm:px-4"
      role="status"
      aria-label="Loading Discover"
    >
      {/* Lightweight loading status */}
      <div className="mb-2 flex items-center justify-center gap-2 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">
          Finding people who match you...
        </p>
      </div>

      {/* Profile card skeleton */}
      <div className="relative mx-auto flex h-[min(70dvh,540px)] min-h-[360px] w-full max-w-lg items-center justify-center">
        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[rgb(var(--bg-surface))] p-4 shadow-xl">
          
          {/* Top section: Progress bar & Badges */}
          <div className="relative z-10 w-full space-y-3">
            {/* Top continuous progress bar */}
            <div className="skeleton h-1.5 w-full rounded-full" />

            {/* Verified badge & Options menu */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <div className="skeleton h-7 w-24 rounded-full" />
              <div className="skeleton h-7 w-7 rounded-full" />
            </div>
          </div>

          {/* Bottom profile info overlay */}
          <div className="relative z-10 space-y-3 pb-1">
            {/* Name, Age & Circular Dept Tag */}
            <div className="flex items-end justify-between">
              <div className="space-y-1.5">
                <div className="skeleton h-7 w-44 rounded-lg" />
                <div className="skeleton h-5 w-24 rounded-lg" />
                <div className="skeleton h-3.5 w-28 rounded-md" />
              </div>
              <div className="skeleton h-12 w-12 rounded-full" />
            </div>

            {/* Interest tag */}
            <div className="pt-1">
              <div className="skeleton h-6 w-32 rounded-full" />
            </div>

            {/* Pass / Like footer cue line */}
            <div className="flex items-center justify-between border-t border-[rgb(var(--border-color))]/40 pt-3">
              <div className="skeleton h-3 w-10 rounded" />
              <div className="skeleton h-3 w-10 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Action button skeletons (Pass & Like) */}
      <div className="mx-auto flex items-center justify-center gap-6 pt-4">
        {/* Pass Button Skeleton */}
        <div className="skeleton h-14 w-14 rounded-full shadow-md" />

        {/* Like Button Skeleton */}
        <div className="skeleton h-16 w-16 rounded-full shadow-lg" />
      </div>

      <span className="sr-only">Finding people who match you...</span>
    </div>
  );
}