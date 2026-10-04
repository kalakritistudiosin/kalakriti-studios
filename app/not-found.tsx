import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center" data-testid="not-found">
      <Link href="/" className="font-serif text-2xl text-maroon">Kalakriti Studios</Link>
      <p className="mt-12 font-serif text-[7rem] leading-none text-gold/70">404</p>
      <h1 className="mt-4 text-3xl text-charcoal sm:text-4xl">This page wandered off</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="inline-flex h-11 items-center justify-center rounded-md bg-maroon px-6 text-sm text-ivory">Back to home</Link>
        <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm">Browse the shop</Link>
      </div>
    </div>
  );
}
