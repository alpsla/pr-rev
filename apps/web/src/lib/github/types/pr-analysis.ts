import { GitHubPRReview, GitHubUser } from '../services/github-integration';

export interface GitHubPRFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

export interface DiffAnalysis {
  filesChanged: number;
  additions: number;
  deletions: number;
  changedFiles: GitHubPRFile[];
  binaryFiles: number;
  renamedFiles: number;
}

export interface ImpactMetrics {
  complexity: number;
  risk: number;
  testCoverage: number;
  documentation: number;
}

export interface ReviewHistory {
  approvalCount: number;
  changesRequestedCount: number;
  reviewers: string[];
  reviews: GitHubPRReview[];
}

export interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  coverage?: number;
}

export interface AutomatedChecks {
  status: 'success' | 'failure' | 'pending' | 'unknown';
  testResults: TestResults;
  lintingErrors: number;
  securityIssues: number;
}

export interface PRAnalysis {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  draft: boolean;
  user: GitHubUser | null;
  diffAnalysis: DiffAnalysis;
  impactMetrics: ImpactMetrics;
  reviewHistory: ReviewHistory;
  automatedChecks: AutomatedChecks;
}
