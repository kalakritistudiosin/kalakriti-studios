import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, Brush, Gift, Heart, Instagram, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { getFeaturedProducts, getNavCategories, getSettings } from '@/lib/queries';
import { whatsappChatLink, instagramHandle, cld } from '@/lib/format';
import { ProductGrid, SectionHeading } from '@/components/site/product-grid';
import { BRAND } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: `${BRAND.name} — ${s.heroTitle}` },
    description: s.heroSubtitle || BRAND.description,
    alternates: { canonical: '/' },
    openGraph: { images: s.heroImage ? [{ url: cld(s.heroImage, 'f_jpg,q_auto,c_fill,w_1200,h_630') }] : [] },
  };
}

const VALUES = [
  { icon: Brush, title: 'Truly handmade', text: 'Every piece is painted, sketched or threaded by hand — no two are ever exactly alike.' },
  { icon: Sparkles, title: 'Personalised for you', text: 'Names, colours, photos and themes — we happily customise pieces for your story.' },
  { icon: Gift, title: 'Gift-ready finish', text: 'Thoughtfully finished and packed, so your gift feels special the moment it arrives.' },
  { icon: Heart, title: 'Made with intention', text: 'Small-batch, slow craft rooted in Indian art traditions and made to be treasured.' },
];

export default async function HomePage() {
  const [settings, categories, featured] = await Promise.all([getSettings(), getNavCategories(), getFeaturedProducts(4)]);
  const mainCategories = categories.slice(0, 3);
  const wa = whatsappChatLink(settings.whatsappNumber);
  const waCustom = whatsappChatLink(settings.whatsappNumber, 'Hello Kalakriti Studios, I would like to request a custom artwork.');

  return (
    <>
      {/* HERO — text-first, leads straight into the 3 collections */}
      <section className="relative overflow-hidden bg-cream" data-testid="hero">
        <div className="container relative pb-10 pt-12 text-center sm:pb-12 sm:pt-14 lg:pt-16">
          <p className="eyebrow">Kalakriti Studios · Handmade in India</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-[2.5rem] font-medium leading-[1.05] text-charcoal sm:text-6xl lg:text-[4.5rem]" data-testid="hero-title">
            {settings.heroTitle}
          </h1>
          <div className="mt-5 flex items-center justify-center gap-2" aria-hidden>
            <span className="h-px w-12 bg-gold/70" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-12 bg-gold/70" />
          </div>
          {settings.heroSubtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-charcoal-light sm:text-lg" data-testid="hero-subtitle">
              {settings.heroSubtitle}
            </p>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={settings.heroCtaHref || '/shop'} data-testid="hero-cta" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-maroon px-7 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-maroon-dark sm:w-auto">
              {settings.heroCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            {waCustom && (
              <a href={waCustom} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-charcoal/25 bg-ivory/60 px-7 text-sm font-medium text-charcoal hover:border-maroon hover:text-maroon sm:w-auto">
                Request Custom Artwork
              </a>
            )}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-charcoal/60">
            <span>Handmade</span><span className="text-gold">◆</span><span>Personalised</span><span className="text-gold">◆</span><span>Gift-ready</span>
          </div>
        </div>
      </section>

      {/* 3 MAIN CATEGORIES */}
      <section className="relative bg-gradient-to-b from-cream to-background pb-20 sm:pb-24" id="collections" data-testid="categories-section">
        <div className="container">
          <p className="eyebrow mb-8 text-center">Our Collections</p>
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {mainCategories.map((c, i) => (
              <div key={c.id} className={i === 2 ? 'sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)] lg:col-span-1 lg:w-full' : ''}>
                <Link href={`/category/${c.slug}`} className="group block" data-testid={`category-card-${c.slug}`}>
                  <div className="arch relative aspect-[4/5] overflow-hidden bg-cream-dark">
                    {c.imageUrl ? (
                      <Image
                        src={c.imageUrl}
                        alt={c.name}
                        fill
                        priority={i === 0}
                        loading={i === 0 ? undefined : i < 3 ? 'eager' : 'lazy'}
                        sizes="(min-width:1280px) 410px, (min-width:1024px) 31vw, (min-width:640px) 48vw, 92vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-serif text-6xl text-gold/50">{c.name[0]}</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/50 to-transparent" />
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-serif text-sm italic text-ivory/90">0{i + 1}</span>
                  </div>
                  <div className="pt-6 text-center">
                    <h2 className="font-serif text-[1.7rem] leading-tight text-charcoal">{c.name}</h2>
                    {c.description && <p className="mx-auto mt-2 line-clamp-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{c.description}</p>}
                    <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-md border border-maroon px-6 text-[13px] font-medium uppercase tracking-[0.12em] text-maroon transition-colors group-hover:bg-maroon group-hover:text-ivory">
                      Explore {c.name} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      {featured.length > 0 && (
        <section className="bg-cream/50 py-20 sm:py-24" data-testid="bestsellers-section">
          <div className="container">
            <SectionHeading eyebrow="Most loved" title="Best Sellers" />
            <div className="mt-12">
              <ProductGrid products={featured} whatsapp={settings.whatsappNumber} eager={false} />
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="container py-20 sm:py-24" data-testid="why-section">
        <SectionHeading eyebrow="Why Kalakriti" title="Crafted to be cherished" />
        <div className="mt-14 grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-ivory p-7 sm:p-8">
              <v.icon className="h-6 w-6 text-gold-dark" strokeWidth={1.4} />
              <h3 className="mt-5 font-serif text-2xl text-charcoal">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM + CONTACT */}
      <section className="container" data-testid="contact-section">
        <div className="relative overflow-hidden rounded-md bg-maroon px-6 py-14 text-center text-ivory sm:px-12 sm:py-20">
          <div className="arch pointer-events-none absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 border border-gold/30" aria-hidden />
          <p className="text-[11px] uppercase tracking-eyebrow text-gold-light">Let&apos;s create together</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl leading-tight sm:text-5xl">Have something special in mind?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory/75 sm:text-base">
            Message us for orders, custom artwork or gifting for occasions. We usually reply within a few hours.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" data-testid="contact-whatsapp" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ivory px-6 text-sm font-medium text-maroon hover:bg-white sm:w-auto">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} data-testid="contact-email" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-ivory/40 px-6 text-sm hover:bg-white/10 sm:w-auto">
                <Mail className="h-4 w-4" /> Email us
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" data-testid="contact-instagram" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-ivory/40 px-6 text-sm hover:bg-white/10 sm:w-auto">
                <Instagram className="h-4 w-4" /> {instagramHandle(settings.instagramUrl)}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
