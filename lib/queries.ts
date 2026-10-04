import { cache } from 'react';
import { Prisma, type StockStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  code: true,
  shortDescription: true,
  mrp: true,
  offerPrice: true,
  stockStatus: true,
  isFeatured: true,
  isCustomizable: true,
  images: { select: { imageUrl: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
  category: { select: { name: true, slug: true } },
  _count: { select: { images: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export const getSettings = cache(async () => {
  const s = await prisma.settings.findUnique({ where: { id: 'default' } });
  return s ?? (await prisma.settings.create({ data: { id: 'default' } }));
});

export const getNavCategories = cache(() =>
  prisma.category.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true, imageUrl: true, description: true },
  })
);

export const getAllTags = cache(() =>
  prisma.tag.findMany({
    where: { products: { some: { product: { isPublished: true } } } },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
);

export function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: productCardSelect,
  });
}

export function getCategoryCollections(perCategory = 4) {
  return prisma.category.findMany({
    where: { isPublished: true, products: { some: { isPublished: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      products: {
        where: { isPublished: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: perCategory,
        select: productCardSelect,
      },
    },
  });
}

export type SortKey = 'featured' | 'latest' | 'price_asc' | 'price_desc';
export type ProductQuery = {
  q?: string;
  category?: string;
  stock?: string;
  tag?: string;
  min?: string | number;
  max?: string | number;
  sort?: string;
  page?: string | number;
  pageSize?: number;
};

const STOCK_VALUES = ['IN_STOCK', 'LIMITED_STOCK', 'OUT_OF_STOCK'];

export async function searchProducts(params: ProductQuery) {
  const pageSize = Math.min(Math.max(params.pageSize || 12, 1), 48);
  const page = Math.max(parseInt(String(params.page || '1'), 10) || 1, 1);
  const q = (params.q || '').trim().slice(0, 80);
  const min = parseInt(String(params.min ?? ''), 10);
  const max = parseInt(String(params.max ?? ''), 10);

  const where: Prisma.ProductWhereInput = { isPublished: true };
  const and: Prisma.ProductWhereInput[] = [];
  if (q) {
    const c = { contains: q, mode: 'insensitive' as const };
    and.push({
      OR: [
        { name: c },
        { code: c },
        { shortDescription: c },
        { tags: { some: { tag: { name: c } } } },
        { category: { name: c } },
      ],
    });
  }
  if (params.category) and.push({ category: { slug: params.category } });
  if (params.stock && STOCK_VALUES.includes(params.stock)) and.push({ stockStatus: params.stock as StockStatus });
  if (params.tag) and.push({ tags: { some: { tag: { slug: params.tag } } } });
  if (!Number.isNaN(min)) and.push({ offerPrice: { gte: min } });
  if (!Number.isNaN(max)) and.push({ offerPrice: { lte: max } });
  if (and.length) where.AND = and;

  const sort = (params.sort as SortKey) || 'featured';
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === 'latest'
      ? [{ createdAt: 'desc' }]
      : sort === 'price_asc'
        ? [{ offerPrice: 'asc' }, { createdAt: 'desc' }]
        : sort === 'price_desc'
          ? [{ offerPrice: 'desc' }, { createdAt: 'desc' }]
          : [{ isFeatured: 'desc' }, { createdAt: 'desc' }];

  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, select: productCardSelect }),
  ]);
  return { items, total, page, pageSize, pageCount: Math.max(Math.ceil(total / pageSize), 1), sort };
}

export const getProductBySlug = cache((slug: string) =>
  prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
    },
  })
);

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  const related = await prisma.product.findMany({
    where: { isPublished: true, id: { not: productId }, ...(categoryId ? { categoryId } : {}) },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    select: productCardSelect,
  });
  if (related.length >= limit || !categoryId) return related;
  const more = await prisma.product.findMany({
    where: { isPublished: true, id: { notIn: [productId, ...related.map((r) => r.id)] } },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: limit - related.length,
    select: productCardSelect,
  });
  return [...related, ...more];
}
