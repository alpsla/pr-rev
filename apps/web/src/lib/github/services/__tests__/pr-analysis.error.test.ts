import { GitHubPRAnalysisService } from '../pr-analysis';

// Mock Octokit
type MockedOctokit = {
  pulls: {
    listReviews: jest.Mock;
    get: jest.Mock;
    listFiles: jest.Mock;
  };
  checks: {
    listForRef: jest.Mock;
  };
  auth: jest.Mock;
};

// Test-specific type that exposes protected members
type TestPRAnalysisService = GitHubPRAnalysisService & {
  octokit: MockedOctokit;
  rateLimiter: {
    executeWithRateLimit: jest.Mock;
    close: jest.Mock;
  };
};

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    pulls: {
      listReviews: jest.fn(),
      get: jest.fn(),
      listFiles: jest.fn(),
    },
    checks: {
      listForRef: jest.fn(),
    },
    auth: jest.fn().mockResolvedValue({ token: 'mocked-token' })
  }))
}));

jest.mock('../rate-limiter', () => ({
  RateLimiter: jest.fn().mockImplementation(() => ({
    executeWithRateLimit: jest.fn(fn => fn()),
    close: jest.fn()
  }))
}));

describe('PR Analysis Error Handling', () => {
  let prAnalysisService: TestPRAnalysisService;
  const mockToken = 'test-token';
  const mockUserId = 'test-user';

  beforeEach(() => {
    jest.clearAllMocks();
    prAnalysisService = new GitHubPRAnalysisService(mockToken, mockUserId) as TestPRAnalysisService;
  });

  afterEach(async () => {
    await prAnalysisService.close();
  });

  describe('API Errors', () => {
    it('should handle GitHub API errors', async () => {
      const error = new Error('API Error');
      prAnalysisService.octokit.pulls.get.mockRejectedValueOnce(error);
      prAnalysisService.octokit.pulls.listFiles.mockRejectedValueOnce(error);
      prAnalysisService.octokit.pulls.listReviews.mockRejectedValueOnce(error);

      await expect(prAnalysisService.analyzePR('owner', 'repo', 1))
        .rejects
        .toThrow('API Error');
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('API rate limit exceeded');
      prAnalysisService.octokit.pulls.get.mockRejectedValueOnce(rateLimitError);
      prAnalysisService.octokit.pulls.listFiles.mockRejectedValueOnce(rateLimitError);
      prAnalysisService.octokit.pulls.listReviews.mockRejectedValueOnce(rateLimitError);

      await expect(prAnalysisService.analyzePR('owner', 'repo', 1))
        .rejects
        .toThrow('API rate limit exceeded');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      prAnalysisService.octokit.pulls.get.mockRejectedValueOnce(networkError);
      prAnalysisService.octokit.pulls.listFiles.mockRejectedValueOnce(networkError);
      prAnalysisService.octokit.pulls.listReviews.mockRejectedValueOnce(networkError);

      await expect(prAnalysisService.analyzePR('owner', 'repo', 1))
        .rejects
        .toThrow('Network Error');
    });
  });

  describe('Data Validation', () => {
    it('should handle missing PR data', async () => {
      prAnalysisService.octokit.pulls.get.mockResolvedValueOnce({ data: null });

      await expect(prAnalysisService.analyzePR('owner', 'repo', 1))
        .rejects
        .toThrow('Failed to fetch PR data');
    });

    it('should handle invalid PR data', async () => {
      prAnalysisService.octokit.pulls.get.mockResolvedValueOnce({
        data: {
          // Missing required fields
          number: 1
        }
      });

      await expect(prAnalysisService.analyzePR('owner', 'repo', 1))
        .rejects
        .toThrow('Invalid PR data');
    });
  });

  describe('Cleanup', () => {
    it('should handle cleanup errors', async () => {
      const mockDisconnect = jest.fn().mockRejectedValueOnce(new Error('Cleanup error'));
      prAnalysisService.rateLimiter.close = mockDisconnect;

      await expect(prAnalysisService.close())
        .rejects
        .toThrow('Cleanup error');
    });
  });
});
