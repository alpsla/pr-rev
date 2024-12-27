import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

if (!process.env.GITHUB_CLIENT_ID) {
  throw new Error('GITHUB_CLIENT_ID is not defined');
}

if (!process.env.GITHUB_CLIENT_SECRET) {
  throw new Error('GITHUB_CLIENT_SECRET is not defined');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          // Only request minimal permissions for basic functionality
          scope: "read:user",
          prompt: "consent",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.scope = account.scope;
        // Only set hasPrivateAccess if repo scope is present
        token.hasPrivateAccess = account.scope?.includes('repo') || false;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        scope: token.scope,
        user: {
          ...session.user,
          hasPrivateAccess: token.hasPrivateAccess || false
        }
      };
    },
    async redirect({ url, baseUrl }) {
      // Log redirect attempt
      console.log('[auth] Redirect callback:', { url, baseUrl });
      
      // Handle empty or undefined URLs
      if (!url || url === '') {
        return baseUrl;
      }
      
      // Ensure we only redirect to relative URLs or URLs within our domain
      if (url.startsWith('/') || url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  // Use environment variable for callback URL to handle different ports
  useSecureCookies: false, // Allow non-HTTPS in development
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};
