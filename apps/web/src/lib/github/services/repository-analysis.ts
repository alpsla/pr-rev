import { GitHubIntegrationService } from './github-integration';
import { LLMService } from '../../llm/llm-service';

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
  visibility: string;
  archived: boolean;
  disabled: boolean;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
}

export type LanguageData = Record<string, number>;

export interface RepositoryAnalysis {
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
  visibility: string;
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
    this.llmService = new LLMService({
      apiKey: process.env.CLAUDE_API_KEY || '',
      model: process.env.CLAUDE_MODEL || 'claude-3-sonnet',
      temperature: 0.7,
      maxTokens: 2000
    });
  }

  async analyzeRepository(owner: string, repo: string): Promise<RepositoryAnalysis> {
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
    return this.fetchWithRateLimit<RepositoryData>(`/repos/${owner}/${repo}`);
  }

  private async fetchLanguages(owner: string, repo: string): Promise<LanguageData> {
    return this.fetchWithRateLimit<LanguageData>(`/repos/${owner}/${repo}/languages`);
  }

  private async fetchPackageJson(owner: string, repo: string): Promise<PackageJsonData | null> {
    try {
      const response = await this.fetchRaw(`/repos/${owner}/${repo}/contents/package.json`);
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content) as PackageJsonData;
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
    return this.llmService.generateRepositoryReport({
      metrics: analysis.metrics,
      techStack: analysis.techStack
    });
  }

  async close(): Promise<void> {
    await super.close();
  }
}
