import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { settingsSchema } from '@/lib/validators';
import { requireAdmin, handleError, revalidateSite } from '@/lib/authz';
import { getSettingsFresh } from '@/lib/queries';
import { destroyImages } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  return NextResponse.json({ settings: await getSettingsFresh() });
}

export async function PUT(req: Request) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const d = settingsSchema.parse(await req.json());
    const old = await getSettingsFresh();
    const settings = await prisma.settings.update({
      where: { id: 'default' },
      data: { ...d, heroImagePublicId: d.heroImagePublicId || null },
    });
    if (old.heroImagePublicId && old.heroImagePublicId !== settings.heroImagePublicId) {
      await destroyImages([old.heroImagePublicId]);
    }
    revalidateSite();
    return NextResponse.json({ settings });
  } catch (e) {
    return handleError(e);
  }
}
