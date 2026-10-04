import Link from 'next/link';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { getNavCategories, getSettings } from '@/lib/queries';
import { whatsappChatLink, instagramHandle } from '@/lib/format';
import { Logo } from './header';

export async function Footer() {
  const [settings, categories] = await Promise.all([getSettings(), getNavCategories()]);
  const wa = whatsappChatLink(settings.whatsappNumber);
  return (
    <footer className="mt-24 bg-charcoal text-ivory/80" data-testid="footer">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-ivory/65">
            Handmade art and thoughtful gifts — crafted slowly, by hand, with love and intention.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-sans text-[11px] font-medium uppercase tracking-eyebrow text-gold-light">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-ivory">Home</Link></li>
            <li><Link href="/shop" className="hover:text-ivory">Shop All</Link></li>
            <li><Link href="/shop?sort=latest" className="hover:text-ivory">New Arrivals</Link></li>
            <li><Link href="/account" className="hover:text-ivory">My Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-sans text-[11px] font-medium uppercase tracking-eyebrow text-gold-light">Collections</h4>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}><Link href={`/category/${c.slug}`} className="hover:text-ivory">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-sans text-[11px] font-medium uppercase tracking-eyebrow text-gold-light">Get in touch</h4>
          <ul className="space-y-3 text-sm">
            {wa && (
              <li><a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-ivory"><MessageCircle className="h-4 w-4" /> WhatsApp</a></li>
            )}
            {settings.email && (
              <li><a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 break-all hover:text-ivory"><Mail className="h-4 w-4 shrink-0" /> {settings.email}</a></li>
            )}
            {settings.instagramUrl && (
              <li><a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-ivory"><Instagram className="h-4 w-4" /> {instagramHandle(settings.instagramUrl)}</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-ivory/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Kalakriti Studios. All rights reserved.</p>
          <p>Handcrafted with love in India</p>
        </div>
      </div>
    </footer>
  );
}
