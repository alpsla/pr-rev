import { GitHubService } from '../api';
import { mockPrismaClient } from './mocks/prisma';
import { Octokit } from '@octokit/rest';
import { mockRequest, mockRepository, mockPullRequest, mockErrors } from './mocks/request';
import type { GitHubError, PrismaClient } from '../types';

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: mockRequest.intercept
  }))
}));

describe('Enhanced GitHub Service Tests', () => {
  let service: GitHubService;
  
  const TEST_REPO_OWNER = 'test-owner';
  const TEST_REPO_NAME = 'test-repo';

  beforeEach(() => {
    jest.clearAllMocks();
    
    service = new GitHubService(
      mockPrismaClient as unknown as PrismaClient,
      new Octokit({
        auth: 'test-token'
      }),
      {
        type: 'token',
        credentials: { token: 'test-token' }
      }
    );
  });

  describe('Repository Operations', () => {
    it('should fetch repository successfully', async () => {
      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      
      expect(repo).toEqual(mockRepository);
      expect(mockRequest.intercept).toHaveBeenCalledWith(
        expect.stringContaining(`/repos/${TEST_REPO_OWNER}/${TEST_REPO_NAME}`),
        expect.any(Object)
      );
    });

    it('should handle rate limiting with retry', async () => {
      // First call hits rate limit, second succeeds
      mockRequest.intercept
        .mockRejectedValueOnce(mockErrors.rateLimit)
        .mockResolvedValueOnce(mockRepository);

      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      
      expect(repo).toEqual(mockRepository);
      expect(mockRequest.intercept).toHaveBeenCalledTimes(2);
    });

    it('should handle non-existent repository', async () => {
      await expect(
        service.getRepository(TEST_REPO_OWNER, 'non-existent-repo')
      ).rejects.toMatchObject({
        status: 404,
        message: expect.stringContaining('Not Found')
      } as GitHubError);
    });
  });

  describe('Pull Request Operations', () => {
    it('should fetch pull request details', async () => {
      const pr = await service.getPullRequest(
        TEST_REPO_OWNER,
        TEST_REPO_NAME,
        1
      );

      expect(pr).toEqual(mockPullRequest);
      expect(mockRequest.intercept).toHaveBeenCalledWith(
        expect.stringContaining(`/repos/${TEST_REPO_OWNER}/${TEST_REPO_NAME}/pulls/1`),
        expect.any(Object)
      );
    });

    it('should handle pull request not found', async () => {
      mockRequest.intercept.mockRejectedValueOnce(mockErrors.notFound);

      await expect(
        service.getPullRequest(TEST_REPO_OWNER, TEST_REPO_NAME, 999)
      ).rejects.toMatchObject({
        status: 404,
        message: expect.stringContaining('Not Found')
      } as GitHubError);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid authentication', async () => {
      const invalidService = new GitHubService(
        mockPrismaClient as unknown as PrismaClient,
        new Octokit({
          auth: 'invalid-token'
        }),
        {
          type: 'token',
          credentials: { token: 'invalid-token' }
        }
      );

      await expect(
        invalidService.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toMatchObject({
        status: 401,
        message: expect.stringContaining('Bad credentials')
      } as GitHubError);
    });

    it('should handle server errors', async () => {
      mockRequest.intercept.mockRejectedValueOnce(mockErrors.serverError);

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toMatchObject({
        status: 500,
        message: expect.stringContaining('Internal Server Error')
      } as GitHubError);
    });

    it('should handle network errors', async () => {
      mockRequest.intercept.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toThrow('Network error');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit with exponential backoff', async () => {
      // Simulate rate limit for first two calls
      mockRequest.intercept
        .mockRejectedValueOnce(mockErrors.rateLimit)
        .mockRejectedValueOnce(mockErrors.rateLimit)
        .mockResolvedValueOnce(mockRepository);

      const startTime = Date.now();
      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      const duration = Date.now() - startTime;

      expect(repo).toEqual(mockRepository);
      expect(mockRequest.intercept).toHaveBeenCalledTimes(3);
      // Should have waited with exponential backoff
      expect(duration).toBeGreaterThan(3000); // Base delay (1s) + 2s + jitter
    });

    it('should fail after max retries', async () => {
      // Always return rate limit error
      mockRequest.intercept.mockRejectedValue(mockErrors.rateLimit);

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toMatchObject({
        status: 403,
        message: expect.stringContaining('API rate limit exceeded')
      } as GitHubError);

      // Should have tried the maximum number of times (3)
      expect(mockRequest.intercept).toHaveBeenCalledTimes(3);
    });
  });
});
