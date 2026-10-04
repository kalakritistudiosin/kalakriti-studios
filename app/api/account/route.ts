import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { accountSchema } from '@/lib/validators';
import { getCurrentUser, handleError, jsonError } from '@/lib/authz';

export const dynamic = 'force-dynamic';

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return jsonError('Please sign in', 401);
  const { passwordHash, ...user } = u;
  return NextResponse.json({ user: { ...user, hasPassword: !!passwordHash } });
}

export async function PATCH(req: Request) {
  try {
    const u = await getCurrentUser();
    if (!u) return jsonError('Please sign in', 401);
    const data = accountSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: u.id },
      data: { name: data.name },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    return handleError(e);
  }
}
