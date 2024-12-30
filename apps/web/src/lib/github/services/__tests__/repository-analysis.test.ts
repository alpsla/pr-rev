import { GitHubRepositoryAnalysisService, type RepositoryData, type LanguageData } from '../repository-analysis';
import { RateLimiter } from '../rate-limiter';

jest.mock('../rate-limiter');

type AsyncFunction<T> = () => Promise<T>;

describe('GitHubRepositoryAnalysisService', () => {
  let service: GitHubRepositoryAnalysisService;
  let mockRateLimiter: jest.Mocked<RateLimiter>;

  const mockToken = 'test-token';
  const mockUserId = 'test-user';

  beforeEach(() => {
    mockRateLimiter = {
      checkRateLimit: jest.fn().mockResolvedValue(undefined),
      executeWithRateLimit: jest.fn(),
      updateRateLimit: jest.fn().mockResolvedValue(undefined),
      getRemainingRequests: jest.fn().mockReturnValue(5000),
      getResetTime: jest.fn().mockReturnValue(new Date()),
      close: jest.fn().mockResolvedValue(undefined),
      isClosed: jest.fn().mockReturnValue(false)
    } as unknown as jest.Mocked<RateLimiter>;

    (RateLimiter as jest.Mock).mockImplementation(() => mockRateLimiter);

    service = new GitHubRepositoryAnalysisService(mockToken, mockUserId);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Repository Analysis', () => {
    const mockRepoData: RepositoryData = {
      id: 1,
      name: 'test-repo',
      full_name: 'owner/test-repo',
      description: 'Test repository',
      private: false,
      fork: false,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-12-27T00:00:00Z',
      pushed_at: '2023-12-27T00:00:00Z',
      size: 1000,
      stargazers_count: 100,
      watchers_count: 75,
      forks_count: 50,
      open_issues_count: 10,
      default_branch: 'main',
      visibility: 'public',
      archived: false,
      disabled: false
    };

    const mockLanguages: LanguageData = {
      TypeScript: 10000,
      JavaScript: 5000,
      CSS: 2000
    };

    beforeEach(() => {
      // Mock successful responses
      mockRateLimiter.executeWithRateLimit
        .mockImplementation(async (operation: AsyncFunction<unknown>) => {
          return operation();
        });
    });

    it('should analyze repository successfully', async () => {
      mockRateLimiter.executeWithRateLimit
        .mockImplementationOnce(async () => mockRepoData)
        .mockImplementationOnce(async () => mockLanguages);

      const result = await service.analyzeRepository('owner', 'test-repo');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('test-repo');
      expect(result.metrics).toEqual({
        stars: 100,
        watchers: 75,
        forks: 50,
        issues: 10
      });
      expect(result.techStack).toContain('TypeScript');
      expect(result.techStack).toContain('JavaScript');
    });

    it('should handle rate limit exceeded', async () => {
      // Reset all mocks to ensure clean state
      jest.clearAllMocks();
      
      // Mock rate limit error
      mockRateLimiter.executeWithRateLimit
        .mockRejectedValueOnce(new Error('Rate limit exceeded'));

      await expect(service.analyzeRepository('owner', 'test-repo'))
        .rejects
        .toThrow('Rate limit exceeded');
    });

    it('should handle GitHub API errors', async () => {
      mockRateLimiter.executeWithRateLimit
        .mockRejectedValueOnce(new Error('Not found'));

      await expect(service.analyzeRepository('owner', 'test-repo'))
        .rejects
        .toThrow('Not found');
    });

    it('should handle missing dependencies gracefully', async () => {
      mockRateLimiter.executeWithRateLimit
        .mockImplementationOnce(async () => mockRepoData)
        .mockImplementationOnce(async () => mockLanguages)
        .mockRejectedValueOnce(new Error('No package.json'));

      const result = await service.analyzeRepository('owner', 'test-repo');

      expect(result).toBeDefined();
      expect(result.dependencies).toBeUndefined();
      expect(result.techStack).toContain('TypeScript');
    });

    it('should handle private repositories', async () => {
      const privateRepoData = { ...mockRepoData, private: true, visibility: 'private' };
      mockRateLimiter.executeWithRateLimit
        .mockImplementationOnce(async () => privateRepoData)
        .mockImplementationOnce(async () => mockLanguages);

      const result = await service.analyzeRepository('owner', 'test-repo');

      expect(result).toBeDefined();
      expect(result.private).toBe(true);
      expect(result.visibility).toBe('private');
    });
  });

  describe('Service Lifecycle', () => {
    it('should close underlying services', async () => {
      await service.close();

      expect(mockRateLimiter.close).toHaveBeenCalled();
    });

    it('should handle close errors gracefully', async () => {
      mockRateLimiter.close.mockImplementation(async () => {
        throw new Error('Close error');
      });

      await expect(service.close())
        .rejects
        .toThrow('Close error');
    });
  });
});
