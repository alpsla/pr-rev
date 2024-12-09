import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { handlers } from '../msw/handlers';
import { GitHubService } from '../../api';
import { mockPrismaClient } from '../mocks/prisma';
import { Octokit } from '@octokit/rest';
import type { PrismaClient } from '../../types';

const server = setupServer(...handlers);
const GITHUB_API = 'https://api.github.com';

describe('GitHub Service Tests (Hybrid Approach)', () => {
  let service: GitHubService;
  
  // These would come from environment variables in CI
  const TEST_REPO_OWNER = process.env.GITHUB_TEST_OWNER || 'test-owner';
  const TEST_REPO_NAME = process.env.GITHUB_TEST_REPO || 'test-repo';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  beforeAll(() => {
    // Only enable MSW if we're not using real GitHub
    if (!GITHUB_TOKEN) {
      server.listen({ onUnhandledRequest: 'error' });
    }
  });

  afterAll(() => {
    if (!GITHUB_TOKEN) {
      server.close();
    }
  });

  beforeEach(() => {
    service = new GitHubService(
      mockPrismaClient as unknown as PrismaClient,
      new Octokit({
        auth: GITHUB_TOKEN || 'test-token'
      }),
      {
        type: 'token',
        credentials: { token: GITHUB_TOKEN || 'test-token' }
      }
    );
  });

  afterEach(() => {
    if (!GITHUB_TOKEN) {
      server.resetHandlers();
    }
  });

  describe('Real GitHub Tests', () => {
    // Skip these tests if no GitHub token is provided
    const itif = GITHUB_TOKEN ? it : it.skip;

    itif('should fetch real repository information', async () => {
      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      
      expect(repo).toMatchObject({
        name: expect.any(String),
        fullName: expect.stringContaining('/'),
        private: expect.any(Boolean),
        defaultBranch: expect.any(String)
      });
    });

    itif('should handle real pull request operations', async () => {
      // This assumes there's at least one PR in the test repo
      const pr = await service.getPullRequest(TEST_REPO_OWNER, TEST_REPO_NAME, 1);
      
      expect(pr).toMatchObject({
        number: expect.any(Number),
        title: expect.any(String),
        state: expect.any(String)
      });
    });
  });

  describe('MSW Tests (Edge Cases)', () => {
    // Only run these tests when using MSW
    const itif = !GITHUB_TOKEN ? it : it.skip;

    itif('should handle rate limiting', async () => {
      // Use MSW to simulate rate limit
      server.use(
        rest.get(`${GITHUB_API}/repos/:owner/:repo`, (req, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({
              message: 'API rate limit exceeded',
              documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
            })
          );
        })
      );

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toThrow('API rate limit exceeded');
    });

    itif('should handle non-existent repository', async () => {
      await expect(
        service.getRepository(TEST_REPO_OWNER, 'non-existent-repo')
      ).rejects.toThrow('Not Found');
    });

    itif('should handle network errors', async () => {
      server.use(
        rest.get(`${GITHUB_API}/repos/:owner/:repo`, (_req, res) => {
          return res.networkError('Failed to connect');
        })
      );

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toThrow();
    });
  });

  describe('Common Tests (Work with both Real and Mock)', () => {
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
      ).rejects.toThrow(/Bad credentials|Unauthorized/);
    });

    it('should transform repository data correctly', async () => {
      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      
      // These properties should exist regardless of real/mock data
      expect(repo).toHaveProperty('id');
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('fullName');
      expect(repo).toHaveProperty('settings');
      expect(repo.settings).toHaveProperty('allowedMergeTypes');
    });
  });
});
