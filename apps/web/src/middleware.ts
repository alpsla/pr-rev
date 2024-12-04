import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is not signed in and trying to access protected routes
    if (!req.nextauth.token) {
      // Store the attempted URL to redirect back after sign in
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Protect all routes under /settings and /api/settings
export const config = {
  matcher: ['/settings/:path*', '/api/settings/:path*']
};