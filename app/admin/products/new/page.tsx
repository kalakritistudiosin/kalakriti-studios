import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageTitle } from '@/components/admin/admin-nav';
import { ProductForm } from '@/components/admin/product-form';

export default async function NewProductPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { name: true } }),
  ]);
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-maroon"><ArrowLeft className="h-4 w-4" /> Products</Link>
      <PageTitle title="New product" />
      <ProductForm categories={categories} allTags={tags.map((t) => t.name)} />
    </>
  );
}
