import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAdminProduct } from '@/lib/product-service';
import { PageTitle } from '@/components/admin/admin-nav';
import { ProductForm } from '@/components/admin/product-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories, tags] = await Promise.all([
    getAdminProduct(id),
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { name: true } }),
  ]);
  if (!p) notFound();
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-maroon"><ArrowLeft className="h-4 w-4" /> Products</Link>
      <PageTitle
        title="Edit product"
        text={`Last updated ${p.updatedAt.toLocaleString('en-IN')}`}
        action={<Link href={`/products/${p.slug}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-md border bg-white px-4 text-sm"><ExternalLink className="h-4 w-4" /> View on website</Link>}
      />
      <ProductForm
        categories={categories}
        allTags={tags.map((t) => t.name)}
        initial={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          code: p.code,
          shortDescription: p.shortDescription,
          description: p.description,
          categoryId: p.categoryId,
          tags: p.tags.map((t) => t.tag.name),
          mrp: p.mrp,
          offerPrice: p.offerPrice,
          stockStatus: p.stockStatus,
          isFeatured: p.isFeatured,
          isPublished: p.isPublished,
          isCustomizable: p.isCustomizable,
          images: p.images.map((i) => ({ publicId: i.cloudinaryPublicId, url: i.imageUrl, width: i.width, height: i.height })),
        }}
      />
    </>
  );
}
