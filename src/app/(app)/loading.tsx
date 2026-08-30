export default function AppLoading() {
  return (
    <div
      className="mx-auto w-full max-w-2xl animate-pulse px-4 py-4"
      aria-label="Loading"
      role="status"
    >
      <div className="mb-4 h-10 w-32 rounded-full bg-muted" />
      <div className="aspect-[4/5] min-h-[520px] rounded-[2rem] bg-muted" />
      <div className="mx-auto mt-5 flex justify-center gap-6">
        <div className="h-14 w-14 rounded-full bg-muted" />
        <div className="h-16 w-16 rounded-full bg-muted" />
      </div>
      <span className="sr-only">Loading DateBu</span>
    </div>
  );
}
