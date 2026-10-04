import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/queries';
import { handleError } from '@/lib/authz';

export const dynamic = 'force-dynamic';

/** Public catalogue search (no login required). */
export async function GET(req: Request) {
  try {
    const sp = Object.fromEntries(new URL(req.url).searchParams.entries());
    const result = await searchProducts({ ...sp, pageSize: Math.min(parseInt(sp.pageSize || '12', 10) || 12, 48) });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return handleError(e);
  }
}
