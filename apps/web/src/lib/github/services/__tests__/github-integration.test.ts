import { GitHubIntegrationService } from '../github-integration';
import { RateLimiter } from '../rate-limiter';

// Mock Octokit
type MockedOctokit = {
  pulls: {
    listReviews: jest.Mock;
    get: jest.Mock;
  };
  auth: jest.Mock;
};

// Test-specific type that exposes protected members
type TestGitHubService = GitHubIntegrationService & {
  octokit: MockedOctokit;
  rateLimiter: RateLimiter;
};

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    pulls: {
      listReviews: jest.fn(),
      get: jest.fn(),
    },
    auth: jest.fn().mockResolvedValue({ token: 'mocked-token' })
  }))
}));

jest.mock('../rate-limiter', () => ({
  RateLimiter: jest.fn().mockImplementation(() => ({
    executeWithRateLimit: jest.fn().mockImplementation((fn) => fn()),
    close: jest.fn()
  }))
}));

describe('GitHub Integration Service', () => {
  let githubService: TestGitHubService;
  const mockToken = 'test-token';
  const mockUserId = 'test-user';

  beforeEach(() => {
    jest.clearAllMocks();
    githubService = new GitHubIntegrationService(mockToken, mockUserId) as TestGitHubService;
  });

  afterEach(async () => {
    await githubService.close();
  });

  describe('PR Reviews', () => {
    it('should fetch PR reviews', async () => {
      const mockReview = {
        id: 1,
        node_id: 'node1',
        user: null,
        body: 'LGTM',
        state: 'APPROVED',
        html_url: 'https://github.com/owner/repo/pull/1#pullrequestreview-1',
        pull_request_url: 'https://api.github.com/repos/owner/repo/pulls/1',
        submitted_at: '2023-12-27T00:00:00Z',
        commit_id: 'abc123',
        _links: {
          html: { href: 'https://github.com/owner/repo/pull/1#pullrequestreview-1' },
          pull_request: { href: 'https://api.github.com/repos/owner/repo/pulls/1' }
        }
      };

      githubService.octokit.pulls.listReviews.mockResolvedValueOnce({
        data: [mockReview]
      });

      const reviews = await githubService.getPRReviews('owner', 'repo', 1);

      expect(reviews).toBeDefined();
      expect(reviews).toHaveLength(1);
      expect(reviews[0]).toEqual(mockReview);
      expect(githubService.octokit.pulls.listReviews).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1
      });
    });

    it('should handle empty reviews', async () => {
      githubService.octokit.pulls.listReviews.mockResolvedValueOnce({
        data: []
      });

      const reviews = await githubService.getPRReviews('owner', 'repo', 1);

      expect(reviews).toHaveLength(0);
    });

    it('should handle rate limiting', async () => {
      const mockOperation = jest.fn();
      await githubService.rateLimiter.executeWithRateLimit(mockOperation);

      expect(githubService.rateLimiter.executeWithRateLimit).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('API Error');
      githubService.octokit.pulls.listReviews.mockRejectedValueOnce(error);

      await expect(githubService.getPRReviews('owner', 'repo', 1))
        .rejects
        .toThrow('API Error');
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      githubService.rateLimiter.executeWithRateLimit.mockRejectedValueOnce(rateLimitError);

      await expect(githubService.getPRReviews('owner', 'repo', 1))
        .rejects
        .toThrow('Rate limit exceeded');
    });
  });

  describe('Cleanup', () => {
    it('should close rate limiter', async () => {
      await githubService.close();
      expect(githubService.rateLimiter.close).toHaveBeenCalled();
    });
  });
});
