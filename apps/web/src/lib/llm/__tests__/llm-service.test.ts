import { LLMService, type PRReport, type RepositoryReport } from '../llm-service';
import { PRAnalysis } from '../../github/types/pr-analysis';

describe('LLMService', () => {
  let llmService: LLMService;

  beforeEach(() => {
    llmService = new LLMService({
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
      maxTokens: 2000
    });
  });

  const mockPRAnalysis: PRAnalysis = {
    id: 123,
    number: 1,
    title: 'Test PR',
    body: 'Test description',
    state: 'open',
    createdAt: '2023-12-27T00:00:00Z',
    updatedAt: '2023-12-27T01:00:00Z',
    closedAt: null,
    mergedAt: null,
    draft: false,
    user: {
      login: 'testuser',
      id: 1,
      node_id: 'node1',
      avatar_url: 'https://github.com/testuser.png',
      gravatar_id: '',
      url: 'https://api.github.com/users/testuser',
      html_url: 'https://github.com/testuser',
      followers_url: 'https://api.github.com/users/testuser/followers',
      following_url: 'https://api.github.com/users/testuser/following{/other_user}',
      gists_url: 'https://api.github.com/users/testuser/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/testuser/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/testuser/subscriptions',
      organizations_url: 'https://api.github.com/users/testuser/orgs',
      repos_url: 'https://api.github.com/users/testuser/repos',
      events_url: 'https://api.github.com/users/testuser/events{/privacy}',
      received_events_url: 'https://api.github.com/users/testuser/received_events',
      type: 'User',
      site_admin: false
    },
    diffAnalysis: {
      filesChanged: 3,
      additions: 100,
      deletions: 50,
      changedFiles: [
        {
          sha: 'abc123',
          filename: 'src/test.ts',
          status: 'modified',
          additions: 50,
          deletions: 25,
          changes: 75,
          patch: '@@ -1,25 +1,50 @@\n test changes'
        },
        {
          sha: 'def456',
          filename: 'src/main.ts',
          status: 'modified',
          additions: 50,
          deletions: 25,
          changes: 75,
          patch: '@@ -1,25 +1,50 @@\n main changes'
        }
      ],
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
      reviewers: ['reviewer1', 'reviewer2'],
      reviews: [
        {
          id: 1,
          node_id: 'review1',
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
        }
      ]
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

  const mockRepoAnalysis = {
    metrics: {
      stars: 100,
      forks: 50,
      issues: 10,
      watchers: 75
    },
    techStack: ['TypeScript', 'React', 'Node.js']
  };

  describe('PR Analysis', () => {
    const mockPRReport: PRReport = {
      impact: { score: 7, analysis: 'Medium impact changes' },
      codeQuality: { score: 8, analysis: 'Good code quality', suggestions: [] },
      testing: { coverage: 80, analysis: 'Good test coverage', suggestions: [] },
      documentation: { score: 9, analysis: 'Well documented', suggestions: [] },
      samples: { improvements: [] }
    };

    it('should generate PR report successfully', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: JSON.stringify(mockPRReport) }]
        })
      });

      const result = await llmService.generatePRReport(mockPRAnalysis);

      expect(result).toEqual(mockPRReport);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-key',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('API rate limit exceeded'));

      await expect(llmService.generatePRReport(mockPRAnalysis))
        .rejects
        .toThrow('API rate limit exceeded');
    });

    it('should handle non-200 responses', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(llmService.generatePRReport(mockPRAnalysis))
        .rejects
        .toThrow('LLM API error: 429 Too Many Requests');
    });

    it('should handle malformed responses', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Not a JSON response' }]
        })
      });

      const result = await llmService.generatePRReport(mockPRAnalysis);

      // Should return default values when parsing fails
      expect(result).toEqual({
        impact: { score: 0, analysis: 'Failed to analyze impact' },
        codeQuality: { score: 0, analysis: 'Failed to analyze code quality', suggestions: [] },
        testing: { coverage: 0, analysis: 'Failed to analyze testing', suggestions: [] },
        documentation: { score: 0, analysis: 'Failed to analyze documentation', suggestions: [] },
        samples: { improvements: [] }
      });
    });
  });

  describe('Repository Analysis', () => {
    const mockRepoReport: RepositoryReport = {
      codeQuality: { score: 8, analysis: 'Good code quality', recommendations: [] },
      security: { score: 9, vulnerabilities: [], recommendations: [] },
      performance: { score: 7, analysis: 'Good performance', recommendations: [] }
    };

    it('should generate repository report successfully', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: JSON.stringify(mockRepoReport) }]
        })
      });

      const result = await llmService.generateRepositoryReport(mockRepoAnalysis);

      expect(result).toEqual(mockRepoReport);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-key',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('API rate limit exceeded'));

      await expect(llmService.generateRepositoryReport(mockRepoAnalysis))
        .rejects
        .toThrow('API rate limit exceeded');
    });

    it('should handle malformed responses', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Not a JSON response' }]
        })
      });

      const result = await llmService.generateRepositoryReport(mockRepoAnalysis);

      // Should return default values when parsing fails
      expect(result).toEqual({
        codeQuality: { score: 0, analysis: 'Failed to analyze code quality', recommendations: [] },
        security: { score: 0, vulnerabilities: [], recommendations: [] },
        performance: { score: 0, analysis: 'Failed to analyze performance', recommendations: [] }
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should support old analyzePR method', async () => {
      const mockReport = {
        impact: { score: 7, analysis: 'Medium impact changes' },
        codeQuality: { score: 8, analysis: 'Good code quality', suggestions: [] },
        testing: { coverage: 80, analysis: 'Good test coverage', suggestions: [] },
        documentation: { score: 9, analysis: 'Well documented', suggestions: [] },
        samples: { improvements: [] }
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: JSON.stringify(mockReport) }]
        })
      });

      const result = await llmService.analyzePR(mockPRAnalysis);
      expect(result).toEqual(mockReport);
    });

    it('should support old analyzeRepository method', async () => {
      const mockReport = {
        codeQuality: { score: 8, analysis: 'Good code quality', recommendations: [] },
        security: { score: 9, vulnerabilities: [], recommendations: [] },
        performance: { score: 7, analysis: 'Good performance', recommendations: [] }
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: JSON.stringify(mockReport) }]
        })
      });

      const result = await llmService.analyzeRepository(mockRepoAnalysis);
      expect(result).toEqual(mockReport);
    });
  });
});
