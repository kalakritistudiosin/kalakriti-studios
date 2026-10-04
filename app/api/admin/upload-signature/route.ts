import { NextResponse } from 'next/server';
import { requireAdmin, handleError } from '@/lib/authz';
import { uploadSignSchema } from '@/lib/validators';
import { signUpload } from '@/lib/cloudinary';

export async function POST(req: Request) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  try {
    const { kind } = uploadSignSchema.parse(await req.json());
    return NextResponse.json(signUpload(kind));
  } catch (e) {
    return handleError(e);
  }
}
