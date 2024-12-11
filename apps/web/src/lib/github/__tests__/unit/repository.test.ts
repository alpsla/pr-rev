import { GitHubService } from '../../api';
import { createMockContext, setupSuccessfulMocks, setupNotFoundErrorMocks, setupAuthenticationErrorMocks } from '../utils/mock-factory';
import { expectRepositoryData, expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';

describe('GitHubService - Repository Operations', () => {
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

  describe('getRepository', () => {
    it('should fetch and transform repository data', async () => {
      // Setup
      setupSuccessfulMocks(ctx);

      // Execute
      const result = await service.getRepository(TEST_OWNER, TEST_REPO);

      // Verify
      expectRepositoryData(result, {
        id: ctx.responses.repository.data.id,
        name: TEST_REPO,
        fullName: `${TEST_OWNER}/${TEST_REPO}`,
        settings: {
          id: `${ctx.responses.repository.data.id}-settings`,
          repositoryId: ctx.responses.repository.data.id.toString(),
          autoMergeEnabled: true,
          requireApprovals: 1,
          protectedBranches: ['main'],
          allowedMergeTypes: ['merge', 'squash', 'rebase']
        }
      });

      // Verify API call
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledWith({
        owner: TEST_OWNER,
        repo: TEST_REPO
      });
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should use cached data for subsequent requests', async () => {
      // Setup
      setupSuccessfulMocks(ctx);

      // First request
      const result1 = await service.getRepository(TEST_OWNER, TEST_REPO);
      
      // Second request
      const result2 = await service.getRepository(TEST_OWNER, TEST_REPO);

      // Verify
      expect(result1).toEqual(result2);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should handle repository not found', async () => {
      // Setup
      setupNotFoundErrorMocks(ctx);

      // Execute & Verify
      await expectGitHubError(
        service.getRepository(TEST_OWNER, 'non-existent'),
        404,
        'Not Found'
      );
    });

    it('should handle authentication errors', async () => {
      // Setup
      setupAuthenticationErrorMocks(ctx);

      // Execute & Verify
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );
    });

    it('should clear cache on error', async () => {
      // Setup
      setupSuccessfulMocks(ctx);

      // First request succeeds
      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request fails
      setupAuthenticationErrorMocks(ctx);
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );

      // Third request should hit the API again
      setupSuccessfulMocks(ctx);
      await service.getRepository(TEST_OWNER, TEST_REPO);

      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('destroy', () => {
    it('should clear cache and disconnect prisma', async () => {
      // Setup
      setupSuccessfulMocks(ctx);
      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Execute
      await service.destroy();

      // Verify cache is cleared (next request should hit API)
      setupSuccessfulMocks(ctx);
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);

      // Verify prisma disconnect was called
      expect(ctx.prisma.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
