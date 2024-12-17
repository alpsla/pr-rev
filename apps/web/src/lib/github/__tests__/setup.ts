// Mock PrismaClient first, before any other imports
jest.mock('@prisma/client');
import { jest } from '@jest/globals';
import { Octokit } from '@octokit/rest'; // Import Octokit
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import type { GitHubErrorMatcher } from './types';

type RateLimitGetResponse = RestEndpointMethodTypes['rateLimit']['get']['response'];
type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];
type PullsGetResponse = RestEndpointMethodTypes['pulls']['get']['response'];
type PullsListReviewsResponse = RestEndpointMethodTypes['pulls']['listReviews']['response'];

// Create mock functions with proper typing
const mockRateLimitGet = jest.fn<() => Promise<RateLimitGetResponse>>();
const mockReposGet = jest.fn<() => Promise<ReposGetResponse>>();
const mockPullsGet = jest.fn<() => Promise<PullsGetResponse>>();
const mockPullsListReviews = jest.fn<() => Promise<PullsListReviewsResponse>>();


const mockRateLimitResponse = {
  data: {
      rate: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 60,
        used: 1
      },
      resources: {
          core: {
              limit: 5000,
              remaining: 4999,
              reset: Math.floor(Date.now() / 1000) + 60,
              used: 1
          },
          search: {
              limit: 30,
              remaining: 30,
              reset: Math.floor(Date.now() / 1000) + 60,
              used: 0
          }
      },
  },
  status: 200,
  url: 'https://api.github.com/rate_limit',
  headers: {}
} as const;

// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn(() => ({
      rest: {
        rateLimit: {
          get: mockRateLimitGet
        },
        repos: {
          get: mockReposGet
        },
        pulls: {
          get: mockPullsGet,
          listReviews: mockPullsListReviews
        }
      }
    }))
  };
});

// Set up environment variables for tests
process.env.GITHUB_TOKEN = 'test-token';
process.env.GITHUB_APP_ID = 'test-app-id';
process.env.GITHUB_APP_PRIVATE_KEY = 'test-private-key';
process.env.GITHUB_APP_INSTALLATION_ID = 'test-installation-id';

// Global test constants
declare global {
  const TEST_OWNER: string;
  const TEST_REPO: string;
  const TEST_PR_NUMBER: number;
}

Object.defineProperty(global, 'TEST_OWNER', { value: 'test-owner', configurable: true });
Object.defineProperty(global, 'TEST_REPO', { value: 'test-repo', configurable: true });
Object.defineProperty(global, 'TEST_PR_NUMBER', { value: 1, configurable: true });

// Export mock functions for use in tests
export const mocks = {
  mockRateLimitGet,
  mockReposGet,
  mockPullsGet,
  mockPullsListReviews
};

// Reset all mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
  
  // Reset mock implementations with default responses
  mockRateLimitGet.mockResolvedValue(mockRateLimitResponse);
  mockReposGet.mockReset();
  mockPullsGet.mockReset();
  mockPullsListReviews.mockReset();
});

// Add custom matchers
expect.extend({
  toBeGitHubError(received: GitHubErrorMatcher, expectedStatus: number, expectedMessage: string) {
    const pass = received.status === expectedStatus && 
                (received.message === expectedMessage || received.message?.includes(expectedMessage));
    
    if (pass) {
      return {
        message: () => `expected error not to match GitHub error with status ${expectedStatus} and message "${expectedMessage}"`,
        pass: true
      };
    } else {
      return {
        message: () => `expected error to match GitHub error with status ${expectedStatus} and message "${expectedMessage}", but got status ${received.status} and message "${received.message}"`,
        pass: false
      };
    }
  }
});

// Add setupOctokitMock function
export function setupOctokitMock(ctx: { octokit: Octokit }) {
    
  const mockOctokit = {
      rest: {
          rateLimit: {
            get: jest.fn<() => Promise<RateLimitGetResponse>>().mockResolvedValue(mockRateLimitResponse)
          },
           repos: {
              get: jest.fn(),
          },
          pulls: {
              get: jest.fn(),
              listReviews: jest.fn()
          }
      }
  } as unknown as Octokit;
  
  ctx.octokit = mockOctokit;
}