import { GitHubService } from '../github-service';
import { createMockContext } from './mocks/prisma';
import { createMockOctokit } from './mocks/github';
import { describe, expect, test, beforeEach } from '@jest/globals';
import type { RestEndpointMethodTypes } from '@octokit/rest';

type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];
type PullsGetResponse = RestEndpointMethodTypes['pulls']['get']['response'];

const mockGithubUser = {
  login: 'test-user',
  id: 789,
  node_id: 'U_789',
  avatar_url: 'https://example.com/avatar.png',
  gravatar_id: '',
  url: 'https://api.github.com/users/test-user',
  html_url: 'https://github.com/test-user',
  followers_url: 'https://api.github.com/users/test-user/followers',
  following_url: 'https://api.github.com/users/test-user/following{/other_user}',
  gists_url: 'https://api.github.com/users/test-user/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/test-user/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/test-user/subscriptions',
  organizations_url: 'https://api.github.com/users/test-user/orgs',
  repos_url: 'https://api.github.com/users/test-user/repos',
  events_url: 'https://api.github.com/users/test-user/events{/privacy}',
  received_events_url: 'https://api.github.com/users/test-user/received_events',
  type: 'User',
  site_admin: false
};

const createMockRepo = (name: string, owner: typeof mockGithubUser) => ({
  id: 123,
  node_id: 'R_123',
  name,
  full_name: `${owner.login}/${name}`,
  private: false,
  owner,
  html_url: `https://github.com/${owner.login}/${name}`,
  description: 'Test repository',
  fork: false,
  url: `https://api.github.com/repos/${owner.login}/${name}`,
  archive_url: `https://api.github.com/repos/${owner.login}/${name}/{archive_format}{/ref}`,
  assignees_url: `https://api.github.com/repos/${owner.login}/${name}/assignees{/user}`,
  blobs_url: `https://api.github.com/repos/${owner.login}/${name}/git/blobs{/sha}`,
  branches_url: `https://api.github.com/repos/${owner.login}/${name}/branches{/branch}`,
  collaborators_url: `https://api.github.com/repos/${owner.login}/${name}/collaborators{/collaborator}`,
  comments_url: `https://api.github.com/repos/${owner.login}/${name}/comments{/number}`,
  commits_url: `https://api.github.com/repos/${owner.login}/${name}/commits{/sha}`,
  compare_url: `https://api.github.com/repos/${owner.login}/${name}/compare/{base}...{head}`,
  contents_url: `https://api.github.com/repos/${owner.login}/${name}/contents/{+path}`,
  contributors_url: `https://api.github.com/repos/${owner.login}/${name}/contributors`,
  deployments_url: `https://api.github.com/repos/${owner.login}/${name}/deployments`,
  downloads_url: `https://api.github.com/repos/${owner.login}/${name}/downloads`,
  events_url: `https://api.github.com/repos/${owner.login}/${name}/events`,
  forks_url: `https://api.github.com/repos/${owner.login}/${name}/forks`,
  git_commits_url: `https://api.github.com/repos/${owner.login}/${name}/git/commits{/sha}`,
  git_refs_url: `https://api.github.com/repos/${owner.login}/${name}/git/refs{/sha}`,
  git_tags_url: `https://api.github.com/repos/${owner.login}/${name}/git/tags{/sha}`,
  git_url: `git://github.com/${owner.login}/${name}.git`,
  hooks_url: `https://api.github.com/repos/${owner.login}/${name}/hooks`,
  issue_comment_url: `https://api.github.com/repos/${owner.login}/${name}/issues/comments{/number}`,
  issue_events_url: `https://api.github.com/repos/${owner.login}/${name}/issues/events{/number}`,
  issues_url: `https://api.github.com/repos/${owner.login}/${name}/issues{/number}`,
  keys_url: `https://api.github.com/repos/${owner.login}/${name}/keys{/key_id}`,
  labels_url: `https://api.github.com/repos/${owner.login}/${name}/labels{/name}`,
  languages_url: `https://api.github.com/repos/${owner.login}/${name}/languages`,
  merges_url: `https://api.github.com/repos/${owner.login}/${name}/merges`,
  milestones_url: `https://api.github.com/repos/${owner.login}/${name}/milestones{/number}`,
  mirror_url: null,
  notifications_url: `https://api.github.com/repos/${owner.login}/${name}/notifications{?since,all,participating}`,
  pulls_url: `https://api.github.com/repos/${owner.login}/${name}/pulls{/number}`,
  releases_url: `https://api.github.com/repos/${owner.login}/${name}/releases{/id}`,
  ssh_url: `git@github.com:${owner.login}/${name}.git`,
  stargazers_url: `https://api.github.com/repos/${owner.login}/${name}/stargazers`,
  statuses_url: `https://api.github.com/repos/${owner.login}/${name}/statuses/{sha}`,
  subscribers_url: `https://api.github.com/repos/${owner.login}/${name}/subscribers`,
  subscription_url: `https://api.github.com/repos/${owner.login}/${name}/subscription`,
  tags_url: `https://api.github.com/repos/${owner.login}/${name}/tags`,
  teams_url: `https://api.github.com/repos/${owner.login}/${name}/teams`,
  trees_url: `https://api.github.com/repos/${owner.login}/${name}/git/trees{/sha}`,
  clone_url: `https://github.com/${owner.login}/${name}.git`,
  svn_url: `https://github.com/${owner.login}/${name}`,
  homepage: null,
  language: 'TypeScript',
  forks_count: 5,
  stargazers_count: 10,
  watchers_count: 10,
  size: 100,
  default_branch: 'main',
  open_issues_count: 2,
  topics: [],
  has_issues: true,
  has_projects: true,
  has_wiki: true,
  has_pages: false,
  has_downloads: true,
  has_discussions: false,
  archived: false,
  disabled: false,
  visibility: 'public',
  pushed_at: '2023-01-02T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z',
  permissions: {
    admin: true,
    maintain: true,
    push: true,
    triage: true,
    pull: true
  },
  allow_rebase_merge: true,
  template_repository: null,
  temp_clone_token: '',
  allow_squash_merge: true,
  allow_auto_merge: false,
  delete_branch_on_merge: false,
  allow_merge_commit: true,
  subscribers_count: 10,
  network_count: 10,
  license: null,
  forks: 5,
  open_issues: 2,
  watchers: 10,
  web_commit_signoff_required: false,
  security_and_analysis: null
});

