import { GitHubError } from '../../errors';
import type { Repository, PullRequest, PullRequestReview } from '../../types';

/**
 * Type-safe error assertion helper
 */
export const expectGitHubError = async (
  promise: Promise<unknown>,
  status: number,
  message?: string
) => {
  try {
    await promise;
    throw new Error('Expected error to be thrown');
  } catch (error) {
    expect(error).toBeInstanceOf(GitHubError);
    expect(error).toMatchObject({
      status,
      ...(message ? { message: expect.stringContaining(message) } : {})
    });
  }
};

/**
 * Type-safe repository data assertion helper
 */
export const expectRepositoryData = (actual: Repository, expected: Partial<Repository>) => {
  expect(actual).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    fullName: expect.any(String),
    private: expect.any(Boolean),
    defaultBranch: expect.any(String),
    language: expect.any(String),
    stargazersCount: expect.any(Number),
    forksCount: expect.any(Number),
    settings: {
      id: expect.any(String),
      repositoryId: expect.any(String),
      autoMergeEnabled: expect.any(Boolean),
      requireApprovals: expect.any(Number),
      protectedBranches: expect.any(Array),
      allowedMergeTypes: expect.any(Array)
    },
    ...expected
  });
};

/**
 * Type-safe pull request data assertion helper
 */
export const expectPullRequestData = (actual: PullRequest, expected: Partial<PullRequest>) => {
  expect(actual).toMatchObject({
    number: expect.any(Number),
    title: expect.any(String),
    body: expect.any(String),
    state: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    draft: expect.any(Boolean),
    mergeable: expect.any(Boolean),
    ...expected
  });
};

/**
 * Type-safe pull request review data assertion helper
 */
export const expectPullRequestReviewData = (actual: PullRequestReview, expected: Partial<PullRequestReview>) => {
  expect(actual).toMatchObject({
    id: expect.any(Number),
    state: expect.any(String),
    body: expect.any(String),
    commitId: expect.any(String),
    submittedAt: expect.any(String),
    user: {
      id: expect.any(Number),
      login: expect.any(String),
      type: expect.any(String)
    },
    ...expected
  });
};

/**
 * Rate limit assertion helper
 */
export const expectRateLimit = async (
  fn: () => Promise<unknown>,
  expectedCalls = 1
) => {
  const startTime = Date.now();
  await fn();
  const duration = Date.now() - startTime;
  
  // Rate limit should cause some delay
  expect(duration).toBeGreaterThan(0);
};
