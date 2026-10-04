'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, SlidersHorizontal, Loader2, X, ChevronDown } from 'lucide-react';

/** Native <select> styled like the design system (lighter JS, best UX on mobile). */
function NativeSelect({ value, onChange, className, testId, label, children }: { value: string; onChange: (v: string) => void; className?: string; testId?: string; label: string; children: React.ReactNode }) {
  return (
    <span className={`relative inline-flex ${className ?? ''}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="h-full w-full cursor-pointer appearance-none rounded-md border border-input bg-white pl-3 pr-9 text-sm text-charcoal outline-none focus:border-maroon"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
    </span>
  );
}

type Opt = { slug: string; name: string };

export function ShopToolbar({ categories, tags, hideCategory = false, total }: { categories: Opt[]; tags: Opt[]; hideCategory?: boolean; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(sp.get('q') || '');
  const [min, setMin] = useState(sp.get('min') || '');
  const [max, setMax] = useState(sp.get('max') || '');

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v && v !== 'all' ? next.set(k, v) : next.delete(k)));
    next.delete('page');
    start(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const active = ['q', 'category', 'stock', 'tag', 'min', 'max'].filter((k) => sp.get(k)).length;
  const sel = 'h-10 w-full sm:w-[170px]';

  return (
    <div className="space-y-4" data-testid="shop-toolbar">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() });
          }}
        >
          <label className="flex h-11 items-center gap-2 rounded-md border bg-white px-3 focus-within:border-maroon">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, code, tag or category" className="w-full bg-transparent text-sm outline-none" data-testid="shop-search-input" />
            {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </label>
        </form>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen((o) => !o)} data-testid="filters-toggle" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm hover:border-maroon sm:flex-none">
            <SlidersHorizontal className="h-4 w-4" /> Filters {active > 0 && <span className="rounded-full bg-maroon px-1.5 text-[10px] text-ivory">{active}</span>}
          </button>
          <NativeSelect label="Sort" value={sp.get('sort') || 'featured'} onChange={(v) => update({ sort: v === 'featured' ? '' : v })} className="h-11 flex-1 sm:w-[190px] sm:flex-none" testId="sort-select">
            <option value="featured">Featured</option>
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </NativeSelect>
        </div>
      </div>

      {open && (
        <div className="grid gap-3 rounded-md border bg-cream/40 p-4 sm:flex sm:flex-wrap sm:items-end" data-testid="filters-panel">
          {!hideCategory && (
            <NativeSelect label="Category" value={sp.get('category') || 'all'} onChange={(v) => update({ category: v })} className={sel} testId="filter-category">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </NativeSelect>
          )}
          <NativeSelect label="Availability" value={sp.get('stock') || 'all'} onChange={(v) => update({ stock: v })} className={sel} testId="filter-stock">
            <option value="all">Any availability</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LIMITED_STOCK">Limited Stock</option>
            <option value="OUT_OF_STOCK">Out Of Stock</option>
          </NativeSelect>
          {tags.length > 0 && (
            <NativeSelect label="Tag" value={sp.get('tag') || 'all'} onChange={(v) => update({ tag: v })} className={sel} testId="filter-tag">
              <option value="all">All tags</option>
              {tags.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </NativeSelect>
          )}
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              update({ min, max });
            }}
          >
            <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Min ₹" className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:border-maroon sm:w-24" data-testid="filter-min" />
            <span className="text-muted-foreground">–</span>
            <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Max ₹" className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:border-maroon sm:w-24" data-testid="filter-max" />
            <button type="submit" className="h-10 rounded-md bg-charcoal px-4 text-sm text-ivory" data-testid="filter-price-apply">Apply</button>
          </form>
          {active > 0 && (
            <button
              type="button"
              data-testid="filters-clear"
              onClick={() => {
                setQ(''); setMin(''); setMax('');
                start(() => router.push(pathname));
              }}
              className="inline-flex h-10 items-center gap-1 text-sm text-maroon hover:underline"
            >
              <X className="h-4 w-4" /> Clear all
            </button>
          )}
        </div>
      )}
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground" data-testid="results-count">
        {total} {total === 1 ? 'piece' : 'pieces'}
      </p>
    </div>
  );
}
