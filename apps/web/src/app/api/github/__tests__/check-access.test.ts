import { POST } from '../check-access/route';
import { getServerSession } from 'next-auth';
import { createMockOctokit } from '../../../../lib/github/__tests__/mocks/github';
import { mockDeep } from 'jest-mock-extended';
import type { RestEndpointMethodTypes } from '@octokit/rest';

type RepoResponse = RestEndpointMethodTypes['repos']['get']['response'];
type PullResponse = RestEndpointMethodTypes['pulls']['get']['response'];

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

// Mock Octokit
const mockOctokit = createMockOctokit();
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(() => mockOctokit)
}));

describe('Check Access API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (url: string) => {
    return new Request('http://localhost:3000/api/github/check-access', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  };

  describe('Authentication', () => {
    it('should return 401 when no session exists', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Unauthorized - No access token'
      });
    });

    it('should return 401 when session has no access token', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { name: 'Test User' }
      });

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Unauthorized - No access token'
      });
    });

    it('should return 401 when token is expired', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        error: 'RefreshAccessTokenError',
        user: { name: 'Test User' },
        accessToken: 'expired-token'
      });

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Token expired',
        needsReauth: true,
        message: 'Your session has expired. Please sign in again.'
      });
    });
  });

  describe('URL Validation', () => {
    it('should return 400 when no URL is provided', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'valid-token'
      });

      const response = await POST(mockRequest(''));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'URL is required'
      });
    });

    it('should return 400 for invalid GitHub URL', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'valid-token'
      });

      const response = await POST(mockRequest('https://invalid-url.com'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid GitHub URL format'
      });
    });
  });

  describe('Repository Access', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'valid-token',
        user: {
          name: 'Test User',
          hasPrivateAccess: true
        }
      });
    });

    it('should handle public repositories', async () => {
      const repoResponse: RepoResponse = {
        data: mockDeep<RepoResponse['data']>({
          private: false,
          permissions: { pull: true }
        }),
        status: 200,
        url: 'https://api.github.com/repos/owner/repo',
        headers: {
          'content-type': 'application/json'
        }
      };

      const pullResponse: PullResponse = {
        data: mockDeep<PullResponse['data']>({
          number: 123,
          state: 'open',
          draft: false
        }),
        status: 200,
        url: 'https://api.github.com/repos/owner/repo/pulls/123',
        headers: {
          'content-type': 'application/json'
        }
      };

      mockOctokit.repos.get.mockResolvedValue(repoResponse);
      mockOctokit.pulls.get.mockResolvedValue(pullResponse);

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        needsAccess: false
      });
    });

    it('should handle private repositories with access', async () => {
      const repoResponse: RepoResponse = {
        data: mockDeep<RepoResponse['data']>({
          private: true,
          permissions: { pull: true }
        }),
        status: 200,
        url: 'https://api.github.com/repos/owner/repo',
        headers: {
          'content-type': 'application/json'
        }
      };

      const pullResponse: PullResponse = {
        data: mockDeep<PullResponse['data']>({
          number: 123,
          state: 'open',
          draft: false
        }),
        status: 200,
        url: 'https://api.github.com/repos/owner/repo/pulls/123',
        headers: {
          'content-type': 'application/json'
        }
      };

      mockOctokit.repos.get.mockResolvedValue(repoResponse);
      mockOctokit.pulls.get.mockResolvedValue(pullResponse);

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        needsAccess: false
      });
    });

    it('should handle private repositories without access', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'valid-token',
        user: {
          name: 'Test User',
          hasPrivateAccess: false
        }
      });

      const repoResponse: RepoResponse = {
        data: mockDeep<RepoResponse['data']>({
          private: true,
          permissions: { pull: true }
        }),
        status: 200,
        url: 'https://api.github.com/repos/owner/repo',
        headers: {
          'content-type': 'application/json'
        }
      };

      mockOctokit.repos.get.mockResolvedValue(repoResponse);

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        needsAccess: true,
        isPrivate: true,
        message: 'This is a private repository. Please configure private repository access in Settings to continue.'
      });
    });

    it('should handle repository not found', async () => {
      mockOctokit.repos.get.mockRejectedValue(new Error('Not Found'));

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        needsAccess: true,
        isPrivate: true,
        message: 'Unable to access this repository. Please verify the URL and your permissions.'
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'valid-token',
        user: {
          name: 'Test User',
          hasPrivateAccess: true
        }
      });
    });

    it('should handle JSON parsing errors', async () => {
      const invalidRequest = new Request('http://localhost:3000/api/github/check-access', {
        method: 'POST',
        body: 'invalid-json'
      });

      const response = await POST(invalidRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to check repository access'
      });
    });

    it('should handle unexpected errors', async () => {
      mockOctokit.repos.get.mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(mockRequest('https://github.com/owner/repo/pull/123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to check repository access'
      });
    });
  });
});
