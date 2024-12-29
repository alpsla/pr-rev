import { AnalysisPipeline } from '../analysis-pipeline';
import { GitHubPRAnalysisService } from '../pr-analysis';
import { GitHubRepositoryAnalysisService, type Dependency } from '../repository-analysis';
import { LLMService } from '../../../llm/llm-service';
import type { PRAnalysis } from '../../types/pr-analysis';
import type { RepositoryAnalysis } from '../../types/repository';

jest.mock('../pr-analysis');
jest.mock('../repository-analysis');
jest.mock('../../../llm/llm-service');

describe('Analysis Pipeline Integration', () => {
  let pipeline: AnalysisPipeline;
  let mockPRAnalysisService: jest.Mocked<GitHubPRAnalysisService>;
  let mockRepoAnalysisService: jest.Mocked<GitHubRepositoryAnalysisService>;
  let mockLLMService: jest.Mocked<LLMService>;

  const llmConfig = {
    model: 'test-model',
    temperature: 0.7,
    maxTokens: 2000,
    apiKey: 'test-key'
  };

  beforeEach(() => {
    mockPRAnalysisService = {
      analyzePR: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<GitHubPRAnalysisService>;

    mockRepoAnalysisService = {
      analyzeRepository: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<GitHubRepositoryAnalysisService>;

    mockLLMService = {
      generatePRReport: jest.fn(),
      generateRepositoryReport: jest.fn(),
    } as unknown as jest.Mocked<LLMService>;

    (LLMService as jest.Mock).mockImplementation(() => mockLLMService);

    pipeline = new AnalysisPipeline(
      mockPRAnalysisService,
      mockRepoAnalysisService,
      llmConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Full Analysis Flow', () => {
    const mockPRAnalysis: PRAnalysis = {
      id: 1,
      number: 1,
      title: 'Test PR',
      body: 'Test description',
      state: 'open',
      createdAt: '2023-12-27T00:00:00Z',
      updatedAt: '2023-12-27T01:00:00Z',
      closedAt: null,
      mergedAt: null,
      draft: false,
      user: null,
      diffAnalysis: {
        filesChanged: 3,
        additions: 100,
        deletions: 50,
        changedFiles: [],
        binaryFiles: 0,
        renamedFiles: 0
      },
      impactMetrics: {
        complexity: 7,
        risk: 5,
        testCoverage: 80,
        documentation: 90
      },
      reviewHistory: {
        approvalCount: 2,
        changesRequestedCount: 1,
        reviewers: ['reviewer1'],
        reviews: []
      },
      automatedChecks: {
        status: 'success',
        testResults: {
          passed: 100,
          failed: 0,
          skipped: 5,
          coverage: 80
        },
        lintingErrors: 0,
        securityIssues: 0
      }
    };

    const mockDependencies: Dependency[] = [
      { name: 'react', version: '^18.0.0', type: 'production' },
      { name: 'typescript', version: '^5.0.0', type: 'development' }
    ];

    // Raw analysis from repository service
    const mockRawRepoAnalysis = {
      id: 1,
      name: 'test-repo',
      fullName: 'owner/test-repo',
      description: 'Test repository',
      private: false,
      fork: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-12-27T00:00:00Z',
      pushedAt: '2023-12-27T00:00:00Z',
      size: 1000,
      defaultBranch: 'main',
      visibility: 'public',
      archived: false,
      disabled: false,
      metrics: {
        stars: 100,
        watchers: 75,
        forks: 50,
        issues: 10
      },
      techStack: ['TypeScript', 'React'],
      dependencies: mockDependencies
    };

    // Expected transformed repository analysis
    const expectedRepoAnalysis: RepositoryAnalysis = {
      id: '1',
      name: 'test-repo',
      fullName: 'owner/test-repo',
      description: 'Test repository',
      private: false,
      metrics: {
        stars: 100,
        watchers: 75,
        forks: 50,
        issues: 10,
        size: 1000,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-12-27T00:00:00Z',
        lastPushAt: '2023-12-27T00:00:00Z'
      },
      techStack: ['TypeScript', 'React'],
      defaultBranch: 'main',
      topics: [],
      hasWiki: true,
      hasIssues: true,
      hasProjects: true,
      hasDownloads: true,
      archived: false,
      disabled: false,
      visibility: 'public',
      license: null,
      language: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-12-27T00:00:00Z')
    };

    const mockPRReport = {
      impact: { score: 7, analysis: 'Medium impact changes' },
      codeQuality: { score: 8, analysis: 'Good code quality', suggestions: [] },
      testing: { coverage: 80, analysis: 'Good test coverage', suggestions: [] },
      documentation: { score: 9, analysis: 'Well documented', suggestions: [] },
      samples: { improvements: [] }
    };

    const mockRepoReport = {
      codeQuality: { score: 8, analysis: 'Good code quality', recommendations: [] },
      security: { score: 9, vulnerabilities: [], recommendations: [] },
      performance: { score: 7, analysis: 'Good performance', recommendations: [] }
    };

    it('should perform complete analysis with LLM reports', async () => {
      mockPRAnalysisService.analyzePR.mockResolvedValueOnce(mockPRAnalysis);
      mockRepoAnalysisService.analyzeRepository.mockResolvedValueOnce(mockRawRepoAnalysis);
      mockLLMService.generatePRReport.mockResolvedValueOnce(mockPRReport);
      mockLLMService.generateRepositoryReport.mockResolvedValueOnce(mockRepoReport);

      const result = await pipeline.analyze('owner', 'repo', 1);

      expect(result.prAnalysis).toBeDefined();
      expect(result.repositoryAnalysis).toBeDefined();
      expect(result.errors).toHaveLength(0);

      // Verify analysis data
      expect(result.prAnalysis).toEqual(mockPRAnalysis);
      expect(result.repositoryAnalysis).toEqual(expectedRepoAnalysis);

      // Verify LLM reports
      expect(result.llmReports.pr).toEqual(mockPRReport);
      expect(result.llmReports.repository).toEqual(mockRepoReport);

      // Verify service calls
      expect(mockPRAnalysisService.analyzePR).toHaveBeenCalledWith('owner', 'repo', 1);
      expect(mockRepoAnalysisService.analyzeRepository).toHaveBeenCalledWith('owner', 'repo');
      expect(mockLLMService.generatePRReport).toHaveBeenCalledWith(mockPRAnalysis);
      expect(mockLLMService.generateRepositoryReport).toHaveBeenCalledWith(expectedRepoAnalysis);
    });

    it('should handle LLM failures gracefully', async () => {
      mockPRAnalysisService.analyzePR.mockResolvedValueOnce(mockPRAnalysis);
      mockRepoAnalysisService.analyzeRepository.mockResolvedValueOnce(mockRawRepoAnalysis);
      mockLLMService.generatePRReport.mockRejectedValueOnce(new Error('LLM rate limit exceeded'));
      mockLLMService.generateRepositoryReport.mockRejectedValueOnce(new Error('LLM API error'));

      const result = await pipeline.analyze('owner', 'repo', 1);

      expect(result.prAnalysis).toBeDefined();
      expect(result.repositoryAnalysis).toBeDefined();
      expect(result.llmReports.pr).toBeNull();
      expect(result.llmReports.repository).toBeNull();
      expect(result.errors).toContain('Failed to generate PR report: LLM rate limit exceeded');
      expect(result.errors).toContain('Failed to generate repository report: LLM API error');

      // Verify analysis services were still called
      expect(mockPRAnalysisService.analyzePR).toHaveBeenCalled();
      expect(mockRepoAnalysisService.analyzeRepository).toHaveBeenCalled();
    });

    it('should handle GitHub API failures gracefully', async () => {
      mockPRAnalysisService.analyzePR.mockRejectedValueOnce(new Error('GitHub API error'));
      mockRepoAnalysisService.analyzeRepository.mockRejectedValueOnce(new Error('Rate limit exceeded'));

      const result = await pipeline.analyze('owner', 'repo', 1);

      expect(result.prAnalysis).toBeNull();
      expect(result.repositoryAnalysis).toBeNull();
      expect(result.llmReports.pr).toBeNull();
      expect(result.llmReports.repository).toBeNull();
      expect(result.errors).toContain('Failed to analyze PR');
      expect(result.errors).toContain('Failed to analyze repository');

      // Verify LLM services were not called
      expect(mockLLMService.generatePRReport).not.toHaveBeenCalled();
      expect(mockLLMService.generateRepositoryReport).not.toHaveBeenCalled();
    });

    it('should handle partial failures', async () => {
      mockPRAnalysisService.analyzePR.mockResolvedValueOnce(mockPRAnalysis);
      mockRepoAnalysisService.analyzeRepository.mockRejectedValueOnce(new Error('Not found'));
      mockLLMService.generatePRReport.mockResolvedValueOnce(mockPRReport);

      const result = await pipeline.analyze('owner', 'repo', 1);

      expect(result.prAnalysis).toBeDefined();
      expect(result.repositoryAnalysis).toBeNull();
      expect(result.llmReports.pr).toEqual(mockPRReport);
      expect(result.llmReports.repository).toBeNull();
      expect(result.errors).toContain('Failed to analyze repository');

      // Verify PR services were still called
      expect(mockLLMService.generatePRReport).toHaveBeenCalled();
      expect(mockLLMService.generateRepositoryReport).not.toHaveBeenCalled();
    });
  });

  describe('Service Lifecycle', () => {
    it('should close all services', async () => {
      pipeline.close();

      expect(mockPRAnalysisService.close).toHaveBeenCalled();
      expect(mockRepoAnalysisService.close).toHaveBeenCalled();
    });
  });
});
