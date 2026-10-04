import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';
import { getCurrentUser } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/format';
import { SignOutButton } from '@/components/site/auth-buttons';

export const metadata: Metadata = { title: 'My Account', robots: { index: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/account');
  const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 });

  return (
    <div className="container max-w-4xl py-12 sm:py-16">
      <p className="eyebrow">My Account</p>
      <h1 className="mt-3 text-4xl text-charcoal sm:text-5xl">Namaste, {user.name?.split(' ')[0] || 'friend'}</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="rounded-md border bg-white p-6" data-testid="profile-card">
          <div className="flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-14 w-14 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream font-serif text-2xl text-maroon">{(user.name || user.email)[0].toUpperCase()}</div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-charcoal">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Member since</dt><dd>{user.createdAt.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Account type</dt><dd>{user.role === 'ADMIN' ? 'Administrator' : 'Customer'}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="inline-flex h-10 items-center rounded-md bg-maroon px-4 text-sm text-ivory">Admin Dashboard</Link>
            )}
            <SignOutButton />
          </div>
        </div>

        <div className="rounded-md border bg-white p-6" data-testid="orders-card">
          <h2 className="font-serif text-2xl text-charcoal">Order history</h2>
          {orders.length ? (
            <ul className="mt-4 divide-y">
              {orders.map((o) => (
                <li key={o.id} className="flex justify-between py-3 text-sm">
                  <span>#{o.id.slice(-6).toUpperCase()} · {o.createdAt.toLocaleDateString('en-IN')}</span>
                  <span>{formatINR(o.total)} · {o.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-md bg-cream/50 px-6 py-10 text-center">
              <Package className="h-8 w-8 text-gold-dark" strokeWidth={1.3} />
              <p className="mt-3 text-sm text-muted-foreground">Your orders will appear here. For now, orders are placed and tracked over WhatsApp.</p>
              <Link href="/shop" className="mt-5 text-sm font-medium text-maroon hover:underline">Browse the collection →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
