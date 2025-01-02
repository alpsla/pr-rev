import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;
      console.log('Auth check:', { path, hasToken: !!token });
      
      // Always allow auth-related routes
      if (path.startsWith('/api/auth') || path.startsWith('/auth')) {
        console.log('Allowing auth route');
        return true;
      }

      // Allow review pages to handle their own auth
      if (path.startsWith('/review')) {
        console.log('Allowing review page access');
        return true;
      }

      // Allow API routes to handle their own auth
      if (path.startsWith('/api')) {
        console.log('Allowing API route access');
        return true;
      }

      // Require auth for dashboard
      if (path.startsWith('/dashboard')) {
        const hasAccess = !!token;
        console.log('Checking dashboard access:', { hasAccess });
        return hasAccess;
      }

      // Allow all other routes
      console.log('Allowing public route access');
      return true;
    }
  }
});

// Configure protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/api/github/:path*',
    '/review/:path*'
  ]
};
