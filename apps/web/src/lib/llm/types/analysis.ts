import { PRAnalysis } from '../../github/types/pr-analysis';

export interface RepositoryAnalysisInput {
  type: 'repository';
  metrics: {
    stars: number;
    forks: number;
    issues: number;
    watchers: number;
  };
  techStack: string[];
}

export type AnalysisInput = PRAnalysis | RepositoryAnalysisInput;

export interface PromptContext {
  repository: {
    name: string;
    description?: string;
    language?: string;
    techStack: string[];
  };
  pullRequest: {
    title: string;
    description: string;
    author: string;
    baseBranch: string;
    targetBranch: string;
  };
}