describe('GitHub API Tests', () => {
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
      const mockOwner = {
        ...mockGithubUser,
        login: 'test-owner',
        id: 456,
        node_id: 'U_456'
      };
      
      const mockRepo: ReposGetResponse = {
        data: createMockRepo('test-repo', mockOwner),
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      };

      mockOctokit.repos.get.mockResolvedValueOnce(mockRepo);

      const repo = await githubService.getRepository('test-owner', 'test-repo');
      expect(repo).toBeDefined();
      expect(repo.name).toBe('test-repo');
      expect(repo.owner.login).toBe('test-owner');
    });

    test('should handle repository not found', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce({
        status: 404,
        message: 'Not Found',
        headers: {},
        url: 'https://api.github.com/repos/test-owner/non-existent'
      });

      await expect(
        githubService.getRepository('test-owner', 'non-existent')
      ).rejects.toThrow();
    });
  });

  describe('Pull Request Operations', () => {
    test('should get pull request details', async () => {
      const mockOwner = {
        ...mockGithubUser,
        login: 'test-owner',
        id: 456,
        node_id: 'U_456'
      };
      
      const mockRepo = createMockRepo('test-repo', mockOwner);
      const baseUrl = 'https://api.github.com/repos/test-owner/test-repo';

      const mockPR: PullsGetResponse = {
        data: {
          url: `${baseUrl}/pulls/1`,
          id: 789,
          node_id: 'PR_789',
          number: 1,
          state: 'open',
          locked: false,
          title: 'Test PR',
          user: mockGithubUser,
          body: 'Test PR description',
          labels: [],
          milestone: null,
          assignee: null,
          assignees: [],
          requested_reviewers: [],
          requested_teams: [],
          created_at: '2023-01-03T00:00:00Z',
          updated_at: '2023-01-04T00:00:00Z',
          closed_at: null,
          merged_at: null,
          merge_commit_sha: null,
          head: {
            label: 'test-owner:feature-branch',
            ref: 'feature-branch',
            sha: 'abc123',
            user: mockOwner,
            repo: mockRepo
          },
          base: {
            label: 'test-owner:main',
            ref: 'main',
            sha: 'def456',
            user: mockOwner,
            repo: mockRepo
          },
          _links: {
            self: { href: `${baseUrl}/pulls/1` },
            html: { href: `https://github.com/test-owner/test-repo/pull/1` },
            issue: { href: `${baseUrl}/issues/1` },
            comments: { href: `${baseUrl}/issues/1/comments` },
            review_comments: { href: `${baseUrl}/pulls/1/comments` },
            review_comment: { href: `${baseUrl}/pulls/comments{/number}` },
            commits: { href: `${baseUrl}/pulls/1/commits` },
            statuses: { href: `${baseUrl}/statuses/abc123` }
          },
          author_association: 'CONTRIBUTOR',
          auto_merge: null,
          active_lock_reason: null,
          merged: false,
          mergeable: true,
          mergeable_state: 'clean',
          merged_by: null,
          comments: 0,
          review_comments: 0,
          maintainer_can_modify: true,
          commits: 1,
          additions: 10,
          deletions: 5,
          changed_files: 2,
          html_url: 'https://github.com/test-owner/test-repo/pull/1',
          diff_url: 'https://github.com/test-owner/test-repo/pull/1.diff',
          patch_url: 'https://github.com/test-owner/test-repo/pull/1.patch',
          issue_url: `${baseUrl}/issues/1`,
          commits_url: `${baseUrl}/pulls/1/commits`,
          review_comments_url: `${baseUrl}/pulls/1/comments`,
          review_comment_url: `${baseUrl}/pulls/comments{/number}`,
          comments_url: `${baseUrl}/issues/1/comments`,
          statuses_url: `${baseUrl}/statuses/abc123`,
          draft: false,
          rebaseable: true
        },
        status: 200,
        url: `${baseUrl}/pulls/1`,
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      };

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
            site_admin: false
          },
          body: 'LGTM',
          state: 'APPROVED',
          html_url: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1',
          pull_request_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
          commit_id: 'abc123',
          submitted_at: '2024-01-01T00:00:00Z',
          author_association: 'COLLABORATOR',
          _links: {
            html: { href: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1' },
            pull_request: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1' }
          }
        }],
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<typeof mockOctokit.pulls.listReviews>>;

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
          html_url: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1',
          pull_request_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
          commit_id: 'abc123',
          submitted_at: '2024-01-01T00:00:00Z',
          author_association: 'COLLABORATOR',
          _links: {
            html: { href: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1' },
            pull_request: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1' }
          }
        }],
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<typeof mockOctokit.pulls.listReviews>>;

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
            site_admin: false
          },
          body: null,
          state: 'COMMENTED',
          html_url: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1',
          pull_request_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
          commit_id: null,
          submitted_at: null,
          author_association: 'COLLABORATOR',
          _links: {
            html: { href: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1' },
            pull_request: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1' }
          }
        }],
        status: 200,
        url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
        headers: {
          'x-github-media-type': 'github.v3; format=json'
        }
      } as unknown as Awaited<ReturnType<typeof mockOctokit.pulls.listReviews>>;

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
