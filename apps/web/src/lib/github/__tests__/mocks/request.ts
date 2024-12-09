import type { Repository, PullRequest, PullRequestReview } from '../../types';

interface RequestOptions {
  headers?: {
    authorization?: string;
    'x-test-scenario'?: string;
  };
}

// Mock repository response
export const mockRepository: Repository = {
  id: 1,
  name: 'test-repo',
  fullName: 'test-owner/test-repo',
  private: false,
  description: 'Test repository',
  defaultBranch: 'main',
  language: 'TypeScript',
  stargazersCount: 0,
  forksCount: 0,
  settings: {
    id: '1-settings',
    repositoryId: '1',
    autoMergeEnabled: false,
    requireApprovals: 1,
    protectedBranches: ['main'],
    allowedMergeTypes: ['merge', 'squash', 'rebase'],
    branchProtection: {}
  }
};

// Mock pull request response
export const mockPullRequest: PullRequest = {
  number: 1,
  title: 'Test PR',
  body: 'Test PR description',
  state: 'open',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  mergedAt: null,
  changedFiles: 1,
  additions: 10,
  deletions: 5,
  draft: false,
  mergeable: true,
  rebaseable: true,
  labels: ['enhancement'],
  mergeableState: 'mergeable',
  ciStatus: 'success',
  milestone: 'v1.0'
};

// Mock review response
export const mockReview: PullRequestReview = {
  id: 1,
  user: {
    login: 'reviewer',
    avatarUrl: 'https://github.com/images/reviewer.png',
    type: 'USER',
    role: 'REVIEWER'
  },
  body: 'Looks good!',
  state: 'APPROVED',
  commitId: 'abc123',
  submittedAt: new Date().toISOString()
};

// Mock request handlers
export const mockRequestHandlers = {
  getRepository: jest.fn().mockResolvedValue(mockRepository),
  getPullRequest: jest.fn().mockResolvedValue(mockPullRequest),
  getPullRequestReviews: jest.fn().mockResolvedValue([mockReview]),
  createPullRequestReview: jest.fn().mockImplementation((review) => ({
    ...mockReview,
    body: review.body || mockReview.body,
    state: review.state || mockReview.state
  }))
};

// Mock error responses
export const mockErrors = {
  notFound: {
    status: 404,
    message: 'Not Found',
    documentation_url: 'https://docs.github.com/rest'
  },
  rateLimit: {
    status: 403,
    message: 'API rate limit exceeded',
    documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
  },
  unauthorized: {
    status: 401,
    message: 'Bad credentials',
    documentation_url: 'https://docs.github.com/rest'
  },
  serverError: {
    status: 500,
    message: 'Internal Server Error',
    documentation_url: 'https://docs.github.com/rest'
  }
};

// Mock request interceptor
export const mockRequest = {
  intercept: jest.fn().mockImplementation((url: string, options: RequestOptions) => {
    // Simulate rate limit
    if (options.headers?.['x-test-scenario'] === 'rate-limit') {
      throw mockErrors.rateLimit;
    }

    // Simulate unauthorized
    if (options.headers?.authorization === 'token invalid-token') {
      throw mockErrors.unauthorized;
    }

    // Simulate not found
    if (url.includes('non-existent-repo')) {
      throw mockErrors.notFound;
    }

    // Handle successful requests
    if (url.includes('/repos/')) {
      if (url.includes('/pulls/')) {
        if (url.includes('/reviews')) {
          return mockRequestHandlers.getPullRequestReviews();
        }
        return mockRequestHandlers.getPullRequest();
      }
      return mockRequestHandlers.getRepository();
    }

    throw mockErrors.notFound;
  })
};

// Export mock factory
export const createRequestMock = () => mockRequest;
