import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tagSchema } from '@/lib/validators';
import { requireAdmin, handleError, revalidateSite } from '@/lib/authz';
import { slugify } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } });
  return NextResponse.json({ tags });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const d = tagSchema.parse(await req.json());
    const tag = await prisma.tag.create({ data: { name: d.name, slug: slugify(d.name) } });
    revalidateSite();
    return NextResponse.json({ tag }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
