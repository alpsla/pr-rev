export interface GitHubRepositoryData {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  visibility: string | undefined;
  archived: boolean;
  disabled: boolean;
  pushed_at: string;
}

export interface GitHubRepositoryMetrics {
  stars: number;
  forks: number;
  openIssues: number;
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

export interface GitHubRepositoryActivity {
  lastCommit: string;
  lastRelease: string | null;
  commitsLastMonth: number;
  prsLastMonth: number;
  issuesLastMonth: number;
}

export interface LLMAnalysisResponse {
  codeQuality: {
    score: number;
    testCoverage: number;
    documentation: number;
    maintainability: number;
    organization: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      impact: string;
    }>;
  };
  security: {
    vulnerabilities: Array<{
      severity: string;
      description: string;
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      impact: string;
      risk: string;
    }>;
    score: number;
    authPatterns: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      risk: string;
    }>;
    dataHandling: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      risk: string;
    }>;
  };
  dependencies: {
    total: number;
    outdated: Array<{
      name: string;
      currentVersion: string;
      latestVersion: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      breakingChanges: boolean;
    }>;
    vulnerable: Array<{
      name: string;
      vulnerability: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      risk: string;
    }>;
    direct: number;
    dev: number;
    compatibility: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
  };
  workflow: {
    commitPatterns: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
    prManagement: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
    collaboration: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
    releaseProcess: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
  };
}

export interface AnalysisMetrics {
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
}

export interface GitHubPRReview {
  id: number;
  user: {
    login: string;
    id: number;
  };
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  submittedAt: string;
  body: string | null;
  commitId: string;
}
