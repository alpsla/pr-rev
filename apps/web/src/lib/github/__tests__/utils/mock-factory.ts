import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { Octokit } from '@octokit/rest';
import type { PrismaClient, PlatformType } from '@prisma/client';
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
import { jest } from '@jest/globals';

// Types
export interface MockContext {
  prisma: jest.Mocked<PrismaClient>;
  octokit: jest.Mocked<Octokit>;
  responses: {
    repository: RestEndpointMethodTypes['repos']['get']['response'];
    pullRequest: RestEndpointMethodTypes['pulls']['get']['response'];
    pullRequestReview: RestEndpointMethodTypes['pulls']['listReviews']['response'];
  };
}

export interface MockGitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface MockRepository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  owner: MockGitHubUser;
  defaultBranch: string;
  language: string;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  pushedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  locked: boolean;
  draft: boolean;
  user: MockGitHubUser;
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
  mergeable: boolean;
  rebaseable: boolean;
  mergeableState: string;
  createdAt: string;
  updatedAt: string;
}

// Mock Factory Functions
export const createMockGitHubUser = (overrides: Partial<MockGitHubUser> = {}): MockGitHubUser => ({
  id: 1,
  login: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://github.com/testuser.png',
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
  mergeableState: 'clean',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockContext = (): MockContext => {
  const ctx: MockContext = {
    prisma: {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      platform: {
        findFirstOrThrow: jest.fn(),
      },
      repository: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
      },
      pullRequest: {
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      review: {
        create: jest.fn(),
        updateMany: jest.fn(),
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
    } as unknown as jest.Mocked<Octokit>,
    responses: {
      repository: mockGithubRepoResponse,
      pullRequest: mockPullRequestResponse,
      pullRequestReview: mockPullRequestReviewsResponse,
    },
  };

  return ctx;
};

// Setup Functions
export const setupSuccessfulMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  ctx.octokit.rest.pulls.get.mockResolvedValue(ctx.responses.pullRequest);
  ctx.octokit.rest.pulls.listReviews.mockResolvedValue(ctx.responses.pullRequestReview);
  ctx.octokit.rest.repos.get.mockResolvedValue(ctx.responses.repository);

  ctx.prisma.platform.findFirstOrThrow.mockResolvedValue({
    id: '1',
    type: 'GITHUB' as PlatformType,
    name: 'GitHub',
    enabled: true,
    config: {},
    capabilities: {},
    createdAt: new Date(),
    updatedAt: new Date()
  });
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

export const setupRateLimitExceededMocks = (ctx: MockContext, headers?: Record<string, string>): void => {
  const error = headers ? {
    ...mockRateLimitExceededError,
    response: {
      ...mockRateLimitExceededError.response,
      headers: {
        ...mockRateLimitExceededError.response?.headers,
        ...headers
      }
    }
  } : mockRateLimitExceededError;

  ctx.octokit.rest.rateLimit.get.mockResolvedValueOnce({
    ...mockRateLimitResponse,
    data: {
      ...mockRateLimitResponse.data,
      resources: {
        ...mockRateLimitResponse.data.resources,
        core: {
          limit: 5000,
          remaining: 0,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 5000
        }
      }
    }
  });

  ctx.octokit.rest.pulls.get.mockRejectedValue(error);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(error);
  ctx.octokit.rest.repos.get.mockRejectedValue(error);
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
  ctx.prisma.platform.findFirstOrThrow.mockRejectedValue(new Error('Database error'));
  ctx.prisma.repository.create.mockRejectedValue(new Error('Database error'));
  ctx.prisma.repository.update.mockRejectedValue(new Error('Database error'));
  ctx.prisma.repository.delete.mockRejectedValue(new Error('Database error'));
  ctx.prisma.repository.upsert.mockRejectedValue(new Error('Database error'));
  ctx.prisma.pullRequest.create.mockRejectedValue(new Error('Database error'));
  ctx.prisma.pullRequest.update.mockRejectedValue(new Error('Database error'));
  ctx.prisma.pullRequest.upsert.mockRejectedValue(new Error('Database error'));
  ctx.prisma.review.create.mockRejectedValue(new Error('Database error'));
  ctx.prisma.review.updateMany.mockRejectedValue(new Error('Database error'));
};
