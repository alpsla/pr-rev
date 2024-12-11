import { GitHubService } from '../../api';
import { createMockContext, setupSuccessfulMocks, setupRateLimitExceededMocks } from '../utils/mock-factory';
import { expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';

const createRateLimitResponse = (core: { limit: number; remaining: number; reset: number; used: number }) => ({
  resources: {
    core,
    search: {
      limit: 30,
      remaining: 30,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0
    },
    graphql: {
      limit: 5000,
      remaining: 5000,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0
    },
    integration_manifest: {
      limit: 5000,
      remaining: 5000,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0
    },
    code_scanning_upload: {
      limit: 500,
      remaining: 500,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0
    },
    actions_runner_registration: {
      limit: 10000,
      remaining: 10000,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0
    },
    scim: {
      limit: 15000,
      remaining: 15000,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0
    },
    dependency_snapshots: {
      limit: 100,
      remaining: 100,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0
    }
  },
  rate: {
    ...core,
    resource: 'core'
  }
});

describe('GitHubService - Rate Limit Handling', () => {
  const ctx = createMockContext();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Rate Limit Check', () => {
    it('should check rate limit before making requests', async () => {
      setupSuccessfulMocks(ctx);
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.rateLimit.get).toHaveBeenCalledTimes(1);
    });

    it('should wait when rate limit is about to reset', async () => {
      // Mock rate limit with 1 remaining request and reset time in 5 seconds
      const resetTime = Math.floor(Date.now() / 1000) + 5;
      ctx.octokit.rest.rateLimit.get.mockResolvedValueOnce({
        data: createRateLimitResponse({
          limit: 5000,
          remaining: 1,
          reset: resetTime,
          used: 4999
        }),
        status: 200,
        url: 'https://api.github.com/rate_limit',
        headers: {}
      });

      setupSuccessfulMocks(ctx);

      // Start the request
      const promise = service.getRepository(TEST_OWNER, TEST_REPO);

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);

      // Wait for the request to complete
      await promise;

      // Verify the delay occurred
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));
    });
  });

  describe('Rate Limit Retries', () => {
    it('should retry requests when rate limited with exponential backoff', async () => {
      // First attempt fails with rate limit
      setupRateLimitExceededMocks(ctx);

      // Second attempt succeeds
      const promise = service.getRepository(TEST_OWNER, TEST_REPO);

      // Should retry with exponential backoff (1000ms, 2000ms, 4000ms)
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(2000); // Second retry
      jest.advanceTimersByTime(4000); // Third retry

      await expect(promise).rejects.toThrow('API rate limit exceeded');

      // Verify retries occurred
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });

    it('should reset retry count after successful request', async () => {
      // First request succeeds
      setupSuccessfulMocks(ctx);
      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request hits rate limit
      setupRateLimitExceededMocks(ctx);
      const promise = service.getRepository(TEST_OWNER, TEST_REPO);

      // Should start retry count from 0 again
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(2000); // Second retry
      jest.advanceTimersByTime(4000); // Third retry

      await expect(promise).rejects.toThrow('API rate limit exceeded');

      // Verify all attempts were made
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(4); // 1 success + 3 retries
    });
  });

  describe('Rate Limit Error Handling', () => {
    it('should throw rate limit error after max retries', async () => {
      setupRateLimitExceededMocks(ctx);

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      );
    });

    it('should handle rate limit check failures gracefully', async () => {
      // Mock rate limit check failure
      ctx.octokit.rest.rateLimit.get.mockRejectedValueOnce(new Error('Failed to check rate limit'));

      // But allow the actual request to succeed
      setupSuccessfulMocks(ctx);

      // Should still complete the request
      const result = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result).toBeDefined();
    });

    it('should clear cache when rate limited', async () => {
      // First request succeeds and populates cache
      setupSuccessfulMocks(ctx);
      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request hits rate limit
      setupRateLimitExceededMocks(ctx);
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      );

      // Third request should try API again (not use cache)
      setupSuccessfulMocks(ctx);
      await service.getRepository(TEST_OWNER, TEST_REPO);

      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(5); // 1 success + 3 retries + 1 success
    });
  });
});
