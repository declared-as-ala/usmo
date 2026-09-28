import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body?.path || req.nextUrl.searchParams.get('path');
    const secret = req.headers.get('x-revalidate-secret') || req.nextUrl.searchParams.get('secret');

    const expectedSecret = process.env.REVALIDATION_SECRET || 'usm-revalidate-secret';
    // If a secret is configured in env and doesn't match, return 401
    if (process.env.REVALIDATION_SECRET && secret !== expectedSecret) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ message: 'Path is required' }, { status: 400 });
    }

    // Revalidate exact path and layout
    revalidatePath(path);
    revalidatePath(path, 'layout');
    revalidatePath(path, 'page');

    // Revalidate cache tags if any
    try {
      (revalidateTag as any)(`seo:${path}`);
      (revalidateTag as any)('seo');
    } catch {
      // Tags may be optional depending on next version
    }

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error revalidating' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
