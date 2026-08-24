"use client";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <span className="text-4xl" aria-hidden="true">⚠️</span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-[var(--radius-md)] bg-uni-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-uni-primary-light cursor-pointer"
        >
          Try again
        </button>
      )}
    </div>
  );
}
