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
};

type CustomSession = {
  expires: string;
  user?: CustomUser;
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
        params: {
          scope: 'read:user user:email repo'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const updatedToken = { ...token };
      
      if (user?.id) {
        updatedToken.id = user.id;
      }
      
      if (account?.access_token) {
        updatedToken.githubToken = account.access_token;
        try {
          // Store GitHub token during sign in
          const tokenId = updatedToken.id as string;
          await prisma.$executeRaw`
            UPDATE "User"
            SET "githubToken" = ${account.access_token}::text
            WHERE id = ${tokenId}::text
          `;
        } catch (error) {
          console.error('Error storing GitHub token:', error);
        }
      }
      
      return updatedToken;
    },
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        user: {
          id: token.id,
          name: token.name ?? null,
          email: token.email ?? null,
          image: token.picture ?? null,
          hasPrivateAccess: token.hasPrivateAccess ?? false,
          githubToken: token.githubToken ?? null
        }
      };
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  }
};
