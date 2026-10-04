import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircle, Palette } from 'lucide-react';
import { getProductBySlug, getRelatedProducts, getSettings } from '@/lib/queries';
import { whatsappOrderLink, whatsappCustomizeLink, cld } from '@/lib/format';
import { getBaseUrl, BRAND } from '@/lib/site';
import { ProductGallery } from '@/components/site/product-gallery';
import { ShareButtons } from '@/components/site/share-buttons';
import { StockBadge } from '@/components/site/stock-badge';
import { Price } from '@/components/site/price';
import { ProductGrid, SectionHeading } from '@/components/site/product-grid';

type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: 'Product not found', robots: { index: false } };
  const img = p.images[0]?.imageUrl;
  return {
    title: p.name,
    description: p.shortDescription,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, description: p.shortDescription, images: img ? [{ url: cld(img, 'f_jpg,q_auto,c_fill,w_1200,h_630') }] : [] },
    twitter: { card: 'summary_large_image', title: p.name, description: p.shortDescription, images: img ? [cld(img, 'f_jpg,q_auto,c_fill,w_1200,h_630')] : [] },
  };
}

const AVAIL = { IN_STOCK: 'https://schema.org/InStock', LIMITED_STOCK: 'https://schema.org/LimitedAvailability', OUT_OF_STOCK: 'https://schema.org/OutOfStock' };

export default async function ProductPage({ params }: { params: P }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [settings, related, base] = await Promise.all([getSettings(), getRelatedProducts(product.id, product.categoryId), getBaseUrl()]);
  const out = product.stockStatus === 'OUT_OF_STOCK';
  const wa = whatsappOrderLink(settings.whatsappNumber, product);
  const custom = product.isCustomizable ? whatsappCustomizeLink(settings.whatsappNumber, product) : null;
  const path = `/products/${product.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.code,
    description: product.shortDescription,
    image: product.images.map((i) => cld(i.imageUrl)),
    brand: { '@type': 'Brand', name: BRAND.name },
    ...(product.category ? { category: product.category.name } : {}),
    offers: {
      '@type': 'Offer',
      url: `${base}${path}`,
      priceCurrency: 'INR',
      price: product.offerPrice,
      availability: AVAIL[product.stockStatus],
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="container py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-maroon">Home</Link> <span className="mx-1.5">/</span>
        {product.category ? (
          <Link href={`/category/${product.category.slug}`} className="hover:text-maroon">{product.category.name}</Link>
        ) : (
          <Link href="/shop" className="hover:text-maroon">Shop</Link>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images.map((i) => ({ url: i.imageUrl }))} name={product.name} />

        <div className="lg:pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <Link href={`/category/${product.category.slug}`} className="eyebrow hover:text-maroon">{product.category.name}</Link>
            )}
            {product.isFeatured && <span className="rounded-sm bg-maroon px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ivory">Best Seller</span>}
          </div>
          <h1 className="mt-3 text-balance text-4xl leading-[1.1] text-charcoal sm:text-5xl" data-testid="product-title">{product.name}</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground" data-testid="product-code">Code: {product.code}</p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y py-5">
            <Price mrp={product.mrp} offer={product.offerPrice} size="lg" />
            <StockBadge status={product.stockStatus} className="text-xs" />
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-charcoal-light">{product.shortDescription}</p>

          <div className="mt-7 flex flex-col gap-3">
            {out ? (
              <div className="flex h-12 items-center justify-center rounded-md border border-dashed border-red-300 bg-red-50/60 text-sm font-medium uppercase tracking-wider text-red-800" data-testid="unavailable">
                Currently Unavailable
              </div>
            ) : wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-order-btn" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-medium text-ivory transition-colors hover:bg-maroon-dark">
                <MessageCircle className="h-5 w-5" /> Order on WhatsApp
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Ordering opens soon — contact details are being updated.</p>
            )}
            {custom && (
              <a href={custom} target="_blank" rel="noopener noreferrer" data-testid="customize-btn" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-gold bg-gold-50 px-6 text-[15px] font-medium text-charcoal transition-colors hover:border-maroon hover:text-maroon">
                <Palette className="h-5 w-5" /> Customize This Product
              </a>
            )}
          </div>

          <div className="mt-7">
            <ShareButtons path={path} title={product.name} />
          </div>

          {product.description && (
            <div className="mt-10">
              <h2 className="font-serif text-2xl text-charcoal">About this piece</h2>
              <div className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-charcoal-light" data-testid="product-description">{product.description}</div>
            </div>
          )}

          {product.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2" data-testid="product-tags">
              {product.tags.map(({ tag }) => (
                <Link key={tag.id} href={`/shop?tag=${tag.slug}`} className="rounded-full border px-3 py-1 text-xs text-charcoal-light hover:border-maroon hover:text-maroon">
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" data-testid="related-products">
          <SectionHeading eyebrow="You may also love" title="Related pieces" />
          <div className="mt-12">
            <ProductGrid products={related} whatsapp={settings.whatsappNumber} />
          </div>
        </section>
      )}
    </div>
  );
}
