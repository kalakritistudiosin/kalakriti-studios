import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productSchema, productPatchSchema } from '@/lib/validators';
import { requireAdmin, handleError, jsonError, revalidateSite } from '@/lib/authz';
import { saveProduct, getAdminProduct } from '@/lib/product-service';
import { destroyImages } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) return jsonError('Product not found', 404);
  return NextResponse.json({ product });
}

/** Full update */
export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { id } = await params;
    const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return jsonError('Product not found', 404);
    const data = productSchema.parse(await req.json());
    const product = await saveProduct(data, id);
    revalidateSite();
    return NextResponse.json({ product });
  } catch (e) {
    return handleError(e);
  }
}

/** Quick update: featured / published / stock */
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { id } = await params;
    const data = productPatchSchema.parse(await req.json());
    const product = await prisma.product.update({ where: { id }, data });
    revalidateSite();
    return NextResponse.json({ product });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { id } = await params;
    const images = await prisma.productImage.findMany({ where: { productId: id }, select: { cloudinaryPublicId: true } });
    await prisma.product.delete({ where: { id } });
    await destroyImages(images.map((i) => i.cloudinaryPublicId));
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
