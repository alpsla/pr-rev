import { verifyGitHubAccess, getGitHubTokenFromAccount } from '../../auth';
import { Account } from 'next-auth';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('GitHub Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console output during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('verifyGitHubAccess', () => {
    const mockHeaders = new Headers();

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('should verify access with private repo scope', async () => {
      mockHeaders.set('x-oauth-scopes', 'repo, user');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: mockHeaders,
      });

      const result = await verifyGitHubAccess('test-token');

      expect(result).toEqual({
        scope: 'repo, user',
        hasPrivateAccess: true
      });

      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/user', {
        headers: {
          'Authorization': 'Bearer test-token',
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
    });

    it('should verify access without private repo scope', async () => {
      mockHeaders.set('x-oauth-scopes', 'user');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: mockHeaders,
      });

      const result = await verifyGitHubAccess('test-token');

      expect(result).toEqual({
        scope: 'user',
        hasPrivateAccess: false
      });
    });

    it('should handle empty scopes', async () => {
      mockHeaders.delete('x-oauth-scopes');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: mockHeaders,
      });

      const result = await verifyGitHubAccess('test-token');

      expect(result).toEqual({
        scope: '',
        hasPrivateAccess: false
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(verifyGitHubAccess('invalid-token'))
        .rejects
        .toThrow('Failed to verify GitHub access');
    });
  });

  describe('getGitHubTokenFromAccount', () => {
    it('should get token data from GitHub account', () => {
      const account: Account = {
        provider: 'github',
        type: 'oauth',
        providerAccountId: '123',
        access_token: 'test-token',
        expires_at: 1234567890,
        refresh_token: 'test-refresh-token',
        scope: 'repo,user'
      };

      const result = getGitHubTokenFromAccount(account);

      expect(result).toEqual({
        accessToken: 'test-token',
        accessTokenExpires: 1234567890,
        refreshToken: 'test-refresh-token',
        scope: 'repo,user',
        hasPrivateAccess: true
      });
    });

    it('should handle account without repo scope', () => {
      const account: Account = {
        provider: 'github',
        type: 'oauth',
        providerAccountId: '123',
        access_token: 'test-token',
        expires_at: 1234567890,
        refresh_token: 'test-refresh-token',
        scope: 'user'
      };

      const result = getGitHubTokenFromAccount(account);

      expect(result).toEqual({
        accessToken: 'test-token',
        accessTokenExpires: 1234567890,
        refreshToken: 'test-refresh-token',
        scope: 'user',
        hasPrivateAccess: false
      });
    });

    it('should handle account without scope', () => {
      const account: Account = {
        provider: 'github',
        type: 'oauth',
        providerAccountId: '123',
        access_token: 'test-token',
        expires_at: 1234567890,
        refresh_token: 'test-refresh-token'
      };

      const result = getGitHubTokenFromAccount(account);

      expect(result).toEqual({
        accessToken: 'test-token',
        accessTokenExpires: 1234567890,
        refreshToken: 'test-refresh-token',
        scope: '',
        hasPrivateAccess: false
      });
    });

    it('should return null for non-GitHub account', () => {
      const account: Account = {
        provider: 'google',
        type: 'oauth',
        providerAccountId: '123',
        access_token: 'test-token'
      };

      const result = getGitHubTokenFromAccount(account);

      expect(result).toBeNull();
    });

    it('should return null for account without access token', () => {
      const account: Account = {
        provider: 'github',
        type: 'oauth',
        providerAccountId: '123'
      };

      const result = getGitHubTokenFromAccount(account);

      expect(result).toBeNull();
    });
  });
});
