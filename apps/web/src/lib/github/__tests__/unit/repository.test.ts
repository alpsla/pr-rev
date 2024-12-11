import { GitHubService } from '../../api';
import { createMockContext as createPrismaMockContext } from '../mocks/prisma';
import { createMockContext as createTestMockContext } from '../utils/mock-factory';
import { setupSuccessfulMocks, setupNotFoundErrorMocks, setupAuthenticationErrorMocks } from '../utils/mock-factory';
import { expectRepositoryData, expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';
import { createMockOctokit } from '../mocks/octokit';

describe('GitHubService - Repository Operations', () => {
  const prismaMock = createPrismaMockContext();
  const testMock = createTestMockContext();
  const octokit = createMockOctokit();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      prismaMock.prisma,
      octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepository', () => {
    it('should fetch and transform repository data', async () => {
      // Setup
      setupSuccessfulMocks({ ...testMock, octokit });

      // Execute
      const result = await service.getRepository(TEST_OWNER, TEST_REPO);

      // Verify
      expectRepositoryData(result, {
        id: testMock.responses.repository.data.id,
        name: TEST_REPO,
        fullName: `${TEST_OWNER}/${TEST_REPO}`,
        settings: {
          id: `${testMock.responses.repository.data.id}-settings`,
          repositoryId: testMock.responses.repository.data.id.toString(),
          autoMergeEnabled: true,
          requireApprovals: 1,
          protectedBranches: ['main'],
          allowedMergeTypes: ['merge', 'squash', 'rebase']
        }
      });

      // Verify API call
      expect(octokit.rest.repos.get).toHaveBeenCalledWith({
        owner: TEST_OWNER,
        repo: TEST_REPO
      });
      expect(octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should use cached data for subsequent requests', async () => {
      // Setup
      setupSuccessfulMocks({ ...testMock, octokit });

      // First request
      const result1 = await service.getRepository(TEST_OWNER, TEST_REPO);
      
      // Second request
      const result2 = await service.getRepository(TEST_OWNER, TEST_REPO);

      // Verify
      expect(result1).toEqual(result2);
      expect(octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should handle repository not found', async () => {
      // Setup
      setupNotFoundErrorMocks({ ...testMock, octokit });

      // Execute & Verify
      await expectGitHubError(
        service.getRepository(TEST_OWNER, 'non-existent'),
        404,
        'Not Found'
      );
    });

    it('should handle authentication errors', async () => {
      // Setup
      setupAuthenticationErrorMocks({ ...testMock, octokit });

      // Execute & Verify
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );
    });

    it('should clear cache on error', async () => {
      // Setup
      setupSuccessfulMocks({ ...testMock, octokit });

      // First request succeeds
      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Second request fails
      setupAuthenticationErrorMocks({ ...testMock, octokit });
      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );

      // Third request should hit the API again
      setupSuccessfulMocks({ ...testMock, octokit });
      await service.getRepository(TEST_OWNER, TEST_REPO);

      expect(octokit.rest.repos.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('destroy', () => {
    it('should clear cache and disconnect prisma', async () => {
      // Setup
      setupSuccessfulMocks({ ...testMock, octokit });
      await service.getRepository(TEST_OWNER, TEST_REPO);

      // Execute
      await service.destroy();

      // Verify cache is cleared (next request should hit API)
      setupSuccessfulMocks({ ...testMock, octokit });
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(octokit.rest.repos.get).toHaveBeenCalledTimes(2);

      // Verify prisma disconnect was called
      expect(prismaMock.prisma.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
