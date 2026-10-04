export default function Loading() {
  return (
    <div className="container py-14" data-testid="page-loading" aria-busy="true">
      <div className="mx-auto h-4 w-32 animate-pulse rounded bg-cream-dark" />
      <div className="mx-auto mt-4 h-10 w-72 max-w-full animate-pulse rounded bg-cream-dark" />
      <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-md bg-cream" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-cream" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-cream" />
          </div>
        ))}
      </div>
    </div>
  );
}
