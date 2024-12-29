import type { RestEndpointMethodTypes } from '@octokit/rest';

export type GitHubRepository = RestEndpointMethodTypes['repos']['get']['response']['data'];

export interface RepositoryMetrics {
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
  size: number;
  updatedAt: string;
  createdAt: string;
  lastPushAt: string;
}

export interface RepositoryAnalysis {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  metrics: RepositoryMetrics;
  techStack: string[];
  defaultBranch: string;
  topics: string[];
  hasWiki: boolean;
  hasIssues: boolean;
  hasProjects: boolean;
  hasDownloads: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  license: string | null;
  language: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepositoryAnalysisResult {
  id: string;
  platformId: string;
  name: string;
  analysis: RepositoryAnalysis;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
