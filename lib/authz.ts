import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Current user, always re-read from the database (role cannot be spoofed by a stale token). */
export async function getCurrentUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, passwordHash: true },
  });
}

export async function isAdmin() {
  const u = await getCurrentUser();
  return u?.role === 'ADMIN';
}

type Guard = { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> } | { ok: false; response: NextResponse };

/** Server-side admin guard for API routes. */
export async function requireAdmin(): Promise<Guard> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: 'Please sign in' }, { status: 401 }) };
  if (user.role !== 'ADMIN') return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { ok: true, user };
}

export function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status });
}

/** Uniform, safe error responses (never leaks internals). */
export function handleError(e: unknown) {
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return jsonError(first?.message || 'Invalid input', 422, e.flatten().fieldErrors);
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      const target = (e.meta?.target as string[] | undefined)?.join(', ') || 'value';
      return jsonError(`That ${target} is already in use`, 409);
    }
    if (e.code === 'P2025') return jsonError('Not found', 404);
  }
  if (e instanceof SyntaxError) return jsonError('Invalid JSON body', 400);
  console.error(e);
  return jsonError('Something went wrong', 500);
}

/** Make every admin change visible to customers immediately. */
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout');
  } catch {
    /* ignore */
  }
}
