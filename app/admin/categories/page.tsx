import { prisma } from '@/lib/prisma';
import { PageTitle } from '@/components/admin/admin-nav';
import { CategoriesManager } from '@/components/admin/categories-manager';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <>
      <PageTitle title="Categories" text="Change names, images, descriptions and display order." />
      <CategoriesManager initial={categories} />
    </>
  );
}
