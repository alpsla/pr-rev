import type { NextAuthOptions } from "next-auth";
import type { Session, User, Account } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../prisma';

interface CustomSession extends Session {
  scope?: string;
  hasPrivateAccess?: boolean;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      hasPrivateAccess?: boolean;
      githubToken?: string | null;
      scope?: string | null;
    }
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    hasPrivateAccess?: boolean;
    githubToken?: string | null;
    scope?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    hasPrivateAccess?: boolean;
    githubToken?: string | null;
    scope?: string | undefined;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          scope: "repo read:user user:email",
          prompt: "consent",
          response_type: "code"
        }
      }
    })
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      console.log('[Auth] Redirect callback:', { url, baseUrl });

      // If it's a review page URL, allow it
      if (url.includes('/review/')) {
        console.log('[Auth] Allowing review page URL:', url);
        // If it's a relative URL, make it absolute
        if (url.startsWith('/')) {
          const currentUrl = typeof window !== 'undefined'
            ? window.location.origin
            : baseUrl;
          const absoluteUrl = `${currentUrl}${url}`;
          console.log('[Auth] Converting review URL to absolute:', absoluteUrl);
          return absoluteUrl;
        }
        return url;
      }

      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        const currentUrl = typeof window !== 'undefined'
          ? window.location.origin
          : baseUrl;
        const absoluteUrl = `${currentUrl}${url}`;
        console.log('[Auth] Converting relative URL to absolute:', absoluteUrl);
        return absoluteUrl;
      }

      // If it's already an absolute URL for our domain, allow it
      if (url.includes('localhost')) {
        console.log('[Auth] Using absolute URL:', url);
        return url;
      }

      // Default to current URL
      const currentUrl = typeof window !== 'undefined'
        ? window.location.origin
        : baseUrl;
      console.log('[Auth] Defaulting to current URL:', currentUrl);
      return currentUrl;
    },
    async jwt({ token, user, account, trigger, session }: { 
      token: JWT;
      user: User | AdapterUser | undefined;
      account: Account | null;
      trigger?: "signIn" | "signUp" | "update";
      session?: CustomSession;
    }) {
      console.log('[Auth] JWT Callback:', { 
        trigger,
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account,
        accountScope: account?.scope,
        tokenScope: token?.scope,
        isInitialSignIn: !!account,
        sessionScope: session?.scope
      });
      
      // Initial sign in
      if (account && user) {
        console.log('[Auth] Initial sign in, setting token data:', {
          accessToken: !!account.access_token,
          scope: account.scope,
          hasPrivateAccess: account.scope?.includes('repo')
        });

        // Update token with GitHub data
        token.githubToken = account.access_token;
        token.scope = account.scope;
        token.hasPrivateAccess = account.scope?.includes('repo') ?? false;
        
        try {
          // Store GitHub token during sign in
          console.log('[Auth] Storing GitHub token in database');
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              githubToken: account.access_token
            }
          });

          // Store scope in Account table since it's part of the OAuth data
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId
              }
            },
            data: {
              scope: account.scope
            }
          });

          console.log('[Auth] Successfully stored GitHub token and scope');
        } catch (error) {
          console.error('[Auth] Error storing GitHub token:', error);
        }
      }

      // If no token exists yet, try to load from database
      if (!token.githubToken && user?.id) {
        console.log('[Auth] No token in session, checking database');
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              accounts: {
                where: { provider: 'github' },
                select: { scope: true }
              }
            }
          });

          if (dbUser?.githubToken) {
            console.log('[Auth] Found token in database, restoring to session');
            token.githubToken = dbUser.githubToken;
            // Convert null to undefined for scope
            token.scope = dbUser.accounts[0]?.scope ?? undefined;
            token.hasPrivateAccess = token.scope?.includes('repo') ?? false;
          }
        } catch (error) {
          console.error('[Auth] Error loading token from database:', error);
        }
      }

      // Update token if session is updated
      if (trigger === 'update' && session) {
        console.log('[Auth] Session update, updating token:', {
          oldScope: token.scope,
          newScope: session.scope,
          oldPrivateAccess: token.hasPrivateAccess,
          newPrivateAccess: session.hasPrivateAccess
        });
        token.scope = session.scope;
        token.hasPrivateAccess = session.hasPrivateAccess;
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('[Auth] Session Callback:', {
        hasSession: !!session,
        hasToken: !!token,
        hasUser: !!session?.user,
        tokenScope: token?.scope,
        tokenPrivateAccess: token?.hasPrivateAccess,
        tokenGithubToken: !!token?.githubToken
      });
      
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.image = token.picture ?? null;
        session.user.hasPrivateAccess = token.hasPrivateAccess ?? false;
        session.user.githubToken = token.githubToken ?? null;
        session.user.scope = token.scope ?? null;
      }
      
      console.log('[Auth] Session updated:', {
        hasGithubToken: !!session.user?.githubToken,
        scope: session.user?.scope,
        hasPrivateAccess: session.user?.hasPrivateAccess
      });
      
      return session;
    }
  }
};
