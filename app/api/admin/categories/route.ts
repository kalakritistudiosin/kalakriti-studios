import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validators';
import { requireAdmin, handleError, revalidateSite } from '@/lib/authz';
import { slugify } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const d = categorySchema.parse(await req.json());
    const category = await prisma.category.create({
      data: {
        name: d.name,
        slug: slugify(d.slug || d.name),
        description: d.description || null,
        imageUrl: d.imageUrl || null,
        imagePublicId: d.imagePublicId || null,
        sortOrder: d.sortOrder,
        isPublished: d.isPublished,
      },
    });
    revalidateSite();
    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
