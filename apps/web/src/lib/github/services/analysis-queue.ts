import { RepositoryAnalysis, convertToAnalysis } from '../types/repository';
import { GitHubIntegrationService } from './github-integration';
import { LLMService } from '../../llm/llm-service';
import { LLMResponse, LLMRepositoryAnalysis } from '../../llm/types/analysis';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../prisma';

export interface AnalysisJob {
  id: string;
  repositoryId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: RepositoryAnalysis;
  retryCount: number;
  maxRetries: number;
}

export interface QueueOptions {
  maxConcurrent?: number;
  defaultMaxRetries?: number;
  retryDelayMs?: number;
  cacheExpiryMs?: number;
}

type PrismaClientWithAnalysis = PrismaClient & {
  analysis: {
    create: (args: { data: {
      id: string;
      repositoryId: string;
      name: string;
      fullName: string;
      description: string;
      timestamp: Date;
      metrics: Record<string, unknown>;
    } }) => Promise<unknown>;
  };
};

export class AnalysisQueue {
  private queue: AnalysisJob[] = [];
  private processing: Map<string, AnalysisJob> = new Map();
  private maxConcurrent: number;
  private defaultMaxRetries: number;
  private retryDelayMs: number;
  private cacheExpiryMs: number;
  private githubService: GitHubIntegrationService;
  private llmService: LLMService;
  private prismaClient: PrismaClientWithAnalysis;

  constructor(
    githubToken: string,
    userId: string,
    options: QueueOptions = {}
  ) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.defaultMaxRetries = options.defaultMaxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 5000;
    this.cacheExpiryMs = options.cacheExpiryMs || 24 * 60 * 60 * 1000; // 24 hours
    this.githubService = new GitHubIntegrationService(githubToken, userId);
    this.llmService = new LLMService();
    this.prismaClient = prisma as PrismaClientWithAnalysis;
  }

  private async processJob(job: AnalysisJob): Promise<RepositoryAnalysis> {
    // 1. Fetch repository data from GitHub
    const repoData = await this.fetchRepositoryData(job.repositoryId);

    // 2. Generate initial analysis structure
    const analysis = convertToAnalysis({
      id: job.id,
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description,
      metrics: repoData.metrics,
      activity: repoData.activity,
    });

    // 3. Get LLM response
    const llmResponse = await this.getLLMAnalysis(analysis);

    // 4. Transform LLM response to match our schema
    const transformedMetrics = this.transformLLMResponse(llmResponse);

    // 5. Create final analysis
    const finalAnalysis: RepositoryAnalysis = {
      ...analysis,
      ...transformedMetrics,
    };

    // 6. Store in database
    await this.storeAnalysis(finalAnalysis);

    return finalAnalysis;
  }

  private async fetchRepositoryData(repositoryId: string) {
    const [owner, repo] = repositoryId.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository ID format. Expected "owner/repo"');
    }

    const repoData = await this.githubService.getRepository(owner, repo);
    const metrics = await this.githubService.getRepositoryMetrics(owner, repo);
    const activity = await this.githubService.getRepositoryActivity(owner, repo);

    return {
      ...repoData,
      metrics,
      activity,
    };
  }

  private async getLLMAnalysis(analysis: RepositoryAnalysis): Promise<LLMResponse<LLMRepositoryAnalysis>> {
    return this.llmService.generateRepositoryReport(analysis, {
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet',
      requestId: `analysis_${Date.now()}`
    });
  }

  private transformLLMResponse(response: LLMResponse<LLMRepositoryAnalysis>): Partial<RepositoryAnalysis> {
    return {
      codeQuality: {
        score: 0,
        testCoverage: 0,
        documentation: 0,
        maintainability: 0,
      },
      security: {
        vulnerabilities: response.analysis.findings.filter(f => f.category === 'Security').length,
        securityScore: 0,
        lastAudit: new Date().toISOString(),
      },
      dependencies: {
        total: 0,
        outdated: 0,
        vulnerable: 0,
        directDependencies: 0,
        devDependencies: 0,
      },
      activity: {
        lastCommit: new Date().toISOString(),
        lastRelease: null,
        commitsLastMonth: 0,
        prsLastMonth: 0,
        issuesLastMonth: 0,
      },
    };
  }

  private async storeAnalysis(analysis: RepositoryAnalysis): Promise<void> {
    const data = {
      id: analysis.id,
      repositoryId: analysis.repositoryId,
      name: analysis.name,
      fullName: analysis.fullName,
      description: analysis.description || '',
      timestamp: new Date(),
      metrics: {
        codeQuality: analysis.codeQuality,
        security: analysis.security,
        dependencies: analysis.dependencies,
        activity: analysis.activity,
      },
    };

    await this.prismaClient.analysis.create({ data });
  }

  public async enqueue(repositoryId: string, priority: number = 0): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: AnalysisJob = {
      id,
      repositoryId,
      status: 'pending',
      priority,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: this.defaultMaxRetries,
    };

    this.queue.push(job);
    this.sortQueue();

    // Try to process next job if we're not at capacity
    if (this.processing.size < this.maxConcurrent) {
      await this.processNext();
    }

    return id;
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Sort by priority first (higher priority first)
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // Then by creation time (older first)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0 || this.processing.size >= this.maxConcurrent) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    job.status = 'processing';
    job.startedAt = new Date();
    this.processing.set(job.id, job);

    try {
      const result = await this.processJob(job);
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
    } catch (error) {
      job.retryCount++;
      
      if (job.retryCount < job.maxRetries) {
        // Put the job back in the queue for retry
        job.status = 'pending';
        setTimeout(() => {
          this.queue.push(job);
          this.sortQueue();
          this.processNext();
        }, this.retryDelayMs * job.retryCount); // Exponential backoff
      } else {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
      }
    } finally {
      this.processing.delete(job.id);
      // Try to process next job
      await this.processNext();
    }
  }

  public async close(): Promise<void> {
    await this.githubService.close();
    await this.prismaClient.$disconnect();
  }
}
