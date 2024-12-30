import { GitHubIntegrationService } from './github-integration';
import { LLMService } from '../../llm/llm-service';
import { RepositoryAnalysis as LLMRepositoryAnalysis } from '../types/repository';

export interface RepositoryMetrics {
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
}

export interface PackageJsonData {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
}

export interface RepositoryData {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  visibility: string | undefined;
  archived: boolean;
  disabled: boolean;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
}

export type LanguageData = Record<string, number>;

export interface InternalRepositoryAnalysis {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  defaultBranch: string;
  visibility: string | undefined;
  archived: boolean;
  disabled: boolean;
  metrics: RepositoryMetrics;
  techStack: string[];
  dependencies?: Dependency[];
}

export class GitHubRepositoryAnalysisService extends GitHubIntegrationService {
  private llmService: LLMService;

  constructor(token: string, userId: string) {
    super(token, userId);
    this.llmService = new LLMService();
  }

  async analyzeRepository(owner: string, repo: string): Promise<InternalRepositoryAnalysis> {
    const [repoData, languages, packageJson] = await Promise.all([
      this.fetchRepositoryData(owner, repo),
      this.fetchLanguages(owner, repo),
      this.fetchPackageJson(owner, repo).catch(() => null)
    ]);

    const metrics: RepositoryMetrics = {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
      watchers: repoData.watchers_count
    };

    const techStack = this.determineTechStack(languages, packageJson);
    const dependencies = packageJson ? this.extractDependencies(packageJson) : undefined;

    return {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      private: repoData.private,
      fork: repoData.fork,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      pushedAt: repoData.pushed_at,
      size: repoData.size,
      defaultBranch: repoData.default_branch,
      visibility: repoData.visibility,
      archived: repoData.archived,
      disabled: repoData.disabled,
      metrics,
      techStack,
      dependencies
    };
  }

  private async fetchRepositoryData(owner: string, repo: string): Promise<RepositoryData> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { data } = await this.octokit.repos.get({ owner, repo });
      return data as unknown as RepositoryData;
    });
  }

  private async fetchLanguages(owner: string, repo: string): Promise<LanguageData> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { data } = await this.octokit.repos.listLanguages({ owner, repo });
      return data;
    });
  }

  private async fetchPackageJson(owner: string, repo: string): Promise<PackageJsonData | null> {
    try {
      const { data } = await this.rateLimiter.executeWithRateLimit(async () => {
        return this.octokit.repos.getContent({
          owner,
          repo,
          path: 'package.json'
        });
      });

      if ('content' in data) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return JSON.parse(content) as PackageJsonData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching package.json:', error);
      return null;
    }
  }

  private determineTechStack(
    languages: LanguageData,
    packageJson: PackageJsonData | null
  ): string[] {
    const techStack = new Set<string>();

    // Add languages
    Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([lang]) => techStack.add(lang));

    if (packageJson) {
      // Add major frameworks and libraries
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const frameworkMap: Record<string, string> = {
        'react': 'React',
        'vue': 'Vue.js',
        'angular': 'Angular',
        'next': 'Next.js',
        'nuxt': 'Nuxt.js',
        'express': 'Express',
        'nestjs': 'NestJS',
        'prisma': 'Prisma',
        'typeorm': 'TypeORM',
        'jest': 'Jest',
        'mocha': 'Mocha',
        'webpack': 'Webpack',
        'vite': 'Vite',
        'tailwindcss': 'Tailwind CSS'
      };

      Object.keys(allDeps || {}).forEach(dep => {
        const framework = Object.entries(frameworkMap).find(([key]) => 
          dep.toLowerCase().includes(key)
        );
        if (framework) {
          techStack.add(framework[1]);
        }
      });
    }

    return Array.from(techStack);
  }

  private extractDependencies(packageJson: PackageJsonData): Dependency[] {
    const dependencies: Dependency[] = [];

    // Process production dependencies
    if (packageJson.dependencies) {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version,
          type: 'production'
        });
      });
    }

    // Process development dependencies
    if (packageJson.devDependencies) {
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version,
          type: 'development'
        });
      });
    }

    return dependencies;
  }

  async generateReport(owner: string, repo: string) {
    const analysis = await this.analyzeRepository(owner, repo);
    const llmAnalysis: LLMRepositoryAnalysis = {
      id: analysis.id.toString(),
      name: analysis.name,
      fullName: analysis.fullName,
      description: analysis.description,
      private: analysis.private,
      visibility: analysis.visibility,
      defaultBranch: analysis.defaultBranch,
      archived: analysis.archived,
      disabled: analysis.disabled,
      metrics: {
        stars: analysis.metrics.stars,
        forks: analysis.metrics.forks,
        issues: analysis.metrics.issues,
        watchers: analysis.metrics.watchers
      },
      techStack: analysis.techStack
    };

    return this.llmService.generateRepositoryReport(llmAnalysis, {
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet',
      requestId: `${owner}/${repo}-${Date.now()}`
    });
  }

  async close(): Promise<void> {
    await super.close();
  }
}
