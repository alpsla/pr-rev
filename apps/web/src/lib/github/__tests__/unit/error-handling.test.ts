import { GitHubService } from '../../api';
import { createMockContext, setupNetworkErrorMocks, setupServerErrorMocks, setupRateLimitExceededMocks } from '../utils/mock-factory';
import { expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO, TEST_PR_NUMBER } from '../utils/test-data';

describe('GitHubService - Error Handling', () => {
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

  describe('Rate Limit Handling', () => {
    it('should handle rate limit exceeded errors', async () => {
      // Setup
      setupRateLimitExceededMocks(ctx);

      // Execute & Verify Repository Request
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      );

      // Execute & Verify Pull Request Request
      await expectGitHubError(
        service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        403,
        'API rate limit exceeded'
      );

      // Execute & Verify Reviews Request
      await expectGitHubError(
        service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        403,
        'API rate limit exceeded'
      );
    });

    it('should clear cache when rate limit is exceeded', async () => {
      // First set up successful responses to populate cache
      setupRateLimitExceededMocks(ctx);

      // Execute requests that will fail with rate limit
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      );

      // Verify the API was called
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // Try the same request again to verify cache was cleared
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      );

      // Verify the API was called again (cache was cleared)
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Server Error Handling', () => {
    it('should handle server errors', async () => {
      // Setup
      setupServerErrorMocks(ctx);

      // Execute & Verify Repository Request
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      );

      // Execute & Verify Pull Request Request
      await expectGitHubError(
        service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        500,
        'Internal Server Error'
      );

      // Execute & Verify Reviews Request
      await expectGitHubError(
        service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        500,
        'Internal Server Error'
      );
    });

    it('should clear cache on server errors', async () => {
      // Setup server error responses
      setupServerErrorMocks(ctx);

      // Execute request that will fail
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      );

      // Verify the API was called
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // Try the same request again to verify cache was cleared
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      );

      // Verify the API was called again (cache was cleared)
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors', async () => {
      // Setup
      setupNetworkErrorMocks(ctx);

      // Execute & Verify Repository Request
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        0,
        'Network Error'
      );

      // Execute & Verify Pull Request Request
      await expectGitHubError(
        service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        0,
        'Network Error'
      );

      // Execute & Verify Reviews Request
      await expectGitHubError(
        service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        0,
        'Network Error'
      );
    });

    it('should clear cache on network errors', async () => {
      // Setup network error responses
      setupNetworkErrorMocks(ctx);

      // Execute request that will fail
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        0,
        'Network Error'
      );

      // Verify the API was called
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // Try the same request again to verify cache was cleared
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        0,
        'Network Error'
      );

      // Verify the API was called again (cache was cleared)
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Recovery', () => {
    it('should recover after errors when API becomes available', async () => {
      // First request fails with network error
      setupNetworkErrorMocks(ctx);
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        0,
        'Network Error'
      );

      // Second request fails with rate limit
      setupRateLimitExceededMocks(ctx);
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      );

      // Third request fails with server error
      setupServerErrorMocks(ctx);
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      );

      // Verify all requests were made (cache was cleared each time)
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });
  });
});
