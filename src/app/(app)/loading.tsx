export default function AppLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-md items-center justify-center px-4" role="status" aria-label="Loading">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground/20" />
      </div>
      <span className="sr-only">Loading Extrovert</span>
    </div>
  );
}
