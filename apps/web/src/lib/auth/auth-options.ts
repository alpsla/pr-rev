import { type NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../prisma';

type CustomUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  hasPrivateAccess?: boolean;
  githubToken?: string | null;
  accessToken?: string | null;
};

type CustomSession = {
  expires: string;
  user?: CustomUser;
  accessToken?: string | null;
};

type CustomJWT = {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
  hasPrivateAccess?: boolean;
  githubToken?: string | null;
};

declare module 'next-auth' {
  interface Session extends CustomSession {
    /** @internal */
    _type: 'session';
  }
  
  interface User extends CustomUser {
    /** @internal */
    _type: 'user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends CustomJWT {
    /** @internal */
    _type: 'jwt';
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      authorization: {
        url: 'https://github.com/login/oauth/authorize',
        params: {
          scope: 'read:user user:email repo',
          prompt: 'consent',
          response_type: 'code',
          access_type: 'offline'
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          hasPrivateAccess: true,
          _type: 'user'
        };
      }
    })
  ],
  debug: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  events: {
    signIn: ({ user, account, profile }) => {
      console.log('SignIn Event:', {
        userId: user.id,
        hasAccount: !!account,
        accountType: account?.type,
        provider: account?.provider,
        hasProfile: !!profile
      });
    },
    session: ({ session, token }) => {
      console.log('Session Event:', {
        hasUser: !!session?.user,
        hasToken: !!token,
        tokenKeys: token ? Object.keys(token) : []
      });
    }
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl });

      // If it's a review page URL, allow it
      if (url.includes('/review/')) {
        console.log('Allowing review page URL:', url);
        return url;
      }

      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        const absoluteUrl = `${baseUrl}${url}`;
        console.log('Converting relative URL to absolute:', absoluteUrl);
        return absoluteUrl;
      }

      // If it's already an absolute URL for our domain, allow it
      if (url.startsWith(baseUrl)) {
        console.log('Using absolute URL:', url);
        return url;
      }

      // Default to base URL
      console.log('Defaulting to base URL');
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      console.log('JWT Callback - Input:', { 
        hasToken: !!token,
        tokenKeys: token ? Object.keys(token) : [],
        hasUser: !!user,
        userKeys: user ? Object.keys(user) : [],
        hasAccount: !!account,
        accountKeys: account ? Object.keys(account) : [],
        scopes: account?.scope?.split(' ')
      });
      
      const updatedToken = { ...token };
      
      if (user?.id) {
        console.log('Setting user ID in token:', user.id);
        updatedToken.id = user.id;
      }
      
      if (account?.access_token) {
        console.log('Setting GitHub token in JWT', {
          tokenLength: account.access_token.length,
          hasScope: !!account.scope,
          provider: account.provider,
          type: account.type
        });
        
        updatedToken.githubToken = account.access_token;
        updatedToken.accessToken = account.access_token; // For backward compatibility
        
        try {
          // Store GitHub token during sign in
          const tokenId = updatedToken.id as string;
          console.log('Storing GitHub token in database for user:', tokenId);
          
          await prisma.$executeRaw`
            UPDATE "User"
            SET "githubToken" = ${account.access_token}::text
            WHERE id = ${tokenId}::text
          `;
          console.log('Successfully stored GitHub token in database');
        } catch (error) {
          console.error('Error storing GitHub token:', error);
        }
      }
      
      console.log('JWT Callback - Output:', {
        hasGithubToken: !!updatedToken.githubToken,
        hasAccessToken: !!updatedToken.accessToken,
        tokenKeys: Object.keys(updatedToken)
      });
      
      return updatedToken;
    },
    async session({ session, token }): Promise<CustomSession> {
      console.log('Session Callback - Input:', {
        hasSession: !!session,
        sessionKeys: session ? Object.keys(session) : [],
        hasToken: !!token,
        tokenKeys: token ? Object.keys(token) : [],
        hasUser: !!session?.user,
        userKeys: session?.user ? Object.keys(session.user) : []
      });
      
      if (session.user) {
        console.log('Updating session user with token data');
        session.user = {
          ...session.user,
          id: token.id,
          name: token.name ?? null,
          email: token.email ?? null,
          image: token.picture ?? null,
          hasPrivateAccess: token.hasPrivateAccess ?? false,
          githubToken: token.githubToken ?? null,
          accessToken: token.githubToken ?? null
        } as CustomUser;
      }
      
      // Set token at session level for backward compatibility
      if (token.githubToken) {
        console.log('Setting GitHub token at session level');
        session.accessToken = token.githubToken;
      }
      
      console.log('Session Callback - Output:', {
        hasGithubToken: !!session.user?.githubToken,
        hasAccessToken: !!session.accessToken,
        sessionKeys: Object.keys(session),
        userKeys: session.user ? Object.keys(session.user) : []
      });
      
      return session;
    }
  }
};
