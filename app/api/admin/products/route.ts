import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validators';
import { requireAdmin, handleError, revalidateSite } from '@/lib/authz';
import { saveProduct } from '@/lib/product-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 80);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10) || 1, 1);
    const pageSize = 20;
    const where: Prisma.ProductWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, items] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: { select: { id: true, name: true } },
        },
      }),
    ]);
    return NextResponse.json({ items, total, page, pageCount: Math.max(Math.ceil(total / pageSize), 1) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const data = productSchema.parse(await req.json());
    const product = await saveProduct(data);
    revalidateSite();
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
