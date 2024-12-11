import { jest } from '@jest/globals';
import type { Octokit } from '@octokit/rest';

export const createMockOctokit = () => ({
  rest: {
    repos: {
      get: jest.fn(),
    },
    pulls: {
      get: jest.fn(),
      listReviews: jest.fn(),
    },
    rateLimit: {
      get: jest.fn(),
    },
  },
  request: jest.fn(),
  graphql: jest.fn(),
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  hook: {
    before: jest.fn(),
    after: jest.fn(),
    error: jest.fn(),
    wrap: jest.fn(),
  },
  auth: jest.fn(),
  paginate: jest.fn(),
}) as unknown as jest.Mocked<Octokit>;
