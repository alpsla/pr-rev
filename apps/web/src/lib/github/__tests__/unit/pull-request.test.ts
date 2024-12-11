import { jest } from '@jest/globals';
import { GitHubService } from '../../api';
import { createMockContext, setupSuccessfulMocks, setupNotFoundErrorMocks, setupAuthenticationErrorMocks } from '../utils/mock-factory';
import { expectPullRequestData, expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO, TEST_PR_NUMBER } from '../utils/test-data';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';

type PullsListReviewsResponse = RestEndpointMethodTypes['pulls']['listReviews']['response'];

describe('GitHubService - Pull Request Operations', () => {
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

  describe('getPullRequest', () => {
    it('should fetch and transform pull request data', async () => {
      // Setup
      setupSuccessfulMocks(ctx);

      // Execute
      const result = await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Verify
      expectPullRequestData(result, {
        number: TEST_PR_NUMBER,
        title: ctx.responses.pullRequest.data.title,
        state: ctx.responses.pullRequest.data.state,
        mergeable: ctx.responses.pullRequest.data.mergeable,
        labels: ctx.responses.pullRequest.data.labels
      });

      // Verify API call
      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledWith({
        owner: TEST_OWNER,
        repo: TEST_REPO,
        pull_number: TEST_PR_NUMBER
      });
      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(1);
    });

    it('should use cached data for subsequent requests', async () => {
      // Setup
      setupSuccessfulMocks(ctx);

      // First request
      const result1 = await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      
      // Second request
      const result2 = await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Verify
      expect(result1).toEqual(result2);
      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(1);
    });

    it('should handle pull request not found', async () => {
      // Setup
      setupNotFoundErrorMocks(ctx);

      // Execute & Verify
      await expectGitHubError(
        service.getPullRequest(TEST_OWNER, TEST_REPO, 999),
        404,
        'Not Found'
      );
    });

    it('should handle authentication errors', async () => {
      // Setup
      setupAuthenticationErrorMocks(ctx);

      // Execute & Verify
      await expectGitHubError(
        service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        401,
        'Bad credentials'
      );
    });

    it('should clear cache on error', async () => {
      // Setup
      setupSuccessfulMocks(ctx);

      // First request succeeds
      await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Second request fails
      setupAuthenticationErrorMocks(ctx);
      await expectGitHubError(
        service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        401,
        'Bad credentials'
      );

      // Third request should hit the API again
      setupSuccessfulMocks(ctx);
      await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('getPullRequestReviews', () => {
    it('should fetch and transform pull request reviews', async () => {
      // Setup
      setupSuccessfulMocks(ctx);

      // Execute
      const result = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Verify
      expect(result).toHaveLength(1);
      const review = ctx.responses.pullRequestReview.data;
      expect(result[0]).toMatchObject({
        id: review.id,
        state: review.state,
        body: review.body,
        user: review.user && {
          login: review.user.login,
          type: review.user.type
        }
      });

      // Verify API call
      expect(ctx.octokit.rest.pulls.listReviews).toHaveBeenCalledWith({
        owner: TEST_OWNER,
        repo: TEST_REPO,
        pull_number: TEST_PR_NUMBER
      });
      expect(ctx.octokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);
    });

    it('should handle no reviews', async () => {
      // Setup
      setupSuccessfulMocks(ctx);
      const emptyResponse = {
        data: [],
        status: 200,
        url: ctx.responses.pullRequestReview.url,
        headers: {}
      } as unknown as PullsListReviewsResponse;
      
      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce(emptyResponse);

      // Execute
      const result = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Verify
      expect(result).toHaveLength(0);
    });

    it('should handle pull request not found for reviews', async () => {
      // Setup
      setupNotFoundErrorMocks(ctx);

      // Execute & Verify
      await expectGitHubError(
        service.getPullRequestReviews(TEST_OWNER, TEST_REPO, 999),
        404,
        'Not Found'
      );
    });
  });
});
