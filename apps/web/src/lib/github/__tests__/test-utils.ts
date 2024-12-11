import { testConfig } from './test-config';
import type { PullRequest, Repository, PullRequestReview } from '../types';
import type { Octokit } from '@octokit/rest';
import { mockRateLimitResponse, mockGithubRepoResponse } from './mocks/responses';
import { createMockOctokit } from './mocks/octokit';

// Create a mock Octokit instance for testing
export function createTestOctokit(): Octokit {
  const mockOctokit = createMockOctokit();
  mockOctokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  mockOctokit.rest.repos.get.mockResolvedValue(mockGithubRepoResponse);
  return mockOctokit as unknown as Octokit;
}

export function createTestPR(overrides: Partial<PullRequest> = {}): PullRequest {
  return {
    number: 1,
    title: 'Test PR',
    body: 'Test PR body',
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
    labels: [],
    mergeableState: 'mergeable',
    ciStatus: undefined,
    milestone: undefined,
    ...overrides
  };
}

export function createTestRepo(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 1,
    name: 'test-repo',
    fullName: 'test-owner/test-repo',
    private: false,
    description: 'Test repository',
    defaultBranch: 'main',
    language: 'TypeScript',
    stargazersCount: 0,
    forksCount: 0,
    organizationId: undefined,
    settings: {
      id: '1-settings',
      repositoryId: '1',
      autoMergeEnabled: false,
      requireApprovals: 1,
      protectedBranches: ['main'],
      allowedMergeTypes: ['merge', 'squash', 'rebase'],
      branchProtection: {}
    },
    ...overrides
  };
}

export function createTestReview(overrides: Partial<PullRequestReview> = {}): PullRequestReview {
  return {
    id: 1,
    user: {
      login: 'test-user',
      avatarUrl: 'https://github.com/images/error/octocat.gif',
      type: 'USER',
      role: 'REVIEWER'
    },
    body: 'Test review',
    state: 'APPROVED',
    commitId: 'abc123',
    submittedAt: new Date().toISOString(),
    ...overrides
  };
}

// Export testConfig to satisfy ESLint
export { testConfig };
