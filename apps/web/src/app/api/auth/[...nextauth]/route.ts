import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const handler = NextAuth(authOptions);

// Log the request and response for debugging
const wrappedHandler = async (req: Request, context: { params: { nextauth: string[] } }) => {
  console.log('[NextAuth] Incoming request:', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    searchParams: Object.fromEntries(new URL(req.url).searchParams.entries())
  });

  // Clone the request to read its body (since it can only be read once)
  const clonedReq = req.clone();
  try {
    const body = await clonedReq.text();
    if (body) {
      console.log('[NextAuth] Request body:', body);
    }
  } catch {
    console.log('[NextAuth] Could not read request body');
  }

  try {
    const response = await handler(req, context);
    
    // Log response details
    if (response) {
      console.log('[NextAuth] Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
    }

    return response;
  } catch (error) {
    console.error('[NextAuth] Error in handler:', error);
    throw error;
  }
};

export { wrappedHandler as GET, wrappedHandler as POST };
