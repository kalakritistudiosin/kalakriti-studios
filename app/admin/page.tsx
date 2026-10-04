import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Package, Star, PackageX, Users, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSettingsFresh } from '@/lib/queries';
import { formatINR } from '@/lib/format';
import { PageTitle } from '@/components/admin/admin-nav';
import { StockBadge } from '@/components/site/stock-badge';

export default async function AdminDashboard() {
  const [total, featured, outOfStock, customers, recent, settings] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.product.count({ where: { stockStatus: 'OUT_OF_STOCK' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.findMany({ orderBy: { updatedAt: 'desc' }, take: 6, include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } }),
    getSettingsFresh(),
  ]);
  const stats = [
    { label: 'Total Products', value: total, icon: Package, href: '/admin/products' },
    { label: 'Featured', value: featured, icon: Star, href: '/admin/products' },
    { label: 'Out Of Stock', value: outOfStock, icon: PackageX, href: '/admin/products' },
    { label: 'Customers', value: customers, icon: Users, href: '/admin/customers' },
  ];

  return (
    <>
      <PageTitle
        title="Dashboard"
        text="Every change you make here is live on the website immediately."
        action={<Link href="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm text-ivory" data-testid="dashboard-new-product"><Plus className="h-4 w-4" /> New product</Link>}
      />
      {!settings.whatsappNumber && (
        <Link href="/admin/settings" className="mb-6 flex items-center gap-3 rounded-md border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900" data-testid="whatsapp-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" /> Add your WhatsApp number in Settings so customers can order. →
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" data-testid="dashboard-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-md border bg-white p-4 hover:border-maroon sm:p-5">
            <s.icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
            <p className="mt-3 font-serif text-4xl text-charcoal" data-testid={`stat-${s.label.toLowerCase().replace(/ /g, '-')}`}>{s.value}</p>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-md border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-serif text-xl">Recently updated</h2>
          <Link href="/admin/products" className="text-sm text-maroon hover:underline">All products</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-muted/50">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-cream">{p.images[0] && <Image src={p.images[0].imageUrl} alt="" fill sizes="48px" className="object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.code} · {formatINR(p.offerPrice)}{!p.isPublished && ' · Draft'}</p>
                  </div>
                  <StockBadge status={p.stockStatus} className="hidden sm:inline-flex" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
