import type { RestEndpointMethodTypes, Octokit } from '@octokit/rest';
import type { PullRequestReview, Repository, PullRequest } from '../../types';
import type { PrismaClient, PlatformType, Platform } from '@prisma/client';
import { GitHubWebhookUser } from '../../types';
import { jest } from '@jest/globals';
import { 
  mockRateLimitExceededError,
  mockNotFoundError,
  mockAuthenticationError,
  mockNetworkError,
  mockServerError,
  mockValidationError,
  mockResourceConflictError,
  mockSecondaryRateLimitError,
  mockInvalidResponseError,
  mockGithubRepoResponse,
  mockPullRequestResponse,
  mockPullRequestReviewsResponse,
  mockRateLimitResponse
} from '../mocks/responses';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export interface MockContext {
  prisma: jest.Mocked<PrismaClient>;
  octokit: jest.Mocked<Octokit>;
  responses: {
    repository: RestEndpointMethodTypes['repos']['get']['response'];
    pullRequest: RestEndpointMethodTypes['pulls']['get']['response'];
    pullRequestReview: RestEndpointMethodTypes['pulls']['listReviews']['response'];
  };
}

// Export the mock repository interface
export interface MockRepository extends Pick<Repository, 
  'id' | 
  'name' | 
  'fullName' | 
  'private' | 
  'description' | 
  'defaultBranch' | 
  'language'> {
  owner: GitHubWebhookUser;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  pushedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Export the mock pull request interface
export interface MockPullRequest extends Pick<PullRequest, 
  'number' | 
  'title' | 
  'body' | 
  'state' | 
  'createdAt' | 
  'updatedAt' | 
  'draft' | 
  'mergeable' | 
  'rebaseable' | 
  'mergeableState'> {
  id: number;
  locked: boolean;
  user: GitHubWebhookUser;
  base: {
    ref: string;
    sha: string;
    repo: MockRepository;
  };
  head: {
    ref: string;
    sha: string;
    repo: MockRepository;
  };
}

// Factory Functions
export const createMockContext = (): MockContext => {
  const ctx: MockContext = {
    prisma: {
      $connect: jest.fn<() => Promise<void>>(),
      $disconnect: jest.fn<() => Promise<void>>(),
      platform: {
        findFirstOrThrow: jest.fn(),
      },
      repository: {
        create: jest.fn<() => Promise<Repository>>(),
        update: jest.fn<() => Promise<Repository>>(),
        delete: jest.fn<() => Promise<Repository>>(),
        upsert: jest.fn<() => Promise<Repository>>(),
      },
      pullRequest: {
        create: jest.fn<() => Promise<PullRequest>>(),
        update: jest.fn<() => Promise<PullRequest>>(),
        upsert: jest.fn<() => Promise<PullRequest>>(),
      },
      review: {
        create: jest.fn().mockImplementation((): Promise<PullRequestReview> => Promise.resolve({
          id: 1,
          user: {
            login: 'testuser',
            avatarUrl: 'https://github.com/testuser.png',
            type: 'User',
            role: 'REVIEWER'
          },
          body: 'Test review',
          state: 'APPROVED',
          commitId: 'abc123',
          submittedAt: new Date().toISOString(),
        })),
        updateMany: jest.fn().mockImplementation((): Promise<{ count: number }> => Promise.resolve({ count: 1 })),
      },
    } as unknown as jest.Mocked<PrismaClient>,
    octokit: {
      rest: {
        rateLimit: {
          get: jest.fn(),
        },
        pulls: {
          get: jest.fn(),
          listReviews: jest.fn(),
        },
        repos: {
          get: jest.fn(),
        },
      },
      request: jest.fn(),
      graphql: jest.fn(),
      paginate: jest.fn(),
      hook: {
        before: jest.fn(),
        after: jest.fn(),
        error: jest.fn(),
        wrap: jest.fn(),
      },
    } as unknown as jest.Mocked<Octokit>,
    responses: {
      repository: mockGithubRepoResponse,
      pullRequest: mockPullRequestResponse,
      pullRequestReview: mockPullRequestReviewsResponse,
    },
  }

  return ctx;
};

export const createMockGitHubUser = (overrides: Partial<GitHubWebhookUser> = {}): GitHubWebhookUser => ({
  login: 'testuser',
  id: 1,
  node_id: 'MDQ6VXNlcjE=',
  avatar_url: 'https://github.com/testuser.png',
  gravatar_id: '',
  url: 'https://api.github.com/users/testuser',
  html_url: 'https://github.com/testuser',
  followers_url: 'https://api.github.com/users/testuser/followers',
  following_url: 'https://api.github.com/users/testuser/following{/other_user}',
  gists_url: 'https://api.github.com/users/testuser/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/testuser/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/testuser/subscriptions',
  organizations_url: 'https://api.github.com/users/testuser/orgs',
  repos_url: 'https://api.github.com/users/testuser/repos',
  events_url: 'https://api.github.com/users/testuser/events{/privacy}',
  received_events_url: 'https://api.github.com/users/testuser/received_events',
  type: 'User',
  site_admin: false,
  ...overrides
});

export const createMockPlatform = (overrides: Partial<Platform> = {}): Platform => ({
  id: 'platform-1',
  name: 'GitHub',
  type: 'GITHUB' as PlatformType,
  enabled: true,
  config: {} as JsonValue,
  capabilities: {} as JsonValue,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockRepository = (overrides: Partial<MockRepository> = {}): MockRepository => ({
  id: 123456,
  name: 'test-repo',
  fullName: 'testuser/test-repo',
  description: 'Test repository',
  private: false,
  owner: createMockGitHubUser(),
  defaultBranch: 'main',
  language: 'TypeScript',
  fork: false,
  archived: false,
  disabled: false,
  pushedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockPullRequest = (overrides: Partial<MockPullRequest> = {}): MockPullRequest => ({
  id: 987654,
  number: 123,
  title: 'Test PR',
  body: 'Test pull request description',
  state: 'open',
  locked: false,
  draft: false,
  user: createMockGitHubUser(),
  base: {
    ref: 'main',
    sha: 'base-sha-123',
    repo: createMockRepository()
  },
  head: {
    ref: 'feature-branch',
    sha: 'head-sha-456',
    repo: createMockRepository()
  },
  mergeable: true,
  rebaseable: true,
  mergeableState: 'mergeable',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

// Setup Functions
export const setupSuccessfulMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue({
    data: {
      resources: {
        core: {
          limit: 5000,
          remaining: 4999,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 1
        },
        search: {
          limit: 30,
          remaining: 30,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 0
        },
        graphql: {
          limit: 5000,
          remaining: 5000,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 0
        },
        integration_manifest: {
          limit: 5000,
          remaining: 5000,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 0
        },
        code_scanning_upload: {
          limit: 500,
          remaining: 500,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 0
        },
        actions_runner_registration: {
          limit: 10000,
          remaining: 10000,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 0
        },
        scim: {
          limit: 15000,
          remaining: 15000,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 0
        },
        dependency_snapshots: {
          limit: 100,
          remaining: 100,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 0
        }
      },
      rate: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      }
    },
    status: 200,
    headers: {},
    url: 'https://api.github.com/rate_limit'
  });

  ctx.octokit.rest.repos.get.mockResolvedValue(ctx.responses.repository);
  ctx.octokit.rest.pulls.get.mockResolvedValue(ctx.responses.pullRequest);
  ctx.octokit.rest.pulls.listReviews.mockResolvedValue(ctx.responses.pullRequestReview);
};

export const setupRateLimitExceededMocks = (ctx: MockContext): void => {
  const rateLimitError = mockRateLimitExceededError;
  ctx.octokit.rest.rateLimit.get.mockRejectedValue(rateLimitError);
  ctx.octokit.rest.repos.get.mockRejectedValue(rateLimitError);
  ctx.octokit.rest.pulls.get.mockRejectedValue(rateLimitError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(rateLimitError);
};

export const setupValidationErrorMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockRejectedValue(mockValidationError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(mockValidationError);
  ctx.octokit.rest.repos.get.mockRejectedValue(mockValidationError);
};

export const setupResourceConflictMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockRejectedValue(mockResourceConflictError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(mockResourceConflictError);
  ctx.octokit.rest.repos.get.mockRejectedValue(mockResourceConflictError);
};

export const setupSecondaryRateLimitMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockRejectedValue(mockSecondaryRateLimitError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(mockSecondaryRateLimitError);
  ctx.octokit.rest.repos.get.mockRejectedValue(mockSecondaryRateLimitError);
};

export const setupInvalidResponseMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockRejectedValue(mockInvalidResponseError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(mockInvalidResponseError);
  ctx.octokit.rest.repos.get.mockRejectedValue(mockInvalidResponseError);
};

export const setupNetworkErrorMocks = (ctx: MockContext, code = 'ECONNREFUSED'): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  const error = {
    ...mockNetworkError,
    code
  };
  ctx.octokit.rest.pulls.get.mockRejectedValue(error);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(error);
  ctx.octokit.rest.repos.get.mockRejectedValue(error);
};

export const setupNotFoundErrorMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockRejectedValue(mockNotFoundError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(mockNotFoundError);
  ctx.octokit.rest.repos.get.mockRejectedValue(mockNotFoundError);
};

export const setupAuthenticationErrorMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockRejectedValue(mockAuthenticationError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(mockAuthenticationError);
  ctx.octokit.rest.repos.get.mockRejectedValue(mockAuthenticationError);
};

export const setupServerErrorMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockRejectedValue(mockServerError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(mockServerError);
  ctx.octokit.rest.repos.get.mockRejectedValue(mockServerError);
};

export const setupPrismaErrorMocks = (ctx: MockContext): void => {
  const dbError = new Error('Database error');
  ctx.prisma.platform.findFirstOrThrow.mockRejectedValue(dbError);
  ctx.prisma.repository.create.mockRejectedValue(dbError);
  ctx.prisma.repository.update.mockRejectedValue(dbError);
  ctx.prisma.repository.delete.mockRejectedValue(dbError);
  ctx.prisma.repository.upsert.mockRejectedValue(dbError);
  ctx.prisma.pullRequest.create.mockRejectedValue(dbError);
  ctx.prisma.pullRequest.update.mockRejectedValue(dbError);
  ctx.prisma.pullRequest.upsert.mockRejectedValue(dbError);
  ctx.prisma.review.create.mockRejectedValue(dbError);
  ctx.prisma.review.updateMany.mockRejectedValue(dbError);
};
