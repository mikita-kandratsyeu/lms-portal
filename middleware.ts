import { NextRequest, NextResponse } from 'next/server';

export { default } from 'next-auth/middleware';

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);

  headers.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    '/courses/:path*',
    '/dashboard/:path*',
    '/leaderboard/:path*',
    '/owner/:path*',
    '/settings/:path*',
    '/teacher/:path*',
  ],
};
