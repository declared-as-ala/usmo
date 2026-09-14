import { NextResponse } from 'next/server';
import { generateLlmsTxt } from '@/lib/seo/llmsContent';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours cache

export function GET() {
  const content = generateLlmsTxt();

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
