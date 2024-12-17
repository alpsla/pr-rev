import type { PullRequest } from '../../types';
import { RateLimitError, AuthenticationError, NotFoundError, ServerError, NetworkError } from '../../errors';

export const mockErrors = {
  rateLimit: new RateLimitError('API rate limit exceeded'),
  unauthorized: new AuthenticationError('Bad credentials'),
  notFound: new NotFoundError('Not Found'),
  serverError: new ServerError('Internal Server Error', undefined, { statusCode: 500 }),
  networkError: new NetworkError('Network error')
};

export const mockRequest = {
    intercept: jest.fn()
};

export const mockRepository = {
  id: 1,
  name: 'test-repo',
  fullName: 'test-owner/test-repo',
  description: 'Test repository',
  private: false,
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

export const mockPullRequest: PullRequest = {
  url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
  id: 1,
  node_id: 'PR_1',
  html_url: 'https://github.com/test-owner/test-repo/pull/1',
  diff_url: 'https://github.com/test-owner/test-repo/pull/1.diff',
  patch_url: 'https://github.com/test-owner/test-repo/pull/1.patch',
  issue_url: 'https://api.github.com/repos/test-owner/test-repo/issues/1',
  commits_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/commits',
  review_comments_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/comments',
  review_comment_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/comments{/number}',
  comments_url: 'https://api.github.com/repos/test-owner/test-repo/issues/1/comments',
  statuses_url: 'https://api.github.com/repos/test-owner/test-repo/statuses/sha',
  number: 1,
  state: 'open',
  title: 'Test Pull Request',
  user: {
      login: 'test-user',
      avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
      type: 'User'
  },
  body: 'Test pull request body',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  mergedAt: null,
  assignee: null,
  assignees: [],
  requested_reviewers: [],
  requested_teams: [],
  milestone: undefined,
  draft: false,
  head: {
      ref: 'test-branch',
      sha: 'sha',
      repo: {
          id: 1,
          name: 'test-repo',
          url: 'https://api.github.com/repos/test-owner/test-repo'
      }
  },
  base: {
      ref: 'main',
      sha: 'sha',
       repo: {
          id: 1,
          name: 'test-repo',
          url: 'https://api.github.com/repos/test-owner/test-repo'
      }
  },
  _links: {
      self: {
          href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1'
      },
      html: {
          href: 'https://github.com/test-owner/test-repo/pull/1'
      },
      issue: {
          href: 'https://api.github.com/repos/test-owner/test-repo/issues/1'
      },
      comments: {
          href: 'https://api.github.com/repos/test-owner/test-repo/issues/1/comments'
      },
      review_comments: {
          href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/comments'
      },
      review_comment: {
          href: 'https://api.github.com/repos/test-owner/test-repo/pulls/comments{/number}'
      },
      commits: {
          href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/commits'
      },
      statuses: {
          href: 'https://api.github.com/repos/test-owner/test-repo/statuses/sha'
      }
  },
  merged: false,
  mergeable: true,
  rebaseable: true,
  mergeableState: 'mergeable',
  mergeable_state: 'clean', 
  changedFiles: 1,
  additions: 1,
  deletions: 1,
  commits: 1,
  comments: 1,
  review_comments: 1,
  maintainer_can_modify: true,
   labels: [],
};