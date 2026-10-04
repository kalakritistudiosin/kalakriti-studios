import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/admin/admin-nav';
import { ProductsTable } from '@/components/admin/products-table';

export default function AdminProductsPage() {
  return (
    <>
      <PageTitle
        title="Products"
        text="Quick-edit stock, featured and published status right here."
        action={<Link href="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm text-ivory" data-testid="new-product-btn"><Plus className="h-4 w-4" /> New product</Link>}
      />
      <ProductsTable />
    </>
  );
}
