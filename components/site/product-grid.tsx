import Link from 'next/link';
import { ProductCard } from './product-card';
import type { ProductCardData } from '@/lib/queries';

export function ProductGrid({ products, whatsapp }: { products: (ProductCardData & { _count?: { images: number } })[]; whatsapp: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4" data-testid="product-grid">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} whatsapp={whatsapp} priority={i < 2} />
      ))}
    </div>
  );
}

export function EmptyState({ title, text, cta }: { title: string; text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="mx-auto max-w-md rounded-md border border-dashed border-gold/50 bg-cream/40 px-6 py-14 text-center" data-testid="empty-state">
      <div className="mx-auto mb-4 h-px w-12 bg-gold" />
      <h3 className="font-serif text-2xl text-charcoal">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {cta && (
        <Link href={cta.href} className="mt-6 inline-flex h-10 items-center rounded-md bg-maroon px-5 text-sm text-ivory hover:bg-maroon-dark">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export function Pagination({ page, pageCount, makeHref }: { page: number; pageCount: number; makeHref: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1);
  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination" data-testid="pagination">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className="h-9 rounded-md border px-3 text-sm leading-9 hover:border-maroon">
          Previous
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link
            href={makeHref(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-md border px-3 text-center text-sm leading-9 ${p === page ? 'border-maroon bg-maroon text-ivory' : 'hover:border-maroon'}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link href={makeHref(page + 1)} className="h-9 rounded-md border px-3 text-sm leading-9 hover:border-maroon">
          Next
        </Link>
      )}
    </nav>
  );
}

export function SectionHeading({ eyebrow, title, text, align = 'center' }: { eyebrow?: string; title: string; text?: string; align?: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-balance text-3xl leading-tight text-charcoal sm:text-4xl md:text-[2.75rem]">{title}</h2>
      <div className={`mt-4 flex items-center gap-2 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="h-px w-10 bg-gold/70" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <span className="h-px w-10 bg-gold/70" />
      </div>
      {text && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}
