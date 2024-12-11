import { GitHubService } from '../../api';
import { createMockContext } from '../utils/mock-factory';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';
import { createMockRepositoryResponse, createMockPullRequestResponse } from '../utils/mock-responses';

describe('GitHubService - Retry Mechanism', () => {
  const ctx = createMockContext();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Rate Limit Retries', () => {
    it('should retry on rate limit with exponential backoff', async () => {
      // First three attempts fail with rate limit
      const rateLimitError = {
        response: {
          status: 403,
          data: { message: 'API rate limit exceeded' }
        }
      };

      ctx.octokit.rest.repos.get
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError);

      const promise = service.getRepository(TEST_OWNER, TEST_REPO);

      // Should retry with exponential backoff (1000ms, 2000ms, 4000ms)
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(2000); // Second retry
      jest.advanceTimersByTime(4000); // Third retry

      await expect(promise).rejects.toThrow('API rate limit exceeded');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });

    it('should succeed after rate limit retry', async () => {
      // First attempt fails with rate limit
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { message: 'API rate limit exceeded' }
        }
      });

      // Second attempt succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      const promise = service.getRepository(TEST_OWNER, TEST_REPO);
      jest.advanceTimersByTime(1000); // First retry delay

      const result = await promise;
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Network Error Retries', () => {
    it('should retry on network errors', async () => {
      // First three attempts fail with network error
      const networkError = new Error('Network Error');
      ctx.octokit.rest.repos.get
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError);

      const promise = service.getRepository(TEST_OWNER, TEST_REPO);

      // Should retry with exponential backoff
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(2000); // Second retry
      jest.advanceTimersByTime(4000); // Third retry

      await expect(promise).rejects.toThrow('Network Error');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });

    it('should succeed after network error retry', async () => {
      // First attempt fails with network error
      ctx.octokit.rest.repos.get.mockRejectedValueOnce(
        new Error('Network Error')
      );

      // Second attempt succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      const promise = service.getRepository(TEST_OWNER, TEST_REPO);
      jest.advanceTimersByTime(1000); // First retry delay

      const result = await promise;
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Server Error Retries', () => {
    it('should retry on 5xx errors', async () => {
      // First three attempts fail with server error
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };

      ctx.octokit.rest.repos.get
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError);

      const promise = service.getRepository(TEST_OWNER, TEST_REPO);

      // Should retry with exponential backoff
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(2000); // Second retry
      jest.advanceTimersByTime(4000); // Third retry

      await expect(promise).rejects.toThrow('Internal Server Error');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });

    it('should succeed after server error retry', async () => {
      // First attempt fails with server error
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      // Second attempt succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      const promise = service.getRepository(TEST_OWNER, TEST_REPO);
      jest.advanceTimersByTime(1000); // First retry delay

      const result = await promise;
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Non-Retryable Errors', () => {
    it('should not retry on 404 errors', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      });

      await expect(service.getRepository(TEST_OWNER, TEST_REPO))
        .rejects.toThrow('Not Found');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry on validation errors', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 422,
          data: {
            message: 'Validation Failed',
            errors: [{ resource: 'Repository', code: 'custom_field_key' }]
          }
        }
      });

      await expect(service.getRepository(TEST_OWNER, TEST_REPO))
        .rejects.toThrow('Validation Failed');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry on authentication errors', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Bad credentials' }
        }
      });

      await expect(service.getRepository(TEST_OWNER, TEST_REPO))
        .rejects.toThrow('Bad credentials');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry State Management', () => {
    it('should reset retry count after successful request', async () => {
      // First request succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request fails with retryable error
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };

      ctx.octokit.rest.repos.get
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError);

      const promise = service.getRepository(TEST_OWNER, TEST_REPO);

      // Should start retry count from 0
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(2000); // Second retry
      jest.advanceTimersByTime(4000); // Third retry

      await expect(promise).rejects.toThrow('Internal Server Error');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(4); // 1 success + 3 retries
    });

    it('should maintain separate retry states for different operations', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };

      // Repository request fails with retries
      ctx.octokit.rest.repos.get
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError);

      const repoPromise = service.getRepository(TEST_OWNER, TEST_REPO);

      // PR request succeeds immediately
      ctx.octokit.rest.pulls.get.mockResolvedValueOnce({
        data: createMockPullRequestResponse(TEST_OWNER, TEST_REPO, 1),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/1`,
        headers: {}
      });

      const prPromise = service.getPullRequest(TEST_OWNER, TEST_REPO, 1);

      // Advance time for repository retries
      jest.advanceTimersByTime(1000); // First retry
      jest.advanceTimersByTime(2000); // Second retry
      jest.advanceTimersByTime(4000); // Third retry

      await expect(repoPromise).rejects.toThrow('Internal Server Error');
      const prResult = await prPromise;

      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
      expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(1);
      expect(prResult).toBeDefined();
    });
  });
});
