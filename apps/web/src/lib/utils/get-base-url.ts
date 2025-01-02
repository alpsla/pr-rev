/**
 * Gets the base URL for the application, handling dynamic ports in development
 */
export function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXTAUTH_URL || '';
  }

  // In development, let Next.js handle the port dynamically
  return 'http://localhost';
}

/**
 * Gets the full URL including the dynamic port from a request
 */
export function getUrlFromRequest(req?: Request) {
  if (!req && typeof window !== 'undefined') {
    // Client-side: use window.location
    return window.location.origin;
  }

  // Server-side with request: use request headers
  if (req) {
    const host = req.headers.get('host') || 'localhost';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    return `${protocol}://${host}`;
  }

  // Fallback to base URL
  return getBaseUrl();
}
