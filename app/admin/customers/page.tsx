import { prisma } from '@/lib/prisma';
import { PageTitle } from '@/components/admin/admin-nav';

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  });
  return (
    <>
      <PageTitle title="Customers" text={`${customers.length} registered customer${customers.length === 1 ? '' : 's'} (Google sign-in).`} />
      <div className="rounded-md border bg-white" data-testid="customers-list">
        {customers.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No customers have signed in yet.</p>
        ) : (
          <ul className="divide-y">
            {customers.map((c) => (
              <li key={c.id} className="flex items-center gap-3 p-4">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="h-9 w-9 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-sm text-maroon">{(c.name || c.email)[0].toUpperCase()}</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{c.createdAt.toLocaleDateString('en-IN')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
