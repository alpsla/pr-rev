import { rest } from 'msw';
import type { Repository, PullRequest, PullRequestReview } from '../../types';

const GITHUB_API = 'https://api.github.com';

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
  mergeable: true,
  rebaseable: true,
  labels: ['enhancement'],
  mergeableState: 'mergeable',
  ciStatus: 'success',
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
  // Get repository
  rest.get(`${GITHUB_API}/repos/:owner/:repo`, (req, res, ctx) => {
    const { owner, repo } = req.params as { owner: string; repo: string };
    
    // Simulate rate limiting
    if (req.headers.get('x-test-scenario') === 'rate-limit') {
      return res(
        ctx.status(403),
        ctx.json({
          message: 'API rate limit exceeded',
          documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
        })
      );
    }

    // Simulate not found
    if (repo === 'non-existent-repo') {
      return res(
        ctx.status(404),
        ctx.json({
          message: 'Not Found',
          documentation_url: 'https://docs.github.com/rest/reference/repos#get-a-repository'
        })
      );
    }

    // Success response
    return res(
      ctx.status(200),
      ctx.json({
        ...mockRepository,
        name: repo,
        full_name: `${owner}/${repo}`
      })
    );
  }),

  // Get pull request
  rest.get(`${GITHUB_API}/repos/:owner/:repo/pulls/:pull_number`, (req, res, ctx) => {
    const { pull_number } = req.params as { pull_number: string };

    return res(
      ctx.status(200),
      ctx.json({
        ...mockPullRequest,
        number: parseInt(pull_number, 10)
      })
    );
  }),

  // List pull request reviews
  rest.get(`${GITHUB_API}/repos/:owner/:repo/pulls/:pull_number/reviews`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([mockReview])
    );
  }),

  // Create pull request review
  rest.post(`${GITHUB_API}/repos/:owner/:repo/pulls/:pull_number/reviews`, async (req, res, ctx) => {
    const body = await req.json();
    
    return res(
      ctx.status(200),
      ctx.json({
        ...mockReview,
        body: body.body || mockReview.body,
        state: body.event || mockReview.state
      })
    );
  }),

  // Handle rate limit check
  rest.get(`${GITHUB_API}/rate_limit`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        resources: {
          core: {
            limit: 5000,
            remaining: 4999,
            reset: Math.floor(Date.now() / 1000) + 3600
          }
        }
      })
    );
  })
];
