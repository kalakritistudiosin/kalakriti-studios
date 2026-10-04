import Link from 'next/link';
import { Search, UserRound } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getNavCategories } from '@/lib/queries';
import { MobileMenu } from './mobile-menu';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Kalakriti Studios — Home" data-testid="logo">
      <span className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full sm:h-11 sm:w-11 ${light ? 'ring-1 ring-gold/50' : 'ring-1 ring-gold/40'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.jpg" alt="" width={44} height={44} className="h-full w-full origin-[50%_31%] scale-[1.8] object-cover" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-[24px] font-medium tracking-tight sm:text-[27px] ${light ? 'text-ivory' : 'text-maroon'}`}>Kalakriti</span>
        <span className={`mt-0.5 text-[9px] font-medium uppercase tracking-[0.42em] ${light ? 'text-gold-light' : 'text-gold-dark'}`}>Studios</span>
      </span>
    </Link>
  );
}

export async function Header() {
  const [session, categories] = await Promise.all([auth(), getNavCategories()]);
  const items = [
    { href: '/shop', label: 'Shop All' },
    ...categories.slice(0, 3).map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
  ];
  const account = session?.user
    ? session.user.role === 'ADMIN'
      ? { href: '/admin', label: 'Admin Dashboard' }
      : { href: '/account', label: 'My Account' }
    : { href: '/login', label: 'Sign in' };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      <div className="bg-maroon py-1.5 text-center text-[11px] tracking-[0.12em] text-ivory/90">Handmade in India · Custom orders welcome on WhatsApp</div>
      <div className="container flex h-16 items-center justify-between gap-3 sm:h-[72px]">
        <div className="flex items-center gap-1">
          <MobileMenu items={items} account={account} />
          <Logo />
        </div>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="text-[13px] font-medium uppercase tracking-[0.12em] text-charcoal/80 transition-colors hover:text-maroon">
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <form action="/shop" className="hidden md:block" role="search">
            <label className="flex h-10 w-56 items-center gap-2 rounded-full border border-border bg-white px-4 focus-within:border-maroon xl:w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input name="q" placeholder="Search…" aria-label="Search products" className="w-full bg-transparent text-sm outline-none" data-testid="header-search-input" />
            </label>
          </form>
          <Link href="/shop" aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-md md:hidden">
            <Search className="h-5 w-5" />
          </Link>
          <Link href={account.href} aria-label={account.label} data-testid="header-account-link" className="flex h-10 items-center gap-2 rounded-md px-2 text-charcoal hover:text-maroon">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
            <span className="hidden text-[13px] font-medium xl:inline">{account.label}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
