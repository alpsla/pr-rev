import { GitHubService } from '../../api';
import { createMockContext, setupAuthenticationErrorMocks } from '../utils/mock-factory';
import { expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';
import { createMockRepositoryResponse } from '../utils/mock-responses';

describe('GitHubService - Authentication', () => {
  const ctx = createMockContext();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Authentication', () => {
    it('should successfully authenticate with valid token', async () => {
      // Mock successful authentication
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      const result = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
    });

    it('should handle invalid token', async () => {
      setupAuthenticationErrorMocks(ctx);

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );
    });

    it('should handle expired token', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      });

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Token expired'
      );
    });

    it('should handle token with insufficient permissions', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { message: 'Resource not accessible by integration' }
        }
      });

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'Resource not accessible by integration'
      );
    });
  });

  describe('Authentication State', () => {
    it('should maintain authentication state between requests', async () => {
      // First request succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request also succeeds without re-authentication
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, 'another-repo'),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/another-repo`,
        headers: {}
      });

      const result = await service.getRepository(TEST_OWNER, 'another-repo');
      expect(result).toBeDefined();
      expect(result.name).toBe('another-repo');
    });

    it('should handle authentication failure after successful requests', async () => {
      // First request succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request fails with auth error
      setupAuthenticationErrorMocks(ctx);

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );
    });
  });

  describe('Authentication Error Recovery', () => {
    it('should clear cache on authentication failure', async () => {
      // First request succeeds and populates cache
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request fails with auth error
      setupAuthenticationErrorMocks(ctx);

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );

      // Third request should try API again (not use cache)
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });

    it('should handle re-authentication after token refresh', async () => {
      // Initial request fails
      setupAuthenticationErrorMocks(ctx);

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );

      // Create new service with refreshed token
      service = new GitHubService(
        ctx.prisma,
        ctx.octokit,
        { type: 'token', credentials: { token: 'new-test-token' } }
      );

      // Request with new token succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      const result = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
    });
  });

  describe('Multiple Service Instances', () => {
    it('should maintain separate authentication states', async () => {
      // Create second service with different token
      const service2 = new GitHubService(
        ctx.prisma,
        ctx.octokit,
        { type: 'token', credentials: { token: 'test-token-2' } }
      );

      // First service succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second service fails
      setupAuthenticationErrorMocks(ctx);

      await expectGitHubError(
        service2.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );

      // First service should still work
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      const result = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
    });
  });
});
