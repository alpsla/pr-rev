import { jest } from '@jest/globals';
import type { RestEndpointMethodTypes } from '@octokit/rest';

type RepoGetResponse = RestEndpointMethodTypes['repos']['get']['response'];
export type RepoData = RepoGetResponse['data'];

export type MockResponse<T> = {
  data: T;
  status: number;
  url: string;
  headers: {
    'x-ratelimit-limit': string;
    'x-ratelimit-remaining': string;
    'x-ratelimit-reset': string;
  };
};

export const createMockResponse = <T>(data: T): MockResponse<T> => ({
  data,
  status: 200,
  url: 'https://api.github.com/test',
  headers: {
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString()
  }
});

export type RateLimitResponse = {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    search: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    graphql: {
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
};

export const createRateLimitResponse = (): RateLimitResponse => ({
  resources: {
    core: {
      limit: 5000,
      remaining: 4999,
      reset: Math.floor(Date.now() / 1000 + 3600),
      used: 1
    },
    search: {
      limit: 30,
      remaining: 29,
      reset: Math.floor(Date.now() / 1000 + 3600),
      used: 1
    },
    graphql: {
      limit: 5000,
      remaining: 4999,
      reset: Math.floor(Date.now() / 1000 + 3600),
      used: 1
    }
  },
  rate: {
    limit: 5000,
    remaining: 4999,
    reset: Math.floor(Date.now() / 1000 + 3600),
    used: 1
  }
});

export type MockFunctions = {
  mockReposGet: jest.Mock;
  mockRateLimitGet: jest.Mock;
};

export type MockOctokit = {
  rest: {
    repos: {
      get: jest.Mock;
    };
  };
  rateLimit: {
    get: jest.Mock;
  };
};

export const createOctokitMocks = () => {
  const mockReposGet = jest.fn();
  const mockRateLimitGet = jest.fn();

  const mocks: MockFunctions = {
    mockReposGet,
    mockRateLimitGet
  };

  const mockOctokit: MockOctokit = {
    rest: {
      repos: {
        get: mockReposGet
      }
    },
    rateLimit: {
      get: mockRateLimitGet
    }
  };

  return {
    mocks,
    mockOctokit
  };
};
