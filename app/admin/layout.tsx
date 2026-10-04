import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/authz';
import { AdminNav } from '@/components/admin/admin-nav';
import { SignOutButton } from '@/components/site/auth-buttons';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/admin');
  if (user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center" data-testid="admin-forbidden">
        <p className="eyebrow">403 · Restricted</p>
        <h1 className="mt-3 text-4xl text-charcoal">Admins only</h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">You&apos;re signed in as {user.email}, which doesn&apos;t have admin access.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="inline-flex h-10 items-center rounded-md bg-maroon px-5 text-sm text-ivory">Back to website</Link>
          <SignOutButton />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-muted/50 lg:flex">
      <AdminNav email={user.email} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
