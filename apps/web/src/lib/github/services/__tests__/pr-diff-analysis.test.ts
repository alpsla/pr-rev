import { GitHubPRAnalysisService } from '../pr-analysis';

// Mock Octokit
type MockedOctokit = {
  pulls: {
    listReviews: jest.Mock;
    get: jest.Mock;
    listFiles: jest.Mock;
    listCommits: jest.Mock;
  };
  auth: jest.Mock;
};

// Mock RateLimiter
type MockedRateLimiter = {
  executeWithRateLimit: jest.Mock;
  close: jest.Mock;
};

// Test-specific type that exposes protected members
type TestPRAnalysisService = GitHubPRAnalysisService & {
  octokit: MockedOctokit;
  rateLimiter: MockedRateLimiter;
};

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    pulls: {
      listReviews: jest.fn(),
      get: jest.fn(),
      listFiles: jest.fn(),
      listCommits: jest.fn(),
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

describe('PR Diff Analysis', () => {
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

  describe('Large Diffs', () => {
    it('should handle PRs with many files', async () => {
      const mockFiles = Array.from({ length: 100 }, (_, i) => ({
        sha: `sha${i}`,
        filename: `file${i}.ts`,
        status: 'modified',
        additions: 10,
        deletions: 5,
        changes: 15,
        patch: '@@ -1,5 +1,10 @@\n some code changes'
      }));

      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: mockFiles
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(100);
      expect(analysis.diffAnalysis.additions).toBe(1000);
      expect(analysis.diffAnalysis.deletions).toBe(500);
    });

    it('should handle PRs with large file changes', async () => {
      const mockFiles = [{
        sha: 'sha1',
        filename: 'large-file.ts',
        status: 'modified',
        additions: 1000,
        deletions: 500,
        changes: 1500,
        patch: '@@ -1,500 +1,1000 @@\n large code changes'
      }];

      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: mockFiles
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(1);
      expect(analysis.diffAnalysis.additions).toBe(1000);
      expect(analysis.diffAnalysis.deletions).toBe(500);
    });
  });

  describe('Binary Files', () => {
    it('should handle binary file additions', async () => {
      const mockFiles = [{
        sha: 'sha1',
        filename: 'image.png',
        status: 'added',
        additions: 0,
        deletions: 0,
        changes: 0
      }];

      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: mockFiles
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(1);
      expect(analysis.diffAnalysis.binaryFiles).toBe(1);
    });

    it('should handle mixed binary and text files', async () => {
      const mockFiles = [
        {
          sha: 'sha1',
          filename: 'image.png',
          status: 'added',
          additions: 0,
          deletions: 0,
          changes: 0
        },
        {
          sha: 'sha2',
          filename: 'code.ts',
          status: 'modified',
          additions: 10,
          deletions: 5,
          changes: 15,
          patch: '@@ -1,5 +1,10 @@\n some code changes'
        }
      ];

      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: mockFiles
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(2);
      expect(analysis.diffAnalysis.binaryFiles).toBe(1);
      expect(analysis.diffAnalysis.additions).toBe(10);
      expect(analysis.diffAnalysis.deletions).toBe(5);
    });
  });

  describe('File Renames', () => {
    it('should handle file renames', async () => {
      const mockFiles = [{
        sha: 'sha1',
        filename: 'new-name.ts',
        previous_filename: 'old-name.ts',
        status: 'renamed',
        additions: 0,
        deletions: 0,
        changes: 0
      }];

      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: mockFiles
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(1);
      expect(analysis.diffAnalysis.renamedFiles).toBe(1);
    });

    it('should handle rename with modifications', async () => {
      const mockFiles = [{
        sha: 'sha1',
        filename: 'new-name.ts',
        previous_filename: 'old-name.ts',
        status: 'renamed',
        additions: 5,
        deletions: 3,
        changes: 8,
        patch: '@@ -1,3 +1,5 @@\n modified after rename'
      }];

      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: mockFiles
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(1);
      expect(analysis.diffAnalysis.renamedFiles).toBe(1);
      expect(analysis.diffAnalysis.additions).toBe(5);
      expect(analysis.diffAnalysis.deletions).toBe(3);
    });
  });

  describe('Empty Changes', () => {
    it('should handle PRs with no file changes', async () => {
      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: []
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(0);
      expect(analysis.diffAnalysis.additions).toBe(0);
      expect(analysis.diffAnalysis.deletions).toBe(0);
    });

    it('should handle files with no content changes', async () => {
      const mockFiles = [{
        sha: 'sha1',
        filename: 'unchanged.ts',
        status: 'modified',
        additions: 0,
        deletions: 0,
        changes: 0
      }];

      prAnalysisService.octokit.pulls.listFiles.mockResolvedValueOnce({
        data: mockFiles
      });

      const analysis = await prAnalysisService.analyzePR('owner', 'repo', 1);

      expect(analysis.diffAnalysis.filesChanged).toBe(1);
      expect(analysis.diffAnalysis.additions).toBe(0);
      expect(analysis.diffAnalysis.deletions).toBe(0);
    });
  });
});
