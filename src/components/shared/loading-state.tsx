export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <div
        className="h-8 w-8 animate-spin rounded-full border-3 border-muted border-t-uni-primary"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}
