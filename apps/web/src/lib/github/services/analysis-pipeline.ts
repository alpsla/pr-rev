import { GitHubPRAnalysisService } from './pr-analysis';
import { GitHubRepositoryAnalysisService } from './repository-analysis';
import { LLMService, type RepositoryReport, type PRReport } from '../../llm/llm-service';
import type { RepositoryAnalysis } from '../types/repository';
import type { PRAnalysis } from '../types/pr-analysis';

export interface AnalysisResult {
  repositoryAnalysis: RepositoryAnalysis | null;
  prAnalysis: PRAnalysis | null;
  llmReports: {
    repository: RepositoryReport | null;
    pr: PRReport | null;
  };
  errors: string[];
}

export class AnalysisPipeline {
  private prAnalysisService: GitHubPRAnalysisService;
  private repoAnalysisService: GitHubRepositoryAnalysisService;
  private llmService: LLMService;

  constructor(
    prAnalysisService: GitHubPRAnalysisService,
    repoAnalysisService: GitHubRepositoryAnalysisService,
    llmConfig?: {
      model: string;
      temperature: number;
      maxTokens: number;
      apiKey: string;
    }
  ) {
    this.prAnalysisService = prAnalysisService;
    this.repoAnalysisService = repoAnalysisService;
    
    // Initialize LLM service with default config if not provided
    this.llmService = new LLMService(llmConfig ?? {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      apiKey: process.env.OPENAI_API_KEY ?? ''
    });
  }

  async analyze(owner: string, repo: string, prNumber: number): Promise<AnalysisResult> {
    const errors: string[] = [];
    let repositoryAnalysis: RepositoryAnalysis | null = null;
    let prAnalysis: PRAnalysis | null = null;
    let repositoryReport: RepositoryReport | null = null;
    let prReport: PRReport | null = null;

    try {
      // Analyze repository
      const rawAnalysis = await this.repoAnalysisService.analyzeRepository(owner, repo);
      
      // Transform raw analysis to match RepositoryAnalysis interface
      repositoryAnalysis = {
        id: rawAnalysis.id.toString(),
        name: rawAnalysis.name,
        fullName: rawAnalysis.fullName,
        description: rawAnalysis.description,
        private: rawAnalysis.private,
        metrics: {
          stars: rawAnalysis.metrics.stars,
          forks: rawAnalysis.metrics.forks,
          issues: rawAnalysis.metrics.issues,
          watchers: rawAnalysis.metrics.watchers,
          size: rawAnalysis.size,
          updatedAt: rawAnalysis.updatedAt,
          createdAt: rawAnalysis.createdAt,
          lastPushAt: rawAnalysis.pushedAt
        },
        techStack: rawAnalysis.techStack,
        defaultBranch: rawAnalysis.defaultBranch,
        topics: [], // Will be populated from GitHub API
        hasWiki: true, // Default values, should be updated based on GitHub API response
        hasIssues: true,
        hasProjects: true,
        hasDownloads: true,
        archived: rawAnalysis.archived,
        disabled: rawAnalysis.disabled,
        visibility: rawAnalysis.visibility,
        license: null, // Will be populated from GitHub API
        language: null, // Will be populated from GitHub API
        createdAt: new Date(rawAnalysis.createdAt),
        updatedAt: new Date(rawAnalysis.updatedAt)
      };
      
      // Generate repository report if analysis succeeded
      if (repositoryAnalysis) {
        try {
          repositoryReport = await this.llmService.generateRepositoryReport(repositoryAnalysis);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to generate repository report: ${errorMessage}`);
          console.error('Repository report generation error:', errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push('Failed to analyze repository');
      console.error('Repository analysis error:', errorMessage);
    }

    try {
      // Analyze PR
      prAnalysis = await this.prAnalysisService.analyzePR(owner, repo, prNumber);
      
      // Generate PR report if analysis succeeded
      if (prAnalysis) {
        try {
          prReport = await this.llmService.generatePRReport(prAnalysis);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to generate PR report: ${errorMessage}`);
          console.error('PR report generation error:', errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push('Failed to analyze PR');
      console.error('PR analysis error:', errorMessage);
    }

    // Return results even if some parts failed
    return {
      repositoryAnalysis,
      prAnalysis,
      llmReports: {
        repository: repositoryReport,
        pr: prReport
      },
      errors
    };
  }

  close(): void {
    this.prAnalysisService.close();
    this.repoAnalysisService.close();
  }
}
