import { NextResponse, type NextRequest } from 'next/server';

function tryBase64Decode(segment: string): string | null {
  try {
    // Basic length/charset check
    if (!/^[-A-Za-z0-9_+=\/]+$/.test(segment)) return null;
    const text = Buffer.from(segment.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    if (!text) return null;
    return text;
  } catch {
    return null;
  }
}

function tryHexDecode(segment: string): string | null {
  try {
    if (!/^[0-9a-fA-F]+$/.test(segment) || segment.length % 2 !== 0) return null;
    const text = Buffer.from(segment, 'hex').toString('utf8');
    return text || null;
  } catch {
    return null;
  }
}

function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('admin_session')?.value;

  // Allow public access portal (obfuscated)
  if (pathname === '/b1kr4m-5h4d0w') {
    return NextResponse.next();
  }

  // Allow direct access to bikram route (admin dashboard) - REAL ACCESS
  if (pathname === '/bikram') {
    return NextResponse.next();
  }

  // Allow access to admin route - DEAD END (always fails PIN)
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  // Obfuscated paths support: decode last path segment via base64, hex, or rot13
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 1) {
    const seg = segments[0];
    const decoded =
      tryBase64Decode(seg) ||
      tryHexDecode(seg) ||
      rot13(seg);

    if (decoded === 'admin' || decoded === '/admin') {
      // Require session for direct admin, otherwise show portal
      if (session) return NextResponse.rewrite(new URL('/admin', request.url));
      return NextResponse.rewrite(new URL('/b1kr4m-5h4d0w', request.url));
    }
    if (decoded === 'admin/access' || decoded === '/admin/access') {
      return NextResponse.rewrite(new URL('/b1kr4m-5h4d0w', request.url));
    }
    if (decoded === 'bikram' || decoded === '/bikram') {
      // Obfuscated bikram access
      if (session) return NextResponse.rewrite(new URL('/bikram', request.url));
      return NextResponse.rewrite(new URL('/b1kr4m-5h4d0w', request.url));
    }
  }

  // Additional obfuscated bikram paths (more secure)
  if (pathname === '/Ym1rcmFt' || pathname === '/62696b72616d' || pathname === '/ovxenz' || pathname === '/b1kr4m') {
    if (session) return NextResponse.rewrite(new URL('/bikram', request.url));
    return NextResponse.rewrite(new URL('/b1kr4m-5h4d0w', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/bikram',
    '/admin',
    '/b1kr4m-5h4d0w',
    '/Ym1rcmFt',
    '/62696b72616d', 
    '/ovxenz',
    '/b1kr4m',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


