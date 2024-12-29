import { GitHubAppConfig } from "../../types/app";

export function createTestConfig(): GitHubAppConfig {
  return {
    appId: process.env.GITHUB_APP_ID || 'test-app-id',
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY || 'test-private-key',
    clientId: process.env.GITHUB_CLIENT_ID || 'test-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'test-client-secret',
  };
}

export function createMockResponse<T>(data: T) {
  return {
    data,
    status: 200,
    headers: {},
  };
}

export function createRateLimitResponse() {
  return {
    data: {
      resources: {
        core: {
          limit: 5000,
          remaining: 4999,
          reset: Date.now() + 3600,
        },
      },
    },
    status: 200,
    headers: {},
  };
}

export const TEST_OWNER = 'test-owner';
export const TEST_REPO = 'test-repo';
