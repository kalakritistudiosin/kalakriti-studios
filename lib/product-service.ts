import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validators';
import { slugify } from '@/lib/format';
import { destroyImages } from '@/lib/cloudinary';

export type ProductInput = z.infer<typeof productSchema>;

async function uniqueSlug(base: string, excludeId?: string) {
  const root = base || 'product';
  let slug = root;
  for (let i = 2; i < 200; i++) {
    const hit = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!hit || hit.id === excludeId) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

async function resolveTagIds(names: string[]) {
  const unique = Array.from(new Map(names.map((n) => [slugify(n), n.trim()])).entries()).filter(([s]) => s);
  const ids: string[] = [];
  for (const [slug, name] of unique) {
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
    ids.push(tag.id);
  }
  return ids;
}

/** Create or fully update a product (images + tags are replaced atomically). */
export async function saveProduct(input: ProductInput, id?: string) {
  const slug = await uniqueSlug(slugify(input.slug || input.name), id);
  const tagIds = await resolveTagIds(input.tags);
  if (input.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!cat) throw new Prisma.PrismaClientKnownRequestError('Category not found', { code: 'P2025', clientVersion: '' });
  }

  const base = {
    name: input.name,
    slug,
    code: input.code.toUpperCase(),
    shortDescription: input.shortDescription,
    description: input.description,
    mrp: input.mrp,
    offerPrice: input.offerPrice,
    stockStatus: input.stockStatus,
    isFeatured: input.isFeatured,
    isPublished: input.isPublished,
    isCustomizable: input.isCustomizable,
    categoryId: input.categoryId || null,
  };
  const images = input.images.map((im, i) => ({
    cloudinaryPublicId: im.publicId,
    imageUrl: im.url,
    width: im.width ?? null,
    height: im.height ?? null,
    sortOrder: i,
  }));

  let removed: string[] = [];
  if (id) {
    const old = await prisma.productImage.findMany({ where: { productId: id }, select: { cloudinaryPublicId: true } });
    const keep = new Set(images.map((i) => i.cloudinaryPublicId));
    removed = old.map((o) => o.cloudinaryPublicId).filter((p) => !keep.has(p));
  }

  const product = await prisma.$transaction(async (tx) => {
    const p = id
      ? await tx.product.update({ where: { id }, data: base })
      : await tx.product.create({ data: base });
    await tx.productImage.deleteMany({ where: { productId: p.id } });
    if (images.length) await tx.productImage.createMany({ data: images.map((im) => ({ ...im, productId: p.id })) });
    await tx.productTag.deleteMany({ where: { productId: p.id } });
    if (tagIds.length) await tx.productTag.createMany({ data: tagIds.map((tagId) => ({ productId: p.id, tagId })) });
    return p;
  });

  if (removed.length) await destroyImages(removed);
  return getAdminProduct(product.id);
}

export function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      tags: { include: { tag: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}
