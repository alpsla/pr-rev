import { GitHubService } from '../../api';
import { 
  createMockContext, 
  setupNetworkErrorMocks, 
  setupServerErrorMocks, 
  setupRateLimitExceededMocks,
  setupValidationErrorMocks,
  setupResourceConflictMocks,
  setupSecondaryRateLimitMocks,
  setupInvalidResponseMocks
} from '../utils/mock-factory';
import { 
  expectGitHubError, 
  expectErrorContext,
  expectRateLimitContext,
  expectRequestContext,
  expectErrorType
} from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';
import {
  ValidationError,
  ResourceConflictError,
  ApiQuotaExceededError,
  RateLimitError,
  NetworkError,
  ServerError,
  GitHubError
} from '../../errors';

describe('GitHubService - Error Handling', () => {
  const ctx = createMockContext();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limit Handling', () => {
    it('should handle rate limit exceeded errors', async () => {
      setupRateLimitExceededMocks(ctx, {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1609459200'
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      ) as GitHubError;

      expectErrorType(error, RateLimitError);
      expectRateLimitContext(error);
      expect(error.name).toBe('RateLimitError');
    });

    it('should handle secondary rate limit errors', async () => {
      setupSecondaryRateLimitMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'secondary rate limit'
      ) as GitHubError;

      expectErrorType(error, ApiQuotaExceededError);
      expectRequestContext(error);
      expect(error.name).toBe('ApiQuotaExceededError');
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle validation errors from GitHub API', async () => {
      setupValidationErrorMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        422,
        'Validation Failed'
      ) as GitHubError;

      expectErrorType(error, ValidationError);
      expectRequestContext(error);
      expect(error.name).toBe('ValidationError');
    });

    it('should handle invalid response data', async () => {
      setupInvalidResponseMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        200,
        'Invalid response from GitHub API'
      ) as GitHubError;

      expectErrorType(error, ValidationError);
      expectErrorContext(error, { action: 'get_repository' });
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('Resource Conflict Handling', () => {
    it('should handle resource conflict errors', async () => {
      setupResourceConflictMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        409,
        'Resource conflict'
      ) as GitHubError;

      expectErrorType(error, ResourceConflictError);
      expectRequestContext(error);
      expect(error.name).toBe('ResourceConflictError');
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors', async () => {
      setupNetworkErrorMocks(ctx, 'ECONNREFUSED');

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Network error'
      ) as GitHubError;

      expectErrorType(error, NetworkError);
      expectErrorContext(error, { code: 'ECONNREFUSED' });
      expect(error.name).toBe('NetworkError');
    });

    it('should handle timeout errors', async () => {
      setupNetworkErrorMocks(ctx, 'ETIMEDOUT');

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Network error'
      ) as GitHubError;

      expectErrorType(error, NetworkError);
      expectErrorContext(error, { code: 'ETIMEDOUT' });
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('Server Error Handling', () => {
    it('should handle server errors', async () => {
      setupServerErrorMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      ) as GitHubError;

      expectErrorType(error, ServerError);
      expectRequestContext(error);
      expect(error.name).toBe('ServerError');
    });
  });

  describe('Error Context', () => {
    it('should include timestamp in all error contexts', async () => {
      setupServerErrorMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500
      ) as GitHubError;

      expectErrorContext(error, {});
      expect(error.context?.timestamp).toBeDefined();
      expect(new Date(error.context?.timestamp as string).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should include request details in error context', async () => {
      setupServerErrorMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500
      ) as GitHubError;

      expectRequestContext(error);
      expect(error.context?.method).toBe('GET');
      expect(error.context?.endpoint).toContain('/repos/');
    });

    it('should include operation context in error', async () => {
      setupServerErrorMocks(ctx);

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500
      ) as GitHubError;

      expectErrorContext(error, {
        action: 'get_repository',
        owner: TEST_OWNER,
        repo: TEST_REPO
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover after errors when API becomes available', async () => {
      // First request fails with network error
      setupNetworkErrorMocks(ctx);
      const networkError = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Network error'
      ) as GitHubError;
      expectErrorType(networkError, NetworkError);

      // Second request fails with rate limit
      setupRateLimitExceededMocks(ctx);
      const rateLimitError = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      ) as GitHubError;
      expectErrorType(rateLimitError, RateLimitError);

      // Third request fails with server error
      setupServerErrorMocks(ctx);
      const serverError = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      ) as GitHubError;
      expectErrorType(serverError, ServerError);

      // Verify all requests were made
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledWith({
        owner: TEST_OWNER,
        repo: TEST_REPO
      });
    });
  });
});
