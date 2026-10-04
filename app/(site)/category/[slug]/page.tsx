import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { searchProducts, getAllTags, getSettings } from '@/lib/queries';
import { cld } from '@/lib/format';
import { ProductGrid, EmptyState, Pagination } from '@/components/site/product-grid';
import { ShopToolbar } from '@/components/site/shop-toolbar';

type P = Promise<{ slug: string }>;
type SP = Promise<Record<string, string | undefined>>;

const getCategory = (slug: string) => prisma.category.findFirst({ where: { slug, isPublished: true } });

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return { title: 'Collection not found' };
  return {
    title: c.name,
    description: c.description || `Shop handmade ${c.name} by Kalakriti Studios.`,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title: c.name, description: c.description || undefined, images: c.imageUrl ? [{ url: cld(c.imageUrl, 'f_jpg,q_auto,c_fill,w_1200,h_630') }] : [] },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: P; searchParams: SP }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();
  const [result, tags, settings] = await Promise.all([
    searchProducts({ ...sp, category: slug, pageSize: 12 }),
    getAllTags(),
    getSettings(),
  ]);
  const makeHref = (p: number) => {
    const n = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    n.set('page', String(p));
    return `/category/${slug}?${n.toString()}`;
  };

  return (
    <>
      <section className="bg-cream" data-testid="category-hero">
        <div className="container grid items-center gap-8 py-10 sm:py-14 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_340px]">
          <div>
            <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-maroon">Home</Link> <span className="mx-1.5">/</span>
              <Link href="/shop" className="hover:text-maroon">Shop</Link> <span className="mx-1.5">/</span>
              <span className="text-charcoal">{category.name}</span>
            </nav>
            <p className="eyebrow mt-6">Collection</p>
            <h1 className="mt-3 text-4xl leading-tight text-charcoal sm:text-5xl lg:text-6xl" data-testid="category-title">{category.name}</h1>
            {category.description && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-charcoal-light">{category.description}</p>}
          </div>
          {category.imageUrl && (
            <div className="arch relative mx-auto hidden aspect-[4/5] w-full max-w-[340px] overflow-hidden md:block">
              <Image src={category.imageUrl} alt={category.name} fill priority sizes="340px" className="object-cover" />
            </div>
          )}
        </div>
      </section>
      <div className="container py-10 sm:py-14">
        <ShopToolbar categories={[]} tags={tags} hideCategory total={result.total} />
        <div className="mt-8">
          {result.items.length ? (
            <ProductGrid products={result.items} whatsapp={settings.whatsappNumber} />
          ) : (
            <EmptyState title="New pieces coming soon" text={`We’re crafting new ${category.name} pieces. Check back shortly or explore our other collections.`} cta={{ href: '/shop', label: 'Explore the shop' }} />
          )}
        </div>
        <Pagination page={result.page} pageCount={result.pageCount} makeHref={makeHref} />
      </div>
    </>
  );
}
