import { POST } from '../analyze/route';
import { getServerSession } from 'next-auth';
import { AnalysisPipeline } from '../../../lib/github/services/analysis-pipeline';
import type { AnalyzeRequest } from '../analyze/route';

// Mock next-auth
jest.mock('next-auth');
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock services
jest.mock('../../../lib/github/services/analysis-pipeline');

describe('Analyze API Route', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    githubToken: 'github-token-123'
  };

  const mockRequest = (body: Partial<AnalyzeRequest>) => 
    new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

  const mockAnalysisResult = {
    repositoryAnalysis: {
      metrics: {
        stars: 100,
        forks: 50,
        issues: 10,
        watchers: 75
      },
      techStack: ['TypeScript', 'React'],
    },
    prAnalysis: {
      changes: {
        files: 5,
        additions: 100,
        deletions: 50
      }
    },
    llmReports: {
      repository: {
        codeQuality: {
          score: 85,
          analysis: 'Good code quality',
          recommendations: ['Consider adding more tests']
        },
        security: {
          score: 90,
          vulnerabilities: [],
          recommendations: []
        },
        performance: {
          score: 88,
          analysis: 'Good performance',
          recommendations: []
        }
      },
      pr: {
        impact: {
          score: 75,
          analysis: 'Moderate impact'
        },
        codeQuality: {
          score: 80,
          analysis: 'Good quality',
          suggestions: []
        },
        testing: {
          coverage: 85,
          analysis: 'Good test coverage',
          suggestions: []
        },
        documentation: {
          score: 70,
          analysis: 'Documentation could be improved',
          suggestions: ['Add more inline comments']
        },
        samples: {
          improvements: []
        }
      }
    },
    errors: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful session
    mockGetServerSession.mockResolvedValue({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    // Setup default successful analysis
    (AnalysisPipeline as jest.Mock).mockImplementation(() => ({
      analyze: jest.fn().mockResolvedValue(mockAnalysisResult),
      close: jest.fn()
    }));
  });

  describe('Authentication', () => {
    it('should return 401 when no session exists', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);
      
      const response = await POST(mockRequest({
        owner: 'test-owner',
        repo: 'test-repo',
        prNumber: 1
      }));
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Unauthorized');
    });

    it('should return 401 when no GitHub token exists', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { ...mockUser, githubToken: null },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      
      const response = await POST(mockRequest({
        owner: 'test-owner',
        repo: 'test-repo',
        prNumber: 1
      }));
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toContain('GitHub token not found. Please reconnect your GitHub account.');
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid request body', async () => {
      const response = await POST(mockRequest({
        owner: '', // Invalid: empty string
        repo: 'test-repo',
        prNumber: 1
      }));
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Invalid request data');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await POST(mockRequest({
        owner: 'test-owner'
        // Missing repo and prNumber
      }));
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Invalid request data');
    });
  });

  describe('Analysis Pipeline', () => {
    it('should successfully analyze PR and return results', async () => {
      const response = await POST(mockRequest({
        owner: 'test-owner',
        repo: 'test-repo',
        prNumber: 1
      }));
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.repositoryAnalysis).toBeDefined();
      expect(data.data.prAnalysis).toBeDefined();
    });

    it('should handle analysis failures', async () => {
      (AnalysisPipeline as jest.Mock).mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
          errors: ['Analysis failed'],
          repositoryAnalysis: null,
          prAnalysis: null
        }),
        close: jest.fn()
      }));

      const response = await POST(mockRequest({
        owner: 'test-owner',
        repo: 'test-repo',
        prNumber: 1
      }));
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toContain('Analysis failed');
    });

    it('should handle GitHub API errors', async () => {
      (AnalysisPipeline as jest.Mock).mockImplementation(() => ({
        analyze: jest.fn().mockRejectedValue(new Error('Bad credentials')),
        close: jest.fn()
      }));

      const response = await POST(mockRequest({
        owner: 'test-owner',
        repo: 'test-repo',
        prNumber: 1
      }));
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toContain('GitHub token expired. Please reconnect your GitHub account.');
    });

    it('should handle rate limit errors', async () => {
      (AnalysisPipeline as jest.Mock).mockImplementation(() => ({
        analyze: jest.fn().mockRejectedValue(new Error('rate limit exceeded')),
        close: jest.fn()
      }));

      const response = await POST(mockRequest({
        owner: 'test-owner',
        repo: 'test-repo',
        prNumber: 1
      }));
      
      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errors).toContain('GitHub API rate limit exceeded. Please try again later.');
    });
  });
});
