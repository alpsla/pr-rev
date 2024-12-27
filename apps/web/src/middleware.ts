import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Use withAuth to handle authentication
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
        const isApiRoute = req.nextUrl.pathname.startsWith('/api');
        const isAuthCallback = req.nextUrl.pathname.startsWith('/api/auth/callback');

        // Always allow auth callback route
        if (isAuthCallback) {
          return true;
        }

        // Allow API routes to handle their own auth
        if (isApiRoute) {
          return true;
        }

        // Allow auth pages when not authenticated
        if (isAuthPage) {
          return !isAuth;
        }

        // Require auth for dashboard
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return isAuth;
        }

        // Allow all other routes
        return true;
      },
    },
  }
);

// Configure protected routes
export const config = { matcher: ['/dashboard/:path*', '/auth/:path*', '/api/github/:path*'] };
