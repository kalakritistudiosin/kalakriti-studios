import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Images } from 'lucide-react';
import type { ProductCardData } from '@/lib/queries';
import { whatsappOrderLink, discountPercent } from '@/lib/format';
import { StockBadge } from './stock-badge';
import { Price } from './price';
import { ShareIconButton } from './share-buttons';

export function ProductCard({
  product,
  whatsapp,
  imageCount,
  priority,
}: {
  product: ProductCardData & { _count?: { images: number } };
  whatsapp: string;
  imageCount?: number;
  priority?: boolean;
}) {
  const href = `/products/${product.slug}`;
  const img = product.images[0]?.imageUrl;
  const off = discountPercent(product.mrp, product.offerPrice);
  const out = product.stockStatus === 'OUT_OF_STOCK';
  const wa = whatsappOrderLink(whatsapp, product);
  const photos = imageCount ?? product._count?.images ?? 0;

  return (
    <article className="group flex h-full flex-col" data-testid="product-card">
      <Link href={href} className="relative block overflow-hidden rounded-md bg-cream" aria-label={product.name}>
        <div className="relative aspect-[4/5]">
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-4xl text-gold/60">K</div>
          )}
        </div>
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {product.isFeatured && (
            <span className="rounded-sm bg-maroon px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ivory">Best Seller</span>
          )}
          {off > 0 && <span className="rounded-sm bg-ivory/95 px-2 py-1 text-[10px] font-semibold text-maroon">{off}% OFF</span>}
        </div>
        {photos > 1 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-sm bg-charcoal/70 px-1.5 py-0.5 text-[10px] text-ivory">
            <Images className="h-3 w-3" /> {photos}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="truncate">{product.category?.name ?? 'Kalakriti'}</span>
          <span className="shrink-0 font-mono normal-case tracking-normal">{product.code}</span>
        </div>
        <h3 className="mt-1.5 font-serif text-lg leading-snug text-charcoal sm:text-xl">
          <Link href={href} className="hover:text-maroon">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Price mrp={product.mrp} offer={product.offerPrice} />
          <StockBadge status={product.stockStatus} />
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          {out ? (
            <span
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-dashed border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
              data-testid="unavailable"
            >
              Currently Unavailable
            </span>
          ) : wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="card-whatsapp-order"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-maroon px-3 text-[13px] font-medium text-ivory transition-colors hover:bg-maroon-dark"
            >
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-maroon px-3 text-[13px] font-medium text-ivory hover:bg-maroon-dark"
            >
              View Details
            </Link>
          )}
          <ShareIconButton path={href} title={product.name} />
        </div>
      </div>
    </article>
  );
}
