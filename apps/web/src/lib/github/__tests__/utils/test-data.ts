import type { Repository, PullRequest, PullRequestReview } from '../../types';

export const TEST_OWNER = 'test-owner';
export const TEST_REPO = 'test-repo';
export const TEST_PR_NUMBER = 1;

export const mockRepository: Repository = {
  id: 123456,
  name: TEST_REPO,
  fullName: `${TEST_OWNER}/${TEST_REPO}`,
  private: false,
  description: 'Test repository',
  defaultBranch: 'main',
  language: 'TypeScript',
  stargazersCount: 10,
  forksCount: 5,
  settings: {
    id: '123456-settings',
    repositoryId: '123456',
    autoMergeEnabled: true,
    requireApprovals: 1,
    protectedBranches: ['main'],
    allowedMergeTypes: ['merge', 'squash', 'rebase']
  }
};

export const mockMinimalRepository: Repository = {
  id: 123457,
  name: 'minimal-repo',
  fullName: `${TEST_OWNER}/minimal-repo`,
  private: false,
  description: null,
  defaultBranch: 'main',
  language: '',  // Empty string instead of null
  stargazersCount: 0,
  forksCount: 0,
  settings: {
    id: '123457-settings',
    repositoryId: '123457',
    autoMergeEnabled: false,
    requireApprovals: 1,
    protectedBranches: ['main'],
    allowedMergeTypes: ['merge']
  }
};

export const mockPullRequest: PullRequest = {
  number: TEST_PR_NUMBER,
  title: 'Test PR',
  body: 'Test PR description',
  state: 'open',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  mergedAt: null,
  changedFiles: 1,
  additions: 10,
  deletions: 5,
  draft: false,
  mergeable: true,
  rebaseable: true,
  labels: ['bug'],
  mergeableState: 'mergeable',
  ciStatus: 'pending',
  milestone: 'v1.0.0'
};

export const mockPullRequestReview: PullRequestReview = {
  id: 987654,
  state: 'APPROVED',
  body: 'Looks good!',
  commitId: 'abc123',
  submittedAt: '2024-01-01T00:00:00Z',
  user: {
    login: 'reviewer',
    avatarUrl: 'https://github.com/reviewer.png',
    type: 'User',
    role: 'REVIEWER'
  }
};

export const mockRateLimit = {
  resources: {
    core: {
      limit: 5000,
      remaining: 4999,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 1
    }
  }
};

export const mockErrors = {
  notFound: {
    status: 404,
    message: 'Not Found'
  },
  unauthorized: {
    status: 401,
    message: 'Bad credentials'
  },
  rateLimit: {
    status: 403,
    message: 'API rate limit exceeded'
  },
  serverError: {
    status: 500,
    message: 'Internal Server Error'
  },
  networkError: {
    message: 'Network Error'
  }
};

export const mockOctokitResponses = {
  repository: {
    data: {
      ...mockRepository,
      // Add GitHub API specific fields
      node_id: 'R_123456',
      owner: {
        login: TEST_OWNER,
        id: 1,
        node_id: 'U_1',
        avatar_url: 'https://github.com/test-owner.png',
        gravatar_id: '',
        url: `https://api.github.com/users/${TEST_OWNER}`,
        html_url: `https://github.com/${TEST_OWNER}`,
        type: 'User',
        site_admin: false
      },
      html_url: `https://github.com/${TEST_OWNER}/${TEST_REPO}`,
      url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
      allow_auto_merge: true,
      allow_merge_commit: true,
      allow_squash_merge: true,
      allow_rebase_merge: true
    },
    status: 200,
    url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
    headers: {}
  },
  pullRequest: {
    data: {
      ...mockPullRequest,
      // Add GitHub API specific fields
      node_id: 'PR_123456',
      user: {
        login: TEST_OWNER,
        id: 1,
        node_id: 'U_1',
        avatar_url: 'https://github.com/test-owner.png',
        gravatar_id: '',
        url: `https://api.github.com/users/${TEST_OWNER}`,
        html_url: `https://github.com/${TEST_OWNER}`,
        type: 'User',
        site_admin: false
      },
      html_url: `https://github.com/${TEST_OWNER}/${TEST_REPO}/pull/${TEST_PR_NUMBER}`,
      url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}`
    },
    status: 200,
    url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}`,
    headers: {}
  },
  pullRequestReview: {
    data: {
      ...mockPullRequestReview,
      user: {
        login: mockPullRequestReview.user.login,
        avatar_url: mockPullRequestReview.user.avatarUrl,
        type: mockPullRequestReview.user.type,
        id: 111,
        node_id: 'U_111',
        url: `https://api.github.com/users/${mockPullRequestReview.user.login}`,
        html_url: `https://github.com/${mockPullRequestReview.user.login}`,
        site_admin: false
      }
    },
    status: 200,
    url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
    headers: {}
  },
  rateLimit: {
    data: mockRateLimit,
    status: 200,
    url: 'https://api.github.com/rate_limit',
    headers: {}
  }
};
