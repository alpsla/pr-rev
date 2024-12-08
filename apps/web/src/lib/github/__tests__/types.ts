import type { Octokit } from '@octokit/rest';
import type { OctokitResponse } from '@octokit/types';

export interface GitHubError extends Error {
  status?: number;
}

export type RateLimitResponse = OctokitResponse<{
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
  };
  rate: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  };
}, 200>;

export type MockedFunction<T> = jest.Mock & {
  mockResolvedValue: (value: T) => MockedFunction<T>;
  mockResolvedValueOnce: (value: T) => MockedFunction<T>;
  mockRejectedValue: (value: unknown) => MockedFunction<T>;
  mockRejectedValueOnce: (value: unknown) => MockedFunction<T>;
  endpoint?: {
    merge: jest.Mock;
    parse: jest.Mock;
    defaults: jest.Mock;
  };
  defaults?: jest.Mock;
};

export type MockedOctokit = {
  rest: {
    pulls: {
      get: MockedFunction<ReturnType<Octokit['rest']['pulls']['get']>>;
      listReviews: MockedFunction<ReturnType<Octokit['rest']['pulls']['listReviews']>>;
      listReviewComments: MockedFunction<ReturnType<Octokit['rest']['pulls']['listReviewComments']>>;
    };
    repos: {
      get: MockedFunction<ReturnType<Octokit['rest']['repos']['get']>>;
      listForOrg: MockedFunction<ReturnType<Octokit['rest']['repos']['listForOrg']>>;
      listCommits: MockedFunction<ReturnType<Octokit['rest']['repos']['listCommits']>>;
    };
  };
  rateLimit: {
    get: MockedFunction<Promise<RateLimitResponse>>;
  };
  request: MockedFunction<ReturnType<Octokit['request']>>;
  paginate: MockedFunction<ReturnType<Octokit['paginate']>> & {
    iterator: MockedFunction<ReturnType<Octokit['paginate']['iterator']>>;
  };
};

export type GitHubLicense = {
  key: string;
  name: string;
  url: string | null;
  spdx_id: string | null;
  node_id: string;
  html_url?: string;
};
