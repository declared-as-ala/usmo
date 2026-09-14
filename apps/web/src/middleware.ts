import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static assets, API calls, internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Fast check with NestJS SEO redirect resolver
  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  try {
    const res = await fetch(`${apiUrl}/seo/redirects/resolve?path=${encodeURIComponent(pathname)}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.destination) {
        const destinationUrl = data.destination.startsWith('http')
          ? data.destination
          : new URL(`${data.destination}${search || ''}`, request.url);

        return NextResponse.redirect(destinationUrl, {
          status: data.statusCode || 301,
        });
      }
    }
  } catch {
    // Fail open: proceed normally if API is temporarily unreachable
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.png, .jpg, .svg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
