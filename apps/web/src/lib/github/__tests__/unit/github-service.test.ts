import { GitHubService } from '../../github-service';
import { createMockContext } from '../mocks/prisma';
import { createMockOctokit } from '../mocks/github';
import { createTestConfig } from '../utils/test-helpers';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import {
  GitHubError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  ServerError,
} from '../../errors';
import type { PullRequestReview } from '../../types';

type GitHubPullRequestReview = RestEndpointMethodTypes['pulls']['listReviews']['response']['data'][0];

describe('GitHubService', () => {
  const mockContext = createMockContext();
  const mockOctokit = createMockOctokit();
  const config = createTestConfig();
  let service: GitHubService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GitHubService(mockContext.prisma, mockOctokit, config);
  });

  describe('getPullRequestReviews', () => {
    const mockReviews: GitHubPullRequestReview[] = [
      {
        id: 1,
        node_id: 'MDE3OlB1bGxSZXF1ZXN0UmV2aWV3MQ==',
        user: {
          login: 'reviewer1',
          id: 1,
          node_id: 'MDQ6VXNlcjE=',
          avatar_url: 'https://example.com/avatar1.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/reviewer1',
          html_url: 'https://github.com/reviewer1',
          followers_url: 'https://api.github.com/users/reviewer1/followers',
          following_url: 'https://api.github.com/users/reviewer1/following{/other_user}',
          gists_url: 'https://api.github.com/users/reviewer1/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/reviewer1/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/reviewer1/subscriptions',
          organizations_url: 'https://api.github.com/users/reviewer1/orgs',
          repos_url: 'https://api.github.com/users/reviewer1/repos',
          events_url: 'https://api.github.com/users/reviewer1/events{/privacy}',
          received_events_url: 'https://api.github.com/users/reviewer1/received_events',
          type: 'User',
          site_admin: false,
        },
        body: 'LGTM',
        state: 'APPROVED',
        html_url: 'https://github.com/owner/repo/pull/1#pullrequestreview-1',
        pull_request_url: 'https://api.github.com/repos/owner/repo/pulls/1',
        commit_id: 'abc123',
        submitted_at: '2024-01-01T00:00:00Z',
        author_association: 'COLLABORATOR',
        _links: {
          html: { href: 'https://github.com/owner/repo/pull/1#pullrequestreview-1' },
          pull_request: { href: 'https://api.github.com/repos/owner/repo/pulls/1' },
        },
      },
      {
        id: 2,
        node_id: 'MDE3OlB1bGxSZXF1ZXN0UmV2aWV3Mg==',
        user: {
          login: 'reviewer2',
          id: 2,
          node_id: 'MDQ6VXNlcjI=',
          avatar_url: 'https://example.com/avatar2.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/reviewer2',
          html_url: 'https://github.com/reviewer2',
          followers_url: 'https://api.github.com/users/reviewer2/followers',
          following_url: 'https://api.github.com/users/reviewer2/following{/other_user}',
          gists_url: 'https://api.github.com/users/reviewer2/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/reviewer2/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/reviewer2/subscriptions',
          organizations_url: 'https://api.github.com/users/reviewer2/orgs',
          repos_url: 'https://api.github.com/users/reviewer2/repos',
          events_url: 'https://api.github.com/users/reviewer2/events{/privacy}',
          received_events_url: 'https://api.github.com/users/reviewer2/received_events',
          type: 'User',
          site_admin: false,
        },
        body: 'Needs work',
        state: 'CHANGES_REQUESTED',
        html_url: 'https://github.com/owner/repo/pull/1#pullrequestreview-2',
        pull_request_url: 'https://api.github.com/repos/owner/repo/pulls/1',
        commit_id: 'def456',
        submitted_at: '2024-01-02T00:00:00Z',
        author_association: 'COLLABORATOR',
        _links: {
          html: { href: 'https://github.com/owner/repo/pull/1#pullrequestreview-2' },
          pull_request: { href: 'https://api.github.com/repos/owner/repo/pulls/1' },
        },
      },
    ];

    it('should fetch and transform pull request reviews', async () => {
      mockOctokit.pulls.listReviews.mockResolvedValueOnce({
        data: mockReviews,
        headers: {},
        status: 200,
        url: 'https://api.github.com/repos/owner/repo/pulls/1/reviews',
      });

      const reviews = await service.getPullRequestReviews('owner', 'repo', 1);

      expect(reviews).toHaveLength(2);
      expect(reviews[0]).toEqual<PullRequestReview>({
        id: 1,
        user: {
          login: 'reviewer1',
          avatarUrl: 'https://example.com/avatar1.png',
          type: 'User',
          role: 'REVIEWER',
        },
        body: 'LGTM',
        state: 'APPROVED',
        commitId: 'abc123',
        submittedAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle missing user data', async () => {
      const reviewWithoutUser: GitHubPullRequestReview = {
        ...mockReviews[0],
        user: null,
      };

      mockOctokit.pulls.listReviews.mockResolvedValueOnce({
        data: [reviewWithoutUser],
        headers: {},
        status: 200,
        url: 'https://api.github.com/repos/owner/repo/pulls/1/reviews',
      });

      await expect(service.getPullRequestReviews('owner', 'repo', 1))
        .rejects
        .toThrow('Review user data is missing');
    });

    it('should handle missing optional fields', async () => {
      const reviewWithMissingFields: GitHubPullRequestReview = {
        ...mockReviews[0],
        body: '',
        commit_id: '',
        submitted_at: new Date().toISOString(),
        state: 'COMMENTED',
      };

      mockOctokit.pulls.listReviews.mockResolvedValueOnce({
        data: [reviewWithMissingFields],
        headers: {},
        status: 200,
        url: 'https://api.github.com/repos/owner/repo/pulls/1/reviews',
      });

      const reviews = await service.getPullRequestReviews('owner', 'repo', 1);

      expect(reviews[0]).toEqual<PullRequestReview>({
        id: 1,
        user: {
          login: 'reviewer1',
          avatarUrl: 'https://example.com/avatar1.png',
          type: 'User',
          role: 'REVIEWER',
        },
        body: '',
        state: 'COMMENTED',
        commitId: '',
        submittedAt: expect.any(String),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 0,
        code: 'ECONNREFUSED',
      });

      await expect(service.getRepository('owner', 'repo'))
        .rejects
        .toThrow(NetworkError);
    });

    it('should handle rate limit errors', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 403,
        response: {
          headers: {
            'x-ratelimit-remaining': '0',
          },
        },
      });

      await expect(service.getRepository('owner', 'repo'))
        .rejects
        .toThrow(RateLimitError);
    });

    it('should handle authentication errors', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 401,
      });

      await expect(service.getRepository('owner', 'repo'))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should handle not found errors', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 404,
      });

      await expect(service.getRepository('owner', 'repo'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should handle server errors', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 500,
      });

      await expect(service.getRepository('owner', 'repo'))
        .rejects
        .toThrow(ServerError);
    });

    it('should handle generic GitHub errors', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 422,
      });

      await expect(service.getRepository('owner', 'repo'))
        .rejects
        .toThrow(GitHubError);
    });
  });

  describe('Service Lifecycle', () => {
    it('should disconnect prisma client on destroy', async () => {
      await service.destroy();
      expect(mockContext.prisma.$disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect errors', async () => {
      const error = new Error('Disconnect failed');
      mockContext.prisma.$disconnect.mockRejectedValueOnce(error);

      await expect(service.destroy())
        .rejects
        .toThrow('Failed to destroy service');
    });
  });
});
