import { GitHubService } from '../../api';
import { createMockContext } from '../utils/mock-factory';
import { GitHubError, ServerError } from '../../errors';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';
import { createMockRepositoryResponse } from '../utils/mock-responses';

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

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Not Found');
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
    });

    it('should classify 500+ errors as ServerError', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof ServerError) {
          expect(error.message).toBe('Internal Server Error');
        } else {
          fail('Expected ServerError to be thrown');
        }
      }
    });

    it('should classify network errors as GitHubError', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce(
        new Error('Network Error')
      );

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.message).toBe('Network Error');
          expect(error.status).toBe(500);
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
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

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.status).toBe(422);
          expect(error.data).toEqual(errorData);
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
    });

    it('should handle errors without response data', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500
        }
      });

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof ServerError) {
          expect(error.message).toBe('Internal Server Error');
          expect(error.data).toBeUndefined();
        } else {
          fail('Expected ServerError to be thrown');
        }
      }
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

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.message).toBe('Validation Failed');
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
    });

    it('should handle rate limit error messages', async () => {
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            message: 'API rate limit exceeded',
            documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
          }
        }
      });

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.message).toBe('API rate limit exceeded');
          expect(error.status).toBe(403);
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
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

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.message).toBe('Bad credentials');
          expect(error.status).toBe(401);
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
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

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (!(error instanceof ServerError)) {
          fail('Expected ServerError to be thrown');
        }
      }

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

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (!(error instanceof ServerError)) {
          fail('Expected ServerError to be thrown');
        }
      }

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
