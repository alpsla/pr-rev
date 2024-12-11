import { GitHubError } from '../../errors';
import type { Repository, PullRequest, PullRequestReview } from '../../types';

type GitHubErrorConstructor = {
  new(message: string, status: number, originalError?: unknown, context?: Record<string, unknown>, data?: unknown): GitHubError;
};

type GitHubErrorSubclassConstructor = {
  new(message?: string, originalError?: unknown, context?: Record<string, unknown>): GitHubError;
};

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
    return error;
  }
};

/**
 * Error context assertion helper
 */
export const expectErrorContext = (error: unknown, expectedContext: Record<string, unknown>) => {
  expect(error).toBeInstanceOf(GitHubError);
  const gitHubError = error as GitHubError;
  
  // Common context fields that should always be present
  expect(gitHubError.context).toBeDefined();
  const context = gitHubError.context || {};
  expect(context.timestamp).toBeDefined();
  expect(new Date(context.timestamp as string).getTime()).toBeLessThanOrEqual(Date.now());

  // Check expected context fields
  Object.entries(expectedContext).forEach(([key, value]) => {
    expect(context[key]).toEqual(value);
  });
};

/**
 * Rate limit context assertion helper
 */
export const expectRateLimitContext = (error: unknown) => {
  expect(error).toBeInstanceOf(GitHubError);
  const gitHubError = error as GitHubError;
  const context = gitHubError.context || {};
  
  expect(context).toBeDefined();
  expect(context.limit).toBeDefined();
  expect(context.remaining).toBeDefined();
  expect(context.reset).toBeDefined();
};

/**
 * Request context assertion helper
 */
export const expectRequestContext = (error: unknown) => {
  expect(error).toBeInstanceOf(GitHubError);
  const gitHubError = error as GitHubError;
  const context = gitHubError.context || {};
  
  expect(context).toBeDefined();
  expect(context.method).toBeDefined();
  expect(context.endpoint).toBeDefined();
  expect(context.requestId).toBeDefined();
};

/**
 * Error type assertion helper
 */
export const expectErrorType = (
  error: unknown,
  ErrorClass: GitHubErrorConstructor | GitHubErrorSubclassConstructor
) => {
  expect(error).toBeInstanceOf(ErrorClass);
  expect(error).toBeInstanceOf(GitHubError);
  
  // Verify error has required properties
  const gitHubError = error as GitHubError;
  expect(gitHubError.message).toBeDefined();
  expect(gitHubError.status).toBeDefined();
  expect(gitHubError.context).toBeDefined();
  expect(gitHubError.name).toBe(ErrorClass.name);
};

/**
 * Error message assertion helper
 */
export const expectErrorMessage = (error: unknown, expectedMessage: string) => {
  expect(error).toBeInstanceOf(GitHubError);
  const gitHubError = error as GitHubError;
  expect(gitHubError.message).toEqual(expect.stringContaining(expectedMessage));
};

/**
 * Error data assertion helper
 */
export const expectErrorData = (error: unknown, expectedData: unknown) => {
  expect(error).toBeInstanceOf(GitHubError);
  const gitHubError = error as GitHubError;
  expect(gitHubError.data).toEqual(expectedData);
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
  let callCount = 0;

  try {
    await fn();
    callCount++;
  } catch (error) {
    callCount++;
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    expect(callCount).toBe(expectedCalls);
    expect(duration).toBeGreaterThan(0);
  }
};
