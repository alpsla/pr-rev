import { describe, expect, beforeEach, test } from '@jest/globals';
import { GitHubService } from '../../api';
import { createMockContext, createMockGitHubUser, createMockRepository } from '../utils/mock-factory';

describe('GitHubService Contract Tests', () => {
  let service: InstanceType<typeof GitHubService>;
  let ctx = createMockContext();

  beforeEach(() => {
    ctx = createMockContext();
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
  });

  describe('Pull Request Operations', () => {
    const mockUser = createMockGitHubUser();
    const mockRepo = createMockRepository();

    test('creates pull request record', async () => {
      ctx.octokit.rest.pulls.get.mockResolvedValueOnce({
        data: {
          number: 1,
          title: 'Test PR',
          state: 'open',
          user: mockUser,
          head: {
            ref: 'feature',
            sha: 'abc123',
            repo: mockRepo,
            user: mockUser,
            label: 'owner:feature',
          },
          base: {
            ref: 'main',
            sha: 'def456',
            repo: mockRepo,
            user: mockUser,
            label: 'owner:main',
          },
          draft: false,
          merged: false,
          mergeable: true,
          rebaseable: true,
          mergeable_state: 'clean',
          merged_by: null,
          comments: 0,
          review_comments: 0,
          maintainer_can_modify: true,
          commits: 1,
          additions: 10,
          deletions: 5,
          changed_files: 2,
          url: 'https://api.github.com/repos/owner/repo/pulls/1',
          id: 1,
          node_id: 'PR_1',
          html_url: 'https://github.com/owner/repo/pull/1',
          diff_url: 'https://github.com/owner/repo/pull/1.diff',
          patch_url: 'https://github.com/owner/repo/pull/1.patch',
          issue_url: 'https://api.github.com/repos/owner/repo/issues/1',
          commits_url: 'https://api.github.com/repos/owner/repo/pulls/1/commits',
          review_comments_url: 'https://api.github.com/repos/owner/repo/pulls/1/comments',
          review_comment_url: 'https://api.github.com/repos/owner/repo/pulls/comments{/number}',
          comments_url: 'https://api.github.com/repos/owner/repo/issues/1/comments',
          statuses_url: 'https://api.github.com/repos/owner/repo/statuses/abc123',
          body: 'Test PR description',
          labels: [],
          milestone: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          closed_at: null,
          merged_at: null,
          merge_commit_sha: null,
          assignee: null,
          assignees: [],
          requested_reviewers: [],
          requested_teams: [],
          _links: {
            self: { href: 'https://api.github.com/repos/owner/repo/pulls/1' },
            html: { href: 'https://github.com/owner/repo/pull/1' },
            issue: { href: 'https://api.github.com/repos/owner/repo/issues/1' },
            comments: { href: 'https://api.github.com/repos/owner/repo/issues/1/comments' },
            review_comments: { href: 'https://api.github.com/repos/owner/repo/pulls/1/comments' },
            review_comment: { href: 'https://api.github.com/repos/owner/repo/pulls/comments{/number}' },
            commits: { href: 'https://api.github.com/repos/owner/repo/pulls/1/commits' },
            statuses: { href: 'https://api.github.com/repos/owner/repo/statuses/abc123' },
          },
          author_association: 'MEMBER',
          auto_merge: null,
          active_lock_reason: null,
        },
        status: 200,
        url: '',
        headers: {},
      });

      await service.getPullRequest('owner', 'repo', 1);

      expect(ctx.prisma.pullRequest.upsert).toHaveBeenCalledWith({
        where: {
          repositoryId_number: {
            repositoryId: expect.any(String),
            number: 1,
          },
        },
        create: expect.objectContaining({
          number: 1,
          title: 'Test PR',
          status: 'OPEN',
        }),
        update: expect.objectContaining({
          title: 'Test PR',
          status: 'OPEN',
        }),
      });
    });
  });

  describe('Repository Operations', () => {
    test('creates repository record', async () => {
      const mockRepo = createMockRepository();
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: mockRepo,
        status: 200,
        url: '',
        headers: {},
      });

      await service.getRepository('owner', 'test-repo');

      expect(ctx.prisma.repository.upsert).toHaveBeenCalledWith({
        where: {
          fullName: 'owner/test-repo',
        },
        create: expect.objectContaining({
          name: 'test-repo',
          fullName: 'owner/test-repo',
          private: false,
        }),
        update: expect.objectContaining({
          name: 'test-repo',
          private: false,
        }),
      });
    });
  });
});
