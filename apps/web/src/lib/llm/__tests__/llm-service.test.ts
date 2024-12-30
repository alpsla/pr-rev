import { LLMService } from '../llm-service';
import { createDefaultAnalysis } from '../../github/types/repository';
import type { PRAnalysis } from '../../github/types/pr-analysis';
import type { LLMResponse, LLMRepositoryAnalysis, LLMPRAnalysis } from '../types/analysis';

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(() => {
    service = new LLMService();
  });

  describe('generateRepositoryReport', () => {
    it('should generate a repository report', async () => {
      const analysis = createDefaultAnalysis({
        id: 'test-repo-1',
        repositoryId: 'owner/test-repo',
        name: 'test-repo',
        fullName: 'owner/test-repo',
        description: 'A test repository',
        private: false,
        visibility: 'public',
        defaultBranch: 'main',
        archived: false,
        disabled: false,
        metrics: {
          stars: 100,
          forks: 50,
          issues: 10,
          watchers: 75,
        },
        techStack: ['TypeScript', 'React', 'Node.js'],
      });

      const response: LLMResponse<LLMRepositoryAnalysis> = await service.generateRepositoryReport(analysis, {
        model: 'test-model',
        requestId: 'test-request'
      });

      expect(response).toBeDefined();
      expect(response.analysis).toBeDefined();
      expect(response.analysis.summary).toBeDefined();
      expect(response.analysis.findings).toBeDefined();
      expect(response.analysis.findings.length).toBeGreaterThan(0);
      expect(response.analysis.recommendations).toBeDefined();
      expect(response.issues).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      const analysis = createDefaultAnalysis({
        id: 'test-repo-2',
        repositoryId: 'owner/test-repo',
        name: 'test-repo',
        fullName: 'owner/test-repo',
        description: null,
      });

      const response: LLMResponse<LLMRepositoryAnalysis> = await service.generateRepositoryReport(analysis, {
        model: 'test-model',
        requestId: 'test-request'
      });

      expect(response).toBeDefined();
      expect(response.analysis).toBeDefined();
      expect(response.issues).toBeDefined();
      expect(response.issues.length).toBeGreaterThan(0);
    });
  });

  describe('generatePRReport', () => {
    it('should generate a PR report', async () => {
      const prAnalysis: PRAnalysis = {
        id: 1,
        number: 1,
        title: 'Test PR',
        body: 'A test pull request',
        state: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mergedAt: null,
        closedAt: null,
        draft: false,
        author: {
          login: 'test-user',
          id: 1,
        },
        base: {
          ref: 'main',
          sha: 'base-sha',
        },
        head: {
          ref: 'feature',
          sha: 'head-sha',
        },
        changes: {
          files: 5,
          additions: 100,
          deletions: 50,
        },
        reviews: [],
        commits: [],
        labels: [],
        comments: [],
      };

      const response: LLMResponse<LLMPRAnalysis> = await service.generatePRReport(prAnalysis, {
        model: 'test-model',
        requestId: 'test-request'
      });

      expect(response).toBeDefined();
      expect(response.analysis).toBeDefined();
      expect(response.analysis.summary).toBeDefined();
      expect(response.analysis.findings).toBeDefined();
      expect(response.analysis.recommendations).toBeDefined();
      expect(response.issues).toHaveLength(0);
    });

    it('should handle errors in PR report generation', async () => {
      const prAnalysis: PRAnalysis = {
        id: 2,
        number: 2,
        title: '',
        body: null,
        state: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mergedAt: null,
        closedAt: null,
        draft: false,
        author: {
          login: 'test-user',
          id: 1,
        },
        base: {
          ref: 'main',
          sha: 'base-sha',
        },
        head: {
          ref: 'feature',
          sha: 'head-sha',
        },
        changes: {
          files: 0,
          additions: 0,
          deletions: 0,
        },
        reviews: [],
        commits: [],
        labels: [],
        comments: [],
      };

      const response: LLMResponse<LLMPRAnalysis> = await service.generatePRReport(prAnalysis, {
        model: 'test-model',
        requestId: 'test-request'
      });

      expect(response).toBeDefined();
      expect(response.analysis).toBeDefined();
      expect(response.issues).toBeDefined();
      expect(response.issues.length).toBeGreaterThan(0);
    });
  });
});
