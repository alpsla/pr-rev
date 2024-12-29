import GithubProvider from 'next-auth/providers/github';
import type { Account, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AdapterUser } from 'next-auth/adapters';

// Mock user that satisfies AdapterUser type
const mockAdapterUser: AdapterUser = {
  id: 'mock-id',
  email: 'mock@example.com',
  emailVerified: null,
};

describe('Auth Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    // Save original env
    process.env = { ...originalEnv };
    // Clear specific env vars we want to test
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    // Restore original env after each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Provider Configuration', () => {
    it('should configure GitHub provider with correct credentials', () => {
      // Set env vars for this specific test
      process.env.GITHUB_CLIENT_ID = 'test-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';

      // Re-import to get fresh config with new env vars
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        const githubProvider = freshAuthOptions.providers[0] as ReturnType<typeof GithubProvider>;
        expect(githubProvider.id).toBe('github');
        expect(githubProvider.options?.clientId).toBe('test-client-id');
        expect(githubProvider.options?.clientSecret).toBe('test-client-secret');
      });
    });

    it('should request correct GitHub scopes', () => {
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        const githubProvider = freshAuthOptions.providers[0] as ReturnType<typeof GithubProvider>;
        const scope = (githubProvider.options?.authorization as { params: { scope: string } })?.params?.scope;
        expect(scope).toBe('read:user repo pull_request');
      });
    });
  });

  describe('JWT Callback', () => {
    it('should return unmodified token when no account or user provided', async () => {
      const token = { sub: '123', name: 'Test User' } as JWT;
      await jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        const result = await freshAuthOptions.callbacks!.jwt!({
          token,
          user: mockAdapterUser,
          account: null,
          trigger: 'signIn',
        });
        expect(result).toBe(token);
      });
    });

    it('should add GitHub-specific fields when account and user provided', async () => {
      const token = { sub: '123', name: 'Test User' } as JWT;
      await jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        const account = {
          access_token: 'test-access-token',
          providerAccountId: 'github-123',
          provider: 'github',
          type: 'oauth',
        } as Account;
        const user = { id: 'user-123', name: 'Test User' } as User;

        const result = await freshAuthOptions.callbacks!.jwt!({
          token,
          user,
          account,
          trigger: 'signIn',
        });

        expect(result).toEqual({
          ...token,
          accessToken: 'test-access-token',
          githubId: 'github-123',
          id: 'user-123',
        });
      });
    });
  });

  describe('Session Callback', () => {
    it('should add GitHub-specific fields to session', async () => {
      await jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        const session = {
          user: { 
            id: 'user-123',
            name: 'Test User', 
            email: 'test@example.com' 
          },
          expires: new Date().toISOString(),
        } as Session;
        const token = {
          name: 'Test User',
          id: 'user-123',
          githubId: 'github-123',
          accessToken: 'test-access-token',
        } as JWT;

        const result = await freshAuthOptions.callbacks!.session!({
          session,
          token,
          user: mockAdapterUser,
          trigger: 'update',
          newSession: session,
        });

        expect(result.user).toEqual({
          ...session.user,
          id: 'user-123',
          githubId: 'github-123',
          accessToken: 'test-access-token',
        });
      });
    });
  });

  describe('Pages Configuration', () => {
    it('should configure custom pages', () => {
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        expect(freshAuthOptions.pages).toEqual({
        signIn: '/auth/signin',
        error: '/auth/error',
        });
      });
    });
  });

  describe('Session Configuration', () => {
    it('should use JWT strategy', () => {
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        expect(freshAuthOptions.session?.strategy).toBe('jwt');
      });
    });

    it('should set correct session max age', () => {
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        expect(freshAuthOptions.session?.maxAge).toBe(30 * 24 * 60 * 60); // 30 days in seconds
      });
    });
  });

  describe('Secret Configuration', () => {
    it('should use JWT secret from environment', async () => {
      process.env.JWT_SECRET = 'test-jwt-secret';
      
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        expect(freshAuthOptions.secret).toBe('test-jwt-secret');
      });
    });

    it('should handle missing JWT secret', async () => {
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        expect(freshAuthOptions.secret).toBeUndefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing GitHub credentials', () => {
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;

      // Re-import to get fresh config with cleared env vars
      jest.isolateModules(async () => {
        const { authOptions: freshAuthOptions } = await import('../auth-config');
        const githubProvider = freshAuthOptions.providers[0] as ReturnType<typeof GithubProvider>;
        
        expect(githubProvider.options?.clientId).toBeUndefined();
        expect(githubProvider.options?.clientSecret).toBeUndefined();
      });
    });
  });
});
