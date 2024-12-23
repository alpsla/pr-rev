import { GitHubService } from '../../api';
import { createMockContext } from '../utils/mock-factory';
import { 
  GitHubError, 
  ServerError, 
  ValidationError, 
  RateLimitError, 
  AuthenticationError 
} from '../../errors';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';
import { createMockRepositoryResponse } from '../utils/mock-responses';
import { 
  expectGitHubError,
  expectErrorType, 
  expectErrorContext,
  expectRequestContext 
} from '../utils/test-helpers';

describe('GitHubService - Error Utilities', () => {
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

  describe('Error Classification', () => {
    it('should classify 404 errors as GitHubError', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        404,
        'Not Found'
      ) as GitHubError;

      expectErrorType(error, GitHubError);
      expectErrorContext(error, { status: 404 });
      expect(error.name).toBe('GitHubError');
    });

    it('should classify 500+ errors as ServerError', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      ) as GitHubError;

      expectErrorType(error, ServerError);
      expectRequestContext(error);
      expect(error.name).toBe('ServerError');
    });

    it('should classify network errors as GitHubError', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        code: 'ECONNREFUSED',
        message: 'Network Error'
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Network Error'
      ) as GitHubError;

      expectErrorType(error, GitHubError);
      expectErrorContext(error, { code: 'ECONNREFUSED' });
      expect(error.status).toBe(500);
    });
  });

  describe('Error Data Preservation', () => {
    it('should preserve error response data', async () => {
      const errorData = {
        message: 'Validation Failed',
        errors: [
          { resource: 'Repository', code: 'custom_field_key' }
        ],
        documentation_url: 'https://docs.github.com/rest/reference/repos'
      };

      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 422,
          data: errorData
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        422,
        'Validation Failed'
      ) as GitHubError;

      expectErrorType(error, ValidationError);
      expectErrorContext(error, {
        action: 'get_repository',
        owner: TEST_OWNER,
        repo: TEST_REPO
      });
      expect(error.data).toEqual(errorData);
    });

    it('should handle errors without response data', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      ) as GitHubError;

      expectErrorType(error, ServerError);
      expectRequestContext(error);
      expect(error.data).toBeUndefined();
    });
  });

  describe('Error Message Formatting', () => {
    it('should format validation error messages', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 422,
          data: {
            message: 'Validation Failed',
            errors: [
              { resource: 'Repository', field: 'name', code: 'invalid' }
            ]
          }
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        422,
        'Validation Failed'
      ) as GitHubError;

      expectErrorType(error, ValidationError);
      expectRequestContext(error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toContain('Validation Failed');
    });

    it('should handle rate limit error messages', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            message: 'API rate limit exceeded',
            documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
          },
          headers: {
            'x-ratelimit-limit': '5000',
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': '1609459200'
          }
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      ) as GitHubError;

      expectErrorType(error, RateLimitError);
      expectRequestContext(error);
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toContain('API rate limit exceeded');
    });

    it('should handle authentication error messages', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            message: 'Bad credentials',
            documentation_url: 'https://docs.github.com/rest'
          }
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      ) as GitHubError;

      expectErrorType(error, AuthenticationError);
      expectRequestContext(error);
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toContain('Bad credentials');
    });
  });

  describe('Error Recovery', () => {
    it('should allow operations after error recovery', async () => {
      // First request fails
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      ) as GitHubError;

      expectErrorType(error, ServerError);

      // Second request succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      const result = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
    });

    it('should clear cache after error', async () => {
      // First request succeeds
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request fails
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      const error = await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Internal Server Error'
      ) as GitHubError;

      expectErrorType(error, ServerError);

      // Third request should hit API again (cache was cleared)
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });
  });
});
