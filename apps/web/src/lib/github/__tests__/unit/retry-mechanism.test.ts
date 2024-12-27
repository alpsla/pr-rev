import { GitHubService } from '../../github-service';
import { createMockContext, MockContext } from '../mocks/prisma';
import { TEST_OWNER, TEST_REPO } from '../utils/test-helpers';
import { RateLimitError, NetworkError, ServerError } from '../../errors';
import type { Octokit } from '@octokit/rest';
import type { OctokitResponse } from '@octokit/types';

// Create a partial mock type that matches the structure we need
type MockResponse = OctokitResponse<{
  id: number;
  name: string;
  full_name: string;
}>;

type MockGetFunction = jest.Mock<Promise<MockResponse>> & {
  defaults: Record<string, unknown>;
  endpoint: Record<string, unknown>;
};

type PartialOctokit = {
  repos: {
    get: MockGetFunction;
  };
};

describe('GitHubService - Retry Mechanism', () => {
  // Create the mock with the required structure
  const getMock = jest.fn() as MockGetFunction;
  getMock.defaults = {};
  getMock.endpoint = {};

  const mockOctokit: PartialOctokit = {
    repos: {
      get: getMock
    }
  };

  const mockConfig = {
    appId: 'test-app',
    privateKey: 'test-key',
    clientId: 'test-client',
    clientSecret: 'test-secret'
  };

  let service: GitHubService;
  let ctx: MockContext;

  beforeEach(() => {
    ctx = createMockContext();
    service = new GitHubService(ctx.prisma, mockOctokit as unknown as Octokit, mockConfig);
    jest.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should throw RateLimitError when rate limit is exceeded', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 403,
        response: {
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': '1609459200'
          }
        }
      });

      await expect(service.getRepository(TEST_OWNER, TEST_REPO))
        .rejects
        .toThrow(RateLimitError);
    });
  });

  describe('Network Errors', () => {
    it('should throw NetworkError on connection failure', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 0,
        code: 'ECONNREFUSED'
      });

      await expect(service.getRepository(TEST_OWNER, TEST_REPO))
        .rejects
        .toThrow(NetworkError);
    });
  });

  describe('Server Errors', () => {
    it('should throw ServerError on 500 response', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 500,
        response: {
          data: {
            message: 'Internal server error'
          }
        }
      });

      await expect(service.getRepository(TEST_OWNER, TEST_REPO))
        .rejects
        .toThrow(ServerError);
    });

    it('should throw ServerError on 502 response', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 502,
        response: {
          data: {
            message: 'Bad gateway'
          }
        }
      });

      await expect(service.getRepository(TEST_OWNER, TEST_REPO))
        .rejects
        .toThrow(ServerError);
    });
  });
});
