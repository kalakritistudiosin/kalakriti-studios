import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tagSchema } from '@/lib/validators';
import { requireAdmin, handleError, revalidateSite } from '@/lib/authz';
import { slugify } from '@/lib/format';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { id } = await params;
    const d = tagSchema.parse(await req.json());
    const tag = await prisma.tag.update({ where: { id }, data: { name: d.name, slug: slugify(d.name) } });
    revalidateSite();
    return NextResponse.json({ tag });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { id } = await params;
    await prisma.tag.delete({ where: { id } });
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
