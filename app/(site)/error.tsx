'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center" data-testid="error-page">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-4xl text-charcoal">We couldn&apos;t load this page</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">Please try again in a moment.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="h-11 rounded-md bg-maroon px-6 text-sm text-ivory">Try again</button>
        <Link href="/" className="inline-flex h-11 items-center rounded-md border px-6 text-sm">Go home</Link>
      </div>
    </div>
  );
}
