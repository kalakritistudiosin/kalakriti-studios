'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type NavItem = { href: string; label: string };

export function MobileMenu({ items, account }: { items: NavItem[]; account: NavItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label="Open menu" data-testid="mobile-menu-btn" className="flex h-10 w-10 items-center justify-center rounded-md text-charcoal lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm bg-ivory p-0 [&>button]:hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <SheetTitle className="font-serif text-2xl font-normal text-maroon">Kalakriti</SheetTitle>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action="/shop" className="px-5 pt-5" onSubmit={() => setOpen(false)}>
          <label className="flex h-11 items-center gap-2 rounded-md border bg-white px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input name="q" placeholder="Search products, codes, tags…" className="w-full bg-transparent text-sm outline-none" data-testid="mobile-search-input" />
          </label>
        </form>
        <nav className="flex flex-col px-5 py-4">
          {[...items, account].map((it) => (
            <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className="border-b border-border/60 py-3.5 font-serif text-xl text-charcoal hover:text-maroon">
              {it.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
