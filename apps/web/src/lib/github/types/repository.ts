export interface RepositoryMetrics {
  stars: number;
  forks: number;
  openIssues?: number;  // Optional since we have issues for backward compatibility
  issues: number;
  watchers: number;
  contributors?: number;
  pullRequests?: number;
  branches?: number;
  size?: number;
  releases?: number;
  lastCommitAt?: string | null;
  lastReleaseAt?: string | null;
  lastPushAt?: string | null;
}

export interface RepositoryAnalysis {
  id: string;
  repositoryId: string;
  name: string;
  fullName: string;
  description: string | null;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  pushedAt?: string;
  private?: boolean;
  visibility?: string;
  defaultBranch?: string;
  archived?: boolean;
  disabled?: boolean;
  metrics: RepositoryMetrics;
  codeQuality: {
    score: number;
    testCoverage: number;
    documentation: number;
    maintainability: number;
  };
  security: {
    vulnerabilities: number;
    securityScore: number;
    lastAudit: string | null;
  };
  dependencies: {
    total: number;
    outdated: number;
    vulnerable: number;
    directDependencies: number;
    devDependencies: number;
  };
  activity: {
    lastCommit: string | Date;
    lastRelease: string | null;
    commitsLastMonth: number;
    prsLastMonth: number;
    issuesLastMonth: number;
  };
  techStack?: string[];
}

export interface RepositoryReport {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  visibility: string | undefined;
  defaultBranch: string;
  archived: boolean;
  disabled: boolean;
  metrics: {
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
  };
  techStack: string[];
}

export interface RepositoryAnalysisResult {
  repositoryAnalysis: RepositoryAnalysis | null;
  errors: string[];
}

interface BaseMetrics {
  stars: number;
  forks: number;
  watchers: number;
  openIssues?: number;
  issues?: number;
  contributors?: number;
  pullRequests?: number;
  branches?: number;
  size?: number;
  releases?: number;
  lastCommitAt?: string | null;
  lastReleaseAt?: string | null;
  lastPushAt?: string | null;
}

interface BaseActivity {
  lastCommit: string | Date;
  lastRelease: string | null;
  commitsLastMonth: number;
  prsLastMonth: number;
  issuesLastMonth: number;
}

// Helper function to convert between metrics formats
export function convertMetrics(metrics: BaseMetrics): RepositoryMetrics {
  const issueCount = metrics.openIssues ?? metrics.issues ?? 0;
  return {
    stars: metrics.stars,
    forks: metrics.forks,
    openIssues: issueCount,
    issues: issueCount,
    watchers: metrics.watchers,
    contributors: metrics.contributors,
    pullRequests: metrics.pullRequests,
    branches: metrics.branches,
    size: metrics.size,
    releases: metrics.releases,
    lastCommitAt: metrics.lastCommitAt,
    lastReleaseAt: metrics.lastReleaseAt,
    lastPushAt: metrics.lastPushAt,
  };
}

// Helper function to create default values for required fields
export function createDefaultAnalysis(partial: Partial<RepositoryAnalysis>): RepositoryAnalysis {
  const now = new Date().toISOString();
  return {
    id: partial.id || '',
    repositoryId: partial.repositoryId || '',
    name: partial.name || '',
    fullName: partial.fullName || '',
    description: partial.description || null,
    timestamp: partial.timestamp || now,
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
    pushedAt: partial.pushedAt,
    metrics: partial.metrics || {
      stars: 0,
      forks: 0,
      issues: 0,
      watchers: 0,
    },
    codeQuality: partial.codeQuality || {
      score: 0,
      testCoverage: 0,
      documentation: 0,
      maintainability: 0,
    },
    security: partial.security || {
      vulnerabilities: 0,
      securityScore: 0,
      lastAudit: null,
    },
    dependencies: partial.dependencies || {
      total: 0,
      outdated: 0,
      vulnerable: 0,
      directDependencies: 0,
      devDependencies: 0,
    },
    activity: partial.activity || {
      lastCommit: now,
      lastRelease: null,
      commitsLastMonth: 0,
      prsLastMonth: 0,
      issuesLastMonth: 0,
    },
    ...partial,
  };
}

// Helper function to convert repository data to analysis format
export function convertToAnalysis(
  repoData: {
    id: number | string;
    name: string;
    full_name: string;
    description: string | null;
    private?: boolean;
    visibility?: string;
    default_branch?: string;
    archived?: boolean;
    disabled?: boolean;
    pushed_at?: string;
    metrics: BaseMetrics;
    activity: BaseActivity;
  }
): RepositoryAnalysis {
  return createDefaultAnalysis({
    id: repoData.id.toString(),
    name: repoData.name,
    fullName: repoData.full_name,
    description: repoData.description,
    private: repoData.private,
    visibility: repoData.visibility,
    defaultBranch: repoData.default_branch,
    archived: repoData.archived,
    disabled: repoData.disabled,
    pushedAt: repoData.pushed_at,
    metrics: convertMetrics(repoData.metrics),
    activity: repoData.activity,
  });
}
