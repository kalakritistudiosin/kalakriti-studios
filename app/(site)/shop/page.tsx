import type { Metadata } from 'next';
import { searchProducts, getNavCategories, getAllTags, getSettings } from '@/lib/queries';
import { ProductGrid, EmptyState, Pagination, SectionHeading } from '@/components/site/product-grid';
import { ShopToolbar } from '@/components/site/shop-toolbar';

type SP = Promise<Record<string, string | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: sp.q ? `Search: ${sp.q}` : 'Shop All Handmade Art & Gifts',
    description: 'Browse handmade craft designs, rakhis and hand-sketched portraits by Kalakriti Studios.',
    alternates: { canonical: '/shop' },
    ...(sp.q ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [result, categories, tags, settings] = await Promise.all([
    searchProducts({ ...sp, pageSize: 12 }),
    getNavCategories(),
    getAllTags(),
    getSettings(),
  ]);
  const makeHref = (p: number) => {
    const n = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    n.set('page', String(p));
    return `/shop?${n.toString()}`;
  };

  return (
    <div className="container py-12 sm:py-16">
      <SectionHeading eyebrow="The Shop" title={sp.q ? `Results for “${sp.q}”` : 'All Handmade Pieces'} />
      <div className="mt-10">
        <ShopToolbar categories={categories} tags={tags} total={result.total} />
      </div>
      <div className="mt-8">
        {result.items.length ? (
          <ProductGrid products={result.items} whatsapp={settings.whatsappNumber} />
        ) : (
          <EmptyState title="No pieces found" text="Try a different search or clear the filters to see the full collection." cta={{ href: '/shop', label: 'View all products' }} />
        )}
      </div>
      <Pagination page={result.page} pageCount={result.pageCount} makeHref={makeHref} />
    </div>
  );
}
