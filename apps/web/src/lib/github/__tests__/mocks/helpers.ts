import { jest } from '@jest/globals';
import type { Octokit } from '@octokit/rest';
import type { OctokitResponse } from '@octokit/types';

export const createMockResponse = <T>(data: T): OctokitResponse<T, 200> => ({
  data,
  status: 200,
  url: 'https://api.github.com/test',
  headers: {
    'x-github-media-type': 'github.v3; format=json',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString()
  }
});

type JestMockWithEndpoint = jest.Mock & {
  endpoint: {
    merge: jest.Mock;
    parse: jest.Mock;
    defaults: jest.Mock;
  };
  defaults: jest.Mock;
};

const createEndpointDefaults = () => ({
  merge: jest.fn(),
  parse: jest.fn(),
  defaults: jest.fn()
});

const createMockFunction = (): JestMockWithEndpoint => {
  const fn = jest.fn() as JestMockWithEndpoint;
  fn.endpoint = createEndpointDefaults();
  fn.defaults = jest.fn().mockReturnValue(fn);
  return fn;
};

const rateLimitData = {
  resources: {
    core: {
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
};

export const createOctokitMock = () => {
  const rateLimitFn = jest.fn() as jest.MockedFunction<() => Promise<OctokitResponse<typeof rateLimitData, 200>>>;
  rateLimitFn.mockResolvedValue(createMockResponse(rateLimitData));

  const authFn = jest.fn() as jest.MockedFunction<() => Promise<{ type: string; token: string; }>>;
  authFn.mockResolvedValue({ type: 'token', token: 'test-token' });

  const mock = {
    rest: {
      pulls: {
        get: createMockFunction(),
        listReviews: createMockFunction(),
        listReviewComments: createMockFunction(),
        create: createMockFunction(),
        update: createMockFunction(),
        list: createMockFunction(),
        merge: createMockFunction(),
        checkIfMerged: createMockFunction()
      },
      repos: {
        get: createMockFunction(),
        listForOrg: createMockFunction(),
        listCommits: createMockFunction(),
        getBranch: createMockFunction(),
        listBranches: createMockFunction(),
        createCommitComment: createMockFunction(),
        listCommitComments: createMockFunction()
      },
      issues: {
        create: createMockFunction(),
        createComment: createMockFunction(),
        listComments: createMockFunction(),
        update: createMockFunction()
      }
    },
    rateLimit: {
      get: rateLimitFn
    },
    request: createMockFunction(),
    paginate: Object.assign(createMockFunction(), {
      iterator: createMockFunction()
    }),
    hook: {
      before: createMockFunction(),
      after: createMockFunction(),
      error: createMockFunction(),
      wrap: createMockFunction()
    },
    auth: authFn
  };

  return mock as unknown as Octokit;
};
