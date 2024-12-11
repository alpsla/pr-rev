export interface TestConfig {
  github: {
    owner: string;
    repo: string;
    token?: string;
    apiUrl: string;
  };
  test: {
    timeout: number;
    retries: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
  database: {
    timeout: number;
    maxRetries: number;
  };
}

export const testConfig: TestConfig = {
  github: {
    owner: process.env.GITHUB_TEST_OWNER || 'test-owner',
    repo: process.env.GITHUB_TEST_REPO || 'test-repo',
    token: process.env.GITHUB_TOKEN,
    apiUrl: 'https://api.github.com'
  },
  test: {
    timeout: 10000,
    retries: 3
  },
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 100
  },
  database: {
    timeout: 5000,
    maxRetries: 3
  }
};
