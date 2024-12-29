import { GET, POST } from '../github-permissions/route';
import { getServerSession } from 'next-auth';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('GitHub Permissions API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GITHUB_CLIENT_ID: 'mock-client-id',
      NEXTAUTH_URL: 'http://localhost:3000'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /api/settings/github-permissions', () => {
    it('should return 401 when no session exists', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET(new Request('http://localhost:3000/api/settings/github-permissions'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when session has no access token', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' }
      });

      const response = await GET(new Request('http://localhost:3000/api/settings/github-permissions'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should handle successful permissions check with private access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
        accessToken: 'valid-token'
      });

      // Mock user API response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: (name: string) => {
              const headers = {
                'x-oauth-scopes': 'repo,read:user',
                'x-ratelimit-remaining': '4999'
              };
              return headers[name] || null;
            },
            entries: () => {
              const headers = {
                'x-oauth-scopes': 'repo,read:user',
                'x-ratelimit-remaining': '4999'
              };
              return Object.entries(headers);
            }
          },
          json: () => Promise.resolve({
            login: 'testuser',
            type: 'User',
            total_private_repos: 5,
            plan: { name: 'pro' }
          })
        })
        // Mock repos API response
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: (name: string) => {
              const headers = {
                'x-ratelimit-remaining': '4998'
              };
              return headers[name] || null;
            },
            entries: () => {
              const headers = {
                'x-ratelimit-remaining': '4998'
              };
              return Object.entries(headers);
            }
          },
          json: () => Promise.resolve([{ id: 1, name: 'private-repo' }])
        });

      const response = await GET(new Request('http://localhost:3000/api/settings/github-permissions'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        hasPrivateAccess: true,
        totalPrivateRepos: 5,
        plan: 'pro',
        scopes: ['repo', 'read:user'],
        activePermissions: [
          'Full control of private repositories',
          'Read user profile data'
        ],
        currentAccess: {
          hasPrivateRepos: true,
          canAccessPrivateRepos: true
        },
        _debug: {
          userScopes: 'repo,read:user',
          privateReposStatus: 200,
          canListPrivateRepos: true,
          userType: 'User',
          rateLimits: {
            user: '4999',
            repos: '4998'
          }
        }
      });
    });

    it('should handle successful permissions check without private access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
        accessToken: 'valid-token'
      });

      // Mock user API response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: (name: string) => {
              const headers = {
                'x-oauth-scopes': 'read:user',
                'x-ratelimit-remaining': '4999'
              };
              return headers[name] || null;
            },
            entries: () => {
              const headers = {
                'x-oauth-scopes': 'read:user',
                'x-ratelimit-remaining': '4999'
              };
              return Object.entries(headers);
            }
          },
          json: () => Promise.resolve({
            login: 'testuser',
            type: 'User',
            total_private_repos: 0,
            plan: { name: 'free' }
          })
        })
        // Mock repos API response
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          headers: {
            get: (name: string) => {
              const headers = {
                'x-ratelimit-remaining': '4998'
              };
              return headers[name] || null;
            },
            entries: () => {
              const headers = {
                'x-ratelimit-remaining': '4998'
              };
              return Object.entries(headers);
            }
          },
          json: () => Promise.resolve({ message: 'Not authorized' })
        });

      const response = await GET(new Request('http://localhost:3000/api/settings/github-permissions'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        hasPrivateAccess: false,
        totalPrivateRepos: 0,
        plan: 'free',
        scopes: ['read:user'],
        activePermissions: ['Read user profile data'],
        currentAccess: {
          hasPrivateRepos: false,
          canAccessPrivateRepos: false
        },
        _debug: {
          userScopes: 'read:user',
          privateReposStatus: 403,
          canListPrivateRepos: false,
          userType: 'User',
          rateLimits: {
            user: '4999',
            repos: '4998'
          }
        }
      });
    });

    it('should handle GitHub API errors', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
        accessToken: 'valid-token'
      });

      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const response = await GET(new Request('http://localhost:3000/api/settings/github-permissions'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to check permissions' });
    });
  });

  describe('POST /api/settings/github-permissions', () => {
    it('should return 401 when no session exists', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await POST(new Request('http://localhost:3000/api/settings/github-permissions', {
        method: 'POST',
        body: JSON.stringify({ enablePrivateAccess: true })
      }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should generate correct auth URL for private access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' }
      });

      const response = await POST(new Request('http://localhost:3000/api/settings/github-permissions', {
        method: 'POST',
        body: JSON.stringify({ enablePrivateAccess: true })
      }));
      const data = await response.json();

      const expectedUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=mock-client-id` +
        `&scope=${encodeURIComponent('read:user user:email read:org repo')}` +
        `&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/callback/github')}`;

      expect(response.status).toBe(200);
      expect(data).toEqual({ url: expectedUrl });
    });

    it('should generate correct auth URL for basic access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' }
      });

      const response = await POST(new Request('http://localhost:3000/api/settings/github-permissions', {
        method: 'POST',
        body: JSON.stringify({ enablePrivateAccess: false })
      }));
      const data = await response.json();

      const expectedUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=mock-client-id` +
        `&scope=${encodeURIComponent('read:user user:email read:org')}` +
        `&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/callback/github')}`;

      expect(response.status).toBe(200);
      expect(data).toEqual({ url: expectedUrl });
    });

    it('should handle invalid JSON in request body', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' }
      });

      const response = await POST(new Request('http://localhost:3000/api/settings/github-permissions', {
        method: 'POST',
        body: 'invalid-json'
      }));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update permissions' });
    });
  });
});
