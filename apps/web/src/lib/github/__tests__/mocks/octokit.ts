import { jest } from '@jest/globals';
import type { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/rest';

// Define the function types
type GetRepoFn = (params: RestEndpointMethodTypes['repos']['get']['parameters']) => 
  Promise<RestEndpointMethodTypes['repos']['get']['response']>;

type GetPullFn = (params: RestEndpointMethodTypes['pulls']['get']['parameters']) => 
  Promise<RestEndpointMethodTypes['pulls']['get']['response']>;

type ListReviewsFn = (params: RestEndpointMethodTypes['pulls']['listReviews']['parameters']) => 
  Promise<RestEndpointMethodTypes['pulls']['listReviews']['response']>;

type GetRateLimitFn = () => Promise<RestEndpointMethodTypes['rateLimit']['get']['response']>;

export const createMockOctokit = () => ({
  rest: {
    repos: {
      get: jest.fn() as jest.MockedFunction<GetRepoFn>
    },
    pulls: {
      get: jest.fn() as jest.MockedFunction<GetPullFn>,
      listReviews: jest.fn() as jest.MockedFunction<ListReviewsFn>
    },
    rateLimit: {
      get: jest.fn() as jest.MockedFunction<GetRateLimitFn>
    }
  },
  request: jest.fn(),
  graphql: jest.fn(),
  paginate: jest.fn(),
  hook: {
    before: jest.fn(),
    after: jest.fn(),
    error: jest.fn(),
    wrap: jest.fn()
  }
}) as unknown as jest.Mocked<Octokit>;
