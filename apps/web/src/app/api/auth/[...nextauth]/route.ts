import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          // Request both basic and repo scopes by default
          scope: 'read:user user:email repo'
        }
      }
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github' && account.access_token) {
        try {
          // Verify actual granted scopes
          const response = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${account.access_token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (!response.ok) {
            console.error('Failed to verify GitHub scopes:', response.status);
            return true; // Continue sign in but log the error
          }

          const scopesHeader = response.headers.get('x-oauth-scopes') || '';
          const scopes = scopesHeader.split(',').map(s => s.trim()).filter(Boolean);
          
          console.log('GitHub OAuth Scopes:', {
            raw: scopesHeader,
            parsed: scopes,
            hasPrivateAccess: scopes.includes('repo')
          });

          // Store the verified scopes
          account.scope = scopesHeader;

          // Update user with actual scopes from GitHub
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              githubScope: scopesHeader,
              hasPrivateAccess: scopes.includes('repo'),
              lastScopeUpdate: new Date(),
            },
          });
        } catch (error) {
          console.error('Failed to verify GitHub scopes:', error);
        }
      }
      return true;
    },

    async jwt({ token, account, user }) {
      if (account) {
        const scopes = (account.scope || '').split(',').map(s => s.trim());
        token.accessToken = account.access_token;
        token.scope = account.scope;
        token.hasPrivateAccess = scopes.includes('repo');
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.scope = token.scope as string;
        session.user.hasPrivateAccess = token.hasPrivateAccess as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };