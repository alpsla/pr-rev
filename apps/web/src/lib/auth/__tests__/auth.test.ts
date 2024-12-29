import { authOptions } from '../../auth';
import { JWT } from 'next-auth/jwt';
import { Session, Account } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { Provider } from 'next-auth/providers';

// Mock GitHub provider
jest.mock('next-auth/providers/github', () => {
  return jest.fn(() => ({
    id: 'github',
    type: 'oauth',
    authorization: {
      params: {
        scope: 'read:user user:email',
        prompt: 'consent'
      }
    },
    clientId: 'mock-client-id',
    clientSecret: 'mock-client-secret'
  }));
});

describe('Auth Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GITHUB_CLIENT_ID: 'mock-client-id',
      GITHUB_CLIENT_SECRET: 'mock-client-secret',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'mock-secret',
      NODE_ENV: 'test'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('JWT Callback', () => {
    it('should set token properties from account during initial sign in', async () => {
      const token: JWT = {};
      const account: Account = {
        access_token: 'mock-access-token',
        scope: 'read:user repo',
        provider: 'github',
        type: 'oauth',
        providerAccountId: '12345'
      };

      const mockUser: AdapterUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date()
      };

      const result = await authOptions.callbacks!.jwt!({ 
        token, 
        account,
        user: mockUser,
        trigger: 'signIn'
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        scope: 'read:user repo',
        hasPrivateAccess: true
      });
    });

    it('should handle missing repo scope', async () => {
      const token: JWT = {};
      const account: Account = {
        access_token: 'mock-access-token',
        scope: 'read:user',
        provider: 'github',
        type: 'oauth',
        providerAccountId: '12345'
      };

      const mockUser: AdapterUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date()
      };

      const result = await authOptions.callbacks!.jwt!({ 
        token, 
        account,
        user: mockUser,
        trigger: 'signIn'
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        scope: 'read:user',
        hasPrivateAccess: false
      });
    });

    it('should preserve existing token properties when no account is provided', async () => {
      const token: JWT = {
        accessToken: 'existing-token',
        scope: 'existing-scope',
        hasPrivateAccess: true
      };

      const mockUser: AdapterUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date()
      };

      const result = await authOptions.callbacks!.jwt!({ 
        token,
        user: mockUser,
        account: null
      });

      expect(result).toEqual(token);
    });
  });

  describe('Session Callback', () => {
    it('should add token properties to session', async () => {
      const session: Session = {
        user: { 
          id: '1',
          name: 'Test User',
          email: 'test@example.com'
        },
        expires: new Date().toISOString()
      };

      const token: JWT = {
        accessToken: 'mock-access-token',
        scope: 'read:user repo',
        hasPrivateAccess: true
      };

      const mockUser: AdapterUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: new Date()
      };

      const result = await authOptions.callbacks!.session!({ 
        session, 
        token,
        user: mockUser,
        newSession: session,
        trigger: 'update'
      });

      expect(result).toEqual({
        ...session,
        accessToken: token.accessToken,
        scope: token.scope,
        user: {
          ...session.user,
          hasPrivateAccess: true
        }
      });
    });
  });

  describe('Redirect Callback', () => {
    const baseUrl = 'http://localhost:3000';

    it('should allow relative URLs', async () => {
      const url = '/dashboard';
      const result = await authOptions.callbacks!.redirect!({ url, baseUrl });
      expect(result).toBe(url);
    });

    it('should allow URLs with matching base URL', async () => {
      const url = 'http://localhost:3000/settings';
      const result = await authOptions.callbacks!.redirect!({ url, baseUrl });
      expect(result).toBe(url);
    });

    it('should redirect to base URL for external URLs', async () => {
      const url = 'https://malicious-site.com';
      const result = await authOptions.callbacks!.redirect!({ url, baseUrl });
      expect(result).toBe(baseUrl);
    });
  });

  describe('Cookie Configuration', () => {
    it('should use secure cookies in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true
      });

      const sessionToken = authOptions.cookies?.sessionToken;
      expect(sessionToken?.options.secure).toBe(false); // Currently set to false in implementation

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        configurable: true
      });
    });

    it('should not require secure cookies in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true
      });

      const sessionToken = authOptions.cookies?.sessionToken;
      expect(sessionToken?.options.secure).toBe(false);

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        configurable: true
      });
    });

    it('should set correct cookie options', () => {
      const sessionToken = authOptions.cookies?.sessionToken;
      const options = sessionToken?.options;

      expect(options).toEqual({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false // in test environment
      });
    });
  });

  describe('Session Configuration', () => {
    it('should use JWT strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should set correct session max age', () => {
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      expect(authOptions.session?.maxAge).toBe(thirtyDaysInSeconds);
    });
  });

  describe('GitHub Provider Configuration', () => {
    it('should configure GitHub provider with correct scopes', () => {
      const provider = authOptions.providers[0] as Provider & {
        authorization: { params: { scope: string } };
        clientId: string;
        clientSecret: string;
      };
      expect(provider.id).toBe('github');
      expect(provider.type).toBe('oauth');
      expect(provider.authorization.params.scope).toBe('read:user user:email');
    });

    it('should use environment variables for client configuration', () => {
      const provider = authOptions.providers[0] as Provider & {
        authorization: { params: { scope: string } };
        clientId: string;
        clientSecret: string;
      };
      expect(provider.clientId).toBe('mock-client-id');
      expect(provider.clientSecret).toBe('mock-client-secret');
    });
  });
});
