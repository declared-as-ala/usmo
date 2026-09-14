import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = body?.path;

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ message: 'Path is required' }, { status: 400 });
    }

    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error revalidating' }, { status: 500 });
  }
}
