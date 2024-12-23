export interface GitHubErrorMatcher {
  status: number;
  message?: string;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  errorType?: string;
  expectedStatus?: number;
  expectedMessage?: string;
}

export interface TestStats {
  passed: number;
  failed: number;
  total: number;
}

export interface GitHubTestContext {
  owner: string;
  repo: string;
  prNumber: number;
  token: string;
}
