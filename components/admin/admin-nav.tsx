'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, FolderOpen, Tags, Users, Settings, ExternalLink, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav({ email }: { email: string }) {
  const path = usePathname();
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="border-b px-6 py-5">
          <Link href="/admin" className="font-serif text-2xl text-maroon">Kalakriti</Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} data-testid={`admin-nav-${n.label.toLowerCase()}`} className={cn('flex items-center gap-3 rounded-md px-3 py-2.5 text-sm', active(n.href) ? 'bg-maroon text-ivory' : 'text-charcoal hover:bg-sidebar-accent')}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t p-3 text-sm">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-sidebar-accent"><ExternalLink className="h-4 w-4" /> View website</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
          <p className="truncate px-3 pt-2 text-xs text-muted-foreground">{email}</p>
        </div>
      </aside>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 border-b bg-sidebar lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-serif text-xl text-maroon">Kalakriti <span className="text-xs uppercase tracking-[0.2em] text-gold-dark">Admin</span></Link>
          <div className="flex items-center gap-1">
            <Link href="/" target="_blank" aria-label="View website" className="rounded-md p-2"><ExternalLink className="h-4 w-4" /></Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} aria-label="Sign out" className="rounded-md p-2"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs', active(n.href) ? 'bg-maroon text-ivory' : 'bg-white text-charcoal')}>
              <n.icon className="h-3.5 w-3.5" /> {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export function PageTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl text-charcoal sm:text-4xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
      </div>
      {action}
    </div>
  );
}
