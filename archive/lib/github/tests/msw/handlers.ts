import type { Repository, PullRequest, PullRequestReview } from '../../types';
 import { http } from 'msw';
const GITHUB_API = 'https://api.github.com';

interface PullRequestReviewBody {
  body?: string;
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' | 'PENDING';
}

// Mock repository response
const mockRepository: Repository = {
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
const mockPullRequest: PullRequest = {
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
  mergeable_state: 'clean',
  mergeable: true,
  rebaseable: true,
  labels: ['enhancement'],
  mergeableState: 'mergeable',
  milestone: 'v1.0'
};

// Mock review response
const mockReview: PullRequestReview = {
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

export const handlers = [
  http.get(`${GITHUB_API}/repos/:owner/:repo`, async ({ request, params }) => {
    const { owner, repo } = params as { owner: string; repo: string };
    
    // Simulate rate limiting
    const scenario = request.headers.get('x-test-scenario');
    if (scenario === 'rate-limit') {
      return Response.json(
        {
          message: 'API rate limit exceeded',
          documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
        },
        { status: 403 }
      );
    }

    // Simulate not found
    if (repo === 'non-existent-repo') {
      return Response.json(
        {
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/reference/repos#get-a-repository'
        },
        { status: 404 }
      );
    }

    // Success response
    return Response.json({
      ...mockRepository,
      name: repo,
      full_name: `${owner}/${repo}`
    });
  }),

  // Get pull request
  http.get(`${GITHUB_API}/repos/:owner/:repo/pulls/:pull_number`, async ({ params }) => {
    const { pull_number } = params as { pull_number: string };

    return Response.json({
      ...mockPullRequest,
      number: parseInt(pull_number, 10)
    });
  }),

  // List pull request reviews
  http.get(`${GITHUB_API}/repos/:owner/:repo/pulls/:pull_number/reviews`, async () => {
    return Response.json([mockReview]);
  }),

  // Create pull request review
  http.post(`${GITHUB_API}/repos/:owner/:repo/pulls/:pull_number/reviews`, async ({ request }) => {
    const reviewData = await request.json() as PullRequestReviewBody;
    
    return Response.json({
      ...mockReview,
      body: reviewData?.body ?? mockReview.body,
      state: reviewData?.event ?? mockReview.state
    });
  }),

  // Handle rate limit check
  http.get(`${GITHUB_API}/rate_limit`, () => {
    return Response.json({
      resources: {
        core: {
          limit: 5000,
          remaining: 4999,
          reset: Math.floor(Date.now() / 1000) + 3600
        }
      }
    });
  })
];
