import { GitHubService } from '../../api';
import { createMockContext, setupSuccessfulMocks } from '../utils/mock-factory';
import { TEST_OWNER, TEST_REPO, TEST_PR_NUMBER } from '../utils/test-data';
import { createMockRepositoryResponse } from '../utils/mock-responses';

describe('GitHubService - Caching Behavior', () => {
  const ctx = createMockContext();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
    setupSuccessfulMocks(ctx);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Key Generation', () => {
    it('should generate unique cache keys for different owners', async () => {
      await service.getRepository(TEST_OWNER, TEST_REPO);
      await service.getRepository('different-owner', TEST_REPO);

      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });

    it('should generate unique cache keys for different repositories', async () => {
      await service.getRepository(TEST_OWNER, TEST_REPO);
      await service.getRepository(TEST_OWNER, 'different-repo');

      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });

    it('should generate unique cache keys for different pull requests', async () => {
      await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER + 1);

      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Hit Behavior', () => {
    it('should use cached data for repeated repository requests', async () => {
      const result1 = await service.getRepository(TEST_OWNER, TEST_REPO);
      const result2 = await service.getRepository(TEST_OWNER, TEST_REPO);

      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should use cached data for repeated pull request requests', async () => {
      const result1 = await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      const result2 = await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should use cached data for repeated review requests', async () => {
      const result1 = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      const result2 = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      expect(ctx.octokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe('Cache Invalidation', () => {
    it('should clear all caches on destroy', async () => {
      // Populate caches
      await service.getRepository(TEST_OWNER, TEST_REPO);
      await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Verify initial API calls
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(1);
      expect(ctx.octokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);

      // Destroy service
      await service.destroy();

      // Make same requests again
      await service.getRepository(TEST_OWNER, TEST_REPO);
      await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Verify APIs were called again
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(2);
      expect(ctx.octokit.rest.pulls.listReviews).toHaveBeenCalledTimes(2);
    });

    it('should maintain cache isolation between service instances', async () => {
      // Create second service instance
      const service2 = new GitHubService(
        ctx.prisma,
        ctx.octokit,
        { type: 'token', credentials: { token: 'test-token-2' } }
      );

      // Use first service
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // Use second service
      await service2.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);

      // Clear first service cache
      await service.destroy();

      // Second service cache should still be valid
      await service2.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Edge Cases', () => {
    it('should not cache error responses', async () => {
      // First request fails
      ctx.octokit.rest.repos.get.mockRejectedValueOnce(new Error('API Error'));
      await expect(service.getRepository(TEST_OWNER, TEST_REPO)).rejects.toThrow();

      // Second request succeeds
      setupSuccessfulMocks(ctx);
      const result = await service.getRepository(TEST_OWNER, TEST_REPO);

      expect(result).toBeDefined();
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent requests for same data', async () => {
      // Make multiple concurrent requests
      const requests = Promise.all([
        service.getRepository(TEST_OWNER, TEST_REPO),
        service.getRepository(TEST_OWNER, TEST_REPO),
        service.getRepository(TEST_OWNER, TEST_REPO)
      ]);

      const results = await requests;

      // Should only make one API call
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // All results should be identical
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });

    it('should handle null values in cached data', async () => {
      // Mock response with null values
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          ...createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
          description: null,
          homepage: null,
          license: null,
          mirror_url: null
        },
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      // First request
      const result1 = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result1.description).toBeNull();

      // Second request should use cached data
      const result2 = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result2.description).toBeNull();
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string values in cached data', async () => {
      // Mock response with empty strings
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
    data: {
      ...createMockRepositoryResponse(TEST_OWNER, TEST_REPO), // Use your existing function
      description: null,
      homepage: null,
      license: null,
      mirror_url: null
    },
    status: 200,
    url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
    headers: {}
  });

      // First request
      const result1 = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result1.description).toBe('');
      expect(result1.language).toBe('');

      // Second request should use cached data
      const result2 = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result2.description).toBe('');
      expect(result2.language).toBe('');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });
  });
});
