import { GitHubService } from '../../api';
import { createMockContext } from '../utils/mock-factory';
import { expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO, TEST_PR_NUMBER } from '../utils/test-data';

type AuthorAssociation = 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' | 'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER';

const createMockReview = (state: string, body = 'Test review', authorAssociation: AuthorAssociation = 'CONTRIBUTOR') => ({
  id: 12345,
  node_id: 'PRR_123',
  user: {
    login: 'reviewer',
    id: 111,
    node_id: 'U_111',
    avatar_url: 'https://github.com/reviewer.png',
    gravatar_id: null,
    url: 'https://api.github.com/users/reviewer',
    html_url: 'https://github.com/reviewer',
    followers_url: 'https://api.github.com/users/reviewer/followers',
    following_url: 'https://api.github.com/users/reviewer/following{/other_user}',
    gists_url: 'https://api.github.com/users/reviewer/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/reviewer/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/reviewer/subscriptions',
    organizations_url: 'https://api.github.com/users/reviewer/orgs',
    repos_url: 'https://api.github.com/users/reviewer/repos',
    events_url: 'https://api.github.com/users/reviewer/events{/privacy}',
    received_events_url: 'https://api.github.com/users/reviewer/received_events',
    type: 'User',
    site_admin: false,
    name: null,
    email: null,
    starred_at: undefined
  },
  body,
  state,
  html_url: `https://github.com/${TEST_OWNER}/${TEST_REPO}/pull/${TEST_PR_NUMBER}#pullrequestreview-12345`,
  pull_request_url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}`,
  _links: {
    html: {
      href: `https://github.com/${TEST_OWNER}/${TEST_REPO}/pull/${TEST_PR_NUMBER}#pullrequestreview-12345`
    },
    pull_request: {
      href: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}`
    }
  },
  commit_id: 'abc123',
  submitted_at: '2024-01-01T00:00:00Z',
  author_association: authorAssociation
});

describe('GitHubService - Pull Request Reviews', () => {
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

  describe('Review Retrieval', () => {
    it('should fetch pull request reviews', async () => {
      const mockReview = createMockReview('APPROVED');
      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: [mockReview],
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      const reviews = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      expect(reviews).toHaveLength(1);
      expect(reviews[0].state).toBe('APPROVED');
      expect(reviews[0].user.login).toBe('reviewer');
    });

    it('should handle pull requests with no reviews', async () => {
      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: [],
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      const reviews = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(reviews).toHaveLength(0);
    });

    it('should handle multiple reviews from same user', async () => {
      const reviews = [
        createMockReview('COMMENTED', 'Initial review'),
        createMockReview('APPROVED', 'LGTM')
      ];

      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: reviews,
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      const result = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(result).toHaveLength(2);
      expect(result[0].state).toBe('COMMENTED');
      expect(result[1].state).toBe('APPROVED');
    });

    it('should handle reviews with different states', async () => {
      const reviews = [
        { ...createMockReview('APPROVED', 'LGTM', 'MEMBER'), user: { ...createMockReview('APPROVED').user, login: 'reviewer1' } },
        { ...createMockReview('CHANGES_REQUESTED', 'Needs work', 'COLLABORATOR'), user: { ...createMockReview('APPROVED').user, login: 'reviewer2' } },
        { ...createMockReview('COMMENTED', 'Nice work', 'CONTRIBUTOR'), user: { ...createMockReview('APPROVED').user, login: 'reviewer3' } }
      ];

      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: reviews,
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      const result = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(result).toHaveLength(3);
      expect(result.map(r => r.state)).toEqual(['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED']);
    });
  });

  describe('Review Error Handling', () => {
    it('should handle non-existent pull request', async () => {
      ctx.octokit.rest.pulls.listReviews.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      });

      await expectGitHubError(
        service.getPullRequestReviews(TEST_OWNER, TEST_REPO, 999999),
        404,
        'Not Found'
      );
    });

    it('should handle review API errors', async () => {
      ctx.octokit.rest.pulls.listReviews.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      await expectGitHubError(
        service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        500,
        'Internal Server Error'
      );
    });

    it('should handle malformed review data', async () => {
      const malformedReview = {
        id: 12345,
        node_id: 'PRR_123',
        user: null,
        body: 'Test review',
        state: 'APPROVED',
        html_url: `https://github.com/${TEST_OWNER}/${TEST_REPO}/pull/${TEST_PR_NUMBER}#pullrequestreview-12345`,
        pull_request_url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}`,
        _links: {
          html: {
            href: `https://github.com/${TEST_OWNER}/${TEST_REPO}/pull/${TEST_PR_NUMBER}#pullrequestreview-12345`
          },
          pull_request: {
            href: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}`
          }
        },
        commit_id: 'abc123',
        submitted_at: '2024-01-01T00:00:00Z',
        author_association: 'NONE' as const
      };

      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: [malformedReview],
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      const reviews = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(reviews[0].user.login).toBe(''); // Should handle missing user data gracefully
    });
  });

  describe('Review Caching', () => {
    it('should cache review results', async () => {
      const mockReview = createMockReview('APPROVED');
      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: [mockReview],
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      // First request
      const reviews1 = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(reviews1).toHaveLength(1);

      // Second request should use cache
      const reviews2 = await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(reviews2).toHaveLength(1);

      expect(ctx.octokit.rest.pulls.listReviews).toHaveBeenCalledTimes(1);
    });

    it('should clear review cache on error', async () => {
      // First request succeeds
      const mockReview = createMockReview('APPROVED');
      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: [mockReview],
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);

      // Second request fails
      ctx.octokit.rest.pulls.listReviews.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      await expectGitHubError(
        service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER),
        500,
        'Internal Server Error'
      );

      // Third request should hit API again
      ctx.octokit.rest.pulls.listReviews.mockResolvedValueOnce({
        data: [mockReview],
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}/pulls/${TEST_PR_NUMBER}/reviews`,
        headers: {}
      });

      await service.getPullRequestReviews(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
      expect(ctx.octokit.rest.pulls.listReviews).toHaveBeenCalledTimes(3);
    });
  });
});
