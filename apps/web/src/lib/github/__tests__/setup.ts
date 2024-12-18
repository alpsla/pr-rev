jest.mock('@prisma/client');
import { jest, expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';
import type { MatcherContext } from 'expect';
import { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { GitHubError } from '../errors';
import type { 
  RequestMethod,
  RequestParameters, 
  EndpointInterface,
  RequestHeaders,
  OctokitResponse
} from '@octokit/types';

// Define response types
type RateLimitGetResponse = RestEndpointMethodTypes['rateLimit']['get']['response'];
type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];
type PullsGetResponse = RestEndpointMethodTypes['pulls']['get']['response'];
type PullsListReviewsResponse = RestEndpointMethodTypes['pulls']['listReviews']['response'];

// Define Octokit method type
interface OctokitMethod<T> extends jest.Mock {
  (params: RequestParameters): Promise<OctokitResponse<T>>;
  defaults: (newDefaults: RequestParameters) => OctokitMethod<T>;
  endpoint: EndpointInterface<{ url: string }>;
}

// Create mock functions with proper typing
const mockReposGet = jest.fn<() => Promise<ReposGetResponse>>();
const mockPullsGet = jest.fn<() => Promise<PullsGetResponse>>();
const mockPullsListReviews = jest.fn<() => Promise<PullsListReviewsResponse>>();

const mockRateLimitGet = jest.fn<() => Promise<RateLimitGetResponse>>().mockResolvedValue({
  data: {
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
    rate: {
      limit: 5000,
      remaining: 4999,
      reset: Math.floor(Date.now() / 1000) + 60,
      used: 1
    }
  },
  status: 200,
  url: 'https://api.github.com/rate_limit',
  headers: {}
});

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(() => ({
    rest: {
      rateLimit: { get: mockRateLimitGet },
      repos: { get: mockReposGet },
      pulls: { 
        get: mockPullsGet,
        listReviews: mockPullsListReviews 
      }
    }
  }))
}));

// Environment setup
process.env.GITHUB_TOKEN = 'test-token';
process.env.GITHUB_APP_ID = 'test-app-id';
process.env.GITHUB_APP_PRIVATE_KEY = 'test-private-key';
process.env.GITHUB_APP_INSTALLATION_ID = 'test-installation-id';

// Global test constants and types
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeGitHubError(expectedStatus: number, expectedMessage: string): R;
    }
  }

  const TEST_OWNER: string;
  const TEST_REPO: string;
  const TEST_PR_NUMBER: number;
  function fail(message: string): never;
}

// Set global constants
Object.defineProperty(global, 'TEST_OWNER', { value: 'test-owner', configurable: true });
Object.defineProperty(global, 'TEST_REPO', { value: 'test-repo', configurable: true });
Object.defineProperty(global, 'TEST_PR_NUMBER', { value: 1, configurable: true });
Object.defineProperty(global, 'fail', {
  value: (message: string): never => {
    throw new Error(message);
  },
  configurable: true
});

// Export mocks
export const mocks = {
  mockRateLimitGet,
  mockReposGet,
  mockPullsGet,
  mockPullsListReviews
};

const mockRateLimitResponse: RateLimitGetResponse = {
  data: {
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
    rate: {
      limit: 5000,
      remaining: 4999,
      reset: Math.floor(Date.now() / 1000) + 60,
      used: 1
    }
  },
  status: 200,
  url: 'https://api.github.com/rate_limit',
  headers: {}
};

// Reset mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
  mockRateLimitGet.mockResolvedValue(mockRateLimitResponse);
  mockReposGet.mockReset();
  mockPullsGet.mockReset();
  mockPullsListReviews.mockReset();
});

