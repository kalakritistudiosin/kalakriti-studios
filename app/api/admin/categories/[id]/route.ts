import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validators';
import { requireAdmin, handleError, jsonError, revalidateSite } from '@/lib/authz';
import { slugify } from '@/lib/format';
import { destroyImages } from '@/lib/cloudinary';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { id } = await params;
    const old = await prisma.category.findUnique({ where: { id } });
    if (!old) return jsonError('Category not found', 404);
    const d = categorySchema.parse(await req.json());
    const category = await prisma.category.update({
      where: { id },
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
    if (old.imagePublicId && old.imagePublicId !== category.imagePublicId) await destroyImages([old.imagePublicId]);
    revalidateSite();
    return NextResponse.json({ category });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { id } = await params;
    const old = await prisma.category.delete({ where: { id } }); // products keep existing, category set to null
    await destroyImages([old.imagePublicId]);
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
