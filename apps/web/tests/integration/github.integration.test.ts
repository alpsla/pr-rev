import { GitHubService } from '../../src/lib/github/github-service';
import { createMockContext } from '../../src/lib/github/__tests__/mocks/prisma';
import { createMockOctokit } from '../../src/lib/github/__tests__/mocks/github';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { Octokit } from '@octokit/rest';

describe('Github Service Integration Tests', () => {
  let githubService: GitHubService;
  const mockContext = createMockContext();
  const mockOctokit = createMockOctokit();

  beforeEach(() => {
    githubService = new GitHubService(
      mockContext.prisma,
      mockOctokit,
      {
        appId: 'test-app-id',
        privateKey: 'test-private-key',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      }
    );
  });

  describe('Repository Operations', () => {
    test('should get repository details', async () => {
      const mockRepo = {
        data: {
          id: 123,
          node_id: 'R_123',
          name: 'test-repo',
          full_name: 'test-owner/test-repo',
          private: false,
          owner: {
            login: 'test-owner',
            id: 456,
            node_id: 'U_456',
            avatar_url: 'https://example.com/avatar.png',
            html_url: 'https://github.com/test-owner',
            type: 'User'
          },
          html_url: 'https://github.com/test-owner/test-repo',
          description: 'Test repository',
          fork: false,
          url: 'https://api.github.com/repos/test-owner/test-repo',
          default_branch: 'main',
          language: 'TypeScript',
          stargazers_count: 10,
          watchers_count: 10,
          forks_count: 5,
          open_issues_count: 2,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z'
        },
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<Octokit['repos']['get']>>;

      mockOctokit.repos.get.mockResolvedValueOnce(mockRepo);

      const repo = await githubService.getRepository('test-owner', 'test-repo');
      expect(repo).toBeDefined();
      expect(repo.name).toBe('test-repo');
      expect(repo.owner.login).toBe('test-owner');
    });
  });

  describe('Pull Request Operations', () => {
    test('should get pull request details', async () => {
      const mockPR = {
        data: {
          url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
          id: 789,
          node_id: 'PR_789',
          number: 1,
          state: 'open',
          title: 'Test PR',
          user: {
            login: 'test-user',
            id: 789,
            node_id: 'U_789',
            avatar_url: 'https://example.com/user-avatar.png',
            html_url: 'https://github.com/test-user',
            type: 'User'
          },
          body: 'Test PR description',
          created_at: '2023-01-03T00:00:00Z',
          updated_at: '2023-01-04T00:00:00Z',
          head: {
            ref: 'feature-branch',
            sha: 'abc123',
            repo: {
              id: 123,
              name: 'test-repo',
              full_name: 'test-owner/test-repo'
            }
          },
          base: {
            ref: 'main',
            sha: 'def456',
            repo: {
              id: 123,
              name: 'test-repo',
              full_name: 'test-owner/test-repo'
            }
          },
          merged: false,
          mergeable: true,
          mergeable_state: 'clean',
          comments: 0,
          review_comments: 0,
          commits: 1,
          additions: 10,
          deletions: 5,
          changed_files: 2
        },
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<Octokit['pulls']['get']>>;

      mockOctokit.pulls.get.mockResolvedValueOnce(mockPR);

      const pr = await githubService.getPullRequest('test-owner', 'test-repo', 1);
      expect(pr).toBeDefined();
      expect(pr.number).toBe(1);
      expect(pr.title).toBe('Test PR');
    });

    test('should handle non-existent pull request', async () => {
      mockOctokit.pulls.get.mockRejectedValueOnce({
        status: 404,
        message: 'Not Found',
        headers: {},
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/999999'
      });

      await expect(
        githubService.getPullRequest('test-owner', 'test-repo', 999999)
      ).rejects.toThrow();
    });

    test('should get pull request reviews', async () => {
      const mockReviews = {
        data: [{
          id: 1,
          node_id: 'PRR_1',
          user: {
            login: 'reviewer1',
            id: 123,
            node_id: 'U_123',
            avatar_url: 'https://example.com/reviewer1.png',
            type: 'User',
            site_admin: false
          },
          body: 'LGTM',
          state: 'APPROVED',
          commit_id: 'abc123',
          submitted_at: '2024-01-01T00:00:00Z'
        }],
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<Octokit['pulls']['listReviews']>>;

      mockOctokit.pulls.listReviews.mockResolvedValueOnce(mockReviews);

      const reviews = await githubService.getPullRequestReviews('test-owner', 'test-repo', 1);
      expect(reviews).toBeDefined();
      expect(reviews).toHaveLength(1);
      expect(reviews[0]).toEqual({
        id: 1,
        user: {
          login: 'reviewer1',
          avatarUrl: 'https://example.com/reviewer1.png',
          type: 'User',
          role: 'REVIEWER'
        },
        body: 'LGTM',
        state: 'APPROVED',
        commitId: 'abc123',
        submittedAt: '2024-01-01T00:00:00Z'
      });
    });

    test('should handle missing review user data', async () => {
      const mockReviews = {
        data: [{
          id: 1,
          node_id: 'PRR_1',
          user: null,
          body: 'LGTM',
          state: 'APPROVED',
          commit_id: 'abc123',
          submitted_at: '2024-01-01T00:00:00Z'
        }],
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<Octokit['pulls']['listReviews']>>;

      mockOctokit.pulls.listReviews.mockResolvedValueOnce(mockReviews);

      await expect(
        githubService.getPullRequestReviews('test-owner', 'test-repo', 1)
      ).rejects.toThrow('Review user data is missing');
    });

    test('should handle missing optional review fields', async () => {
      const mockReviews = {
        data: [{
          id: 1,
          node_id: 'PRR_1',
          user: {
            login: 'reviewer1',
            id: 123,
            node_id: 'U_123',
            avatar_url: 'https://example.com/reviewer1.png',
            type: 'User',
            site_admin: false
          },
          body: null,
          state: 'COMMENTED',
          commit_id: null,
          submitted_at: null
        }],
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<Octokit['pulls']['listReviews']>>;

      mockOctokit.pulls.listReviews.mockResolvedValueOnce(mockReviews);

      const reviews = await githubService.getPullRequestReviews('test-owner', 'test-repo', 1);
      expect(reviews).toBeDefined();
      expect(reviews).toHaveLength(1);
      expect(reviews[0]).toEqual({
        id: 1,
        user: {
          login: 'reviewer1',
          avatarUrl: 'https://example.com/reviewer1.png',
          type: 'User',
          role: 'REVIEWER'
        },
        body: '',
        state: 'COMMENTED',
        commitId: '',
        submittedAt: expect.any(String)
      });
    });
  });
});