// Custom matcher implementation
const toBeGitHubError: MatcherFunction<[expectedStatus: number, expectedMessage: string]> = function(
  this: MatcherContext,
  actual: unknown,
  expectedStatus: number,
  expectedMessage: string
) {
  const received = actual as GitHubError;
  const isGitHubError = received instanceof GitHubError;
  
  if (!isGitHubError) {
    return {
      pass: false,
      message: () => 
        this.utils.matcherHint('toBeGitHubError') +
        '\n\n' +
        `Expected: instance of GitHubError\n` +
        `Received: ${this.utils.printReceived(received)}`,
    };
  }

  const pass = 
    received.status === expectedStatus &&
    received.message.includes(expectedMessage);

  return {
    pass,
    message: () => 
      pass
        ? this.utils.matcherHint('.not.toBeGitHubError') +
          '\n\n' +
          `Expected error not to match:\n` +
          `  status: ${expectedStatus}\n` +
          `  message: ${expectedMessage}\n` +
          `Received:\n` +
          `  status: ${received.status}\n` +
          `  message: ${received.message}`
        : this.utils.matcherHint('.toBeGitHubError') +
          '\n\n' +
          `Expected error to match:\n` +
          `  status: ${expectedStatus}\n` +
          `  message: ${expectedMessage}\n` +
          `Received:\n` +
          `  status: ${received.status}\n` +
          `  message: ${received.message}`,
  };
};

// Add custom matcher
expect.extend({ toBeGitHubError });

// Mock request defaults with proper typing
// const mockRequestDefaults = (defaults: RequestParameters): RequestParameters => ({
//   baseUrl: 'https://api.github.com',
//   headers: {
//     accept: 'application/vnd.github.v3+json',
//     'user-agent': 'octokit-test',
//     ...defaults.headers,
//   },
//   ...defaults,
// });

// Setup Octokit mock with proper typing

const createOctokitMethod = <T>(mockImpl?: (params: RequestParameters) => Promise<OctokitResponse<T>>): OctokitMethod<T> => {
  const baseMethod = jest.fn(mockImpl || (async () => {
    try {
      return {} as OctokitResponse<T>;
    } catch (error) {
      throw new GitHubError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        error
      );
    }
  }));

  const headers: RequestHeaders = {
    accept: 'application/vnd.github.v3+json',
    'user-agent': 'octokit-test'
  };

  const defaultParams: RequestParameters = {
    baseUrl: 'https://api.github.com',
    headers,
    method: 'GET' as RequestMethod,
    url: '/endpoint',
    mediaType: { previews: [], format: '' }
  };

  // Simplify endpoint implementation
  const endpoint = {
    DEFAULTS: defaultParams,
    defaults: function(options: RequestParameters) {
      return Object.assign(Object.create(this), {
        DEFAULTS: { ...defaultParams, ...options }
      });
    },
    merge: function(options: RequestParameters): RequestParameters {
      return { ...defaultParams, ...options };
    },
    parse: function(options: RequestParameters): RequestParameters {
      return { ...defaultParams, ...options };
    }
  };

  const method = baseMethod as OctokitMethod<T>;
  
  method.defaults = (newDefaults: RequestParameters): OctokitMethod<T> => {
    const newMethod = createOctokitMethod<T>(async (params) => {
      return mockImpl ? 
        await mockImpl({ ...newDefaults, ...params }) : 
        {} as OctokitResponse<T>;
    });
    return newMethod;
  };

  method.endpoint = endpoint as EndpointInterface<{ url: string }>;

  return method;
};

// Setup Octokit mock
export function setupOctokitMock(ctx: { octokit: Octokit }) {
  const mockOctokit = {
    rest: {
      rateLimit: {
        get: createOctokitMethod<RateLimitGetResponse['data']>(async () => ({
          data: {
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
            rate: {
              limit: 5000,
              remaining: 4999,
              reset: Math.floor(Date.now() / 1000) + 60,
              used: 1
            }
          },
          status: 200,
          url: 'https://api.github.com/rate_limit',
          headers: {}
        }))
      },
      repos: {
        get: createOctokitMethod<ReposGetResponse['data']>()
      },
      pulls: {
        get: createOctokitMethod<PullsGetResponse['data']>(),
        listReviews: createOctokitMethod<PullsListReviewsResponse['data']>()
      }
    },
    request: createOctokitMethod(),
    graphql: createOctokitMethod(),
    paginate: jest.fn(),
    hook: {
      before: jest.fn(),
      after: jest.fn(),
      error: jest.fn(),
      wrap: jest.fn()
    },
    log: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    },
    auth: jest.fn()
  } as unknown as Octokit;

  ctx.octokit = mockOctokit;
}