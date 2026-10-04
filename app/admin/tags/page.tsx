import { prisma } from '@/lib/prisma';
import { PageTitle } from '@/components/admin/admin-nav';
import { TagsManager } from '@/components/admin/tags-manager';

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <PageTitle title="Tags" text="Tags power search and filters on the shop." />
      <TagsManager initial={tags} />
    </>
  );
}
