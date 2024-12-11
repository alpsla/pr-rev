import { GitHubService } from '../../api';
import { createMockContext, setupSuccessfulMocks } from '../utils/mock-factory';
import { expectRepositoryData } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO } from '../utils/test-data';

interface MockRepositoryOptions {
  description?: string | null;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  allow_merge_commit?: boolean;
  allow_squash_merge?: boolean;
  allow_rebase_merge?: boolean;
  allow_auto_merge?: boolean;
}

const createMockOwner = (login: string) => ({
  login,
  id: 1,
  node_id: 'U_1',
  avatar_url: `https://github.com/${login}.png`,
  gravatar_id: null,
  url: `https://api.github.com/users/${login}`,
  html_url: `https://github.com/${login}`,
  followers_url: `https://api.github.com/users/${login}/followers`,
  following_url: `https://api.github.com/users/${login}/following{/other_user}`,
  gists_url: `https://api.github.com/users/${login}/gists{/gist_id}`,
  starred_url: `https://api.github.com/users/${login}/starred{/owner}{/repo}`,
  subscriptions_url: `https://api.github.com/users/${login}/subscriptions`,
  organizations_url: `https://api.github.com/users/${login}/orgs`,
  repos_url: `https://api.github.com/users/${login}/repos`,
  events_url: `https://api.github.com/users/${login}/events{/privacy}`,
  received_events_url: `https://api.github.com/users/${login}/received_events`,
  type: 'User',
  site_admin: false,
  name: null,
  email: null,
  starred_at: undefined
});

const createMockRepository = (name: string, owner: string, options: MockRepositoryOptions = {}) => ({
  id: 123,
  node_id: 'R_123',
  name,
  full_name: `${owner}/${name}`,
  owner: createMockOwner(owner),
  private: false,
  html_url: `https://github.com/${owner}/${name}`,
  description: options.description ?? null,
  fork: false,
  url: `https://api.github.com/repos/${owner}/${name}`,
  archive_url: `https://api.github.com/repos/${owner}/${name}/{archive_format}{/ref}`,
  assignees_url: `https://api.github.com/repos/${owner}/${name}/assignees{/user}`,
  blobs_url: `https://api.github.com/repos/${owner}/${name}/git/blobs{/sha}`,
  branches_url: `https://api.github.com/repos/${owner}/${name}/branches{/branch}`,
  collaborators_url: `https://api.github.com/repos/${owner}/${name}/collaborators{/collaborator}`,
  comments_url: `https://api.github.com/repos/${owner}/${name}/comments{/number}`,
  commits_url: `https://api.github.com/repos/${owner}/${name}/commits{/sha}`,
  compare_url: `https://api.github.com/repos/${owner}/${name}/compare/{base}...{head}`,
  contents_url: `https://api.github.com/repos/${owner}/${name}/contents/{+path}`,
  contributors_url: `https://api.github.com/repos/${owner}/${name}/contributors`,
  deployments_url: `https://api.github.com/repos/${owner}/${name}/deployments`,
  downloads_url: `https://api.github.com/repos/${owner}/${name}/downloads`,
  events_url: `https://api.github.com/repos/${owner}/${name}/events`,
  forks_url: `https://api.github.com/repos/${owner}/${name}/forks`,
  git_commits_url: `https://api.github.com/repos/${owner}/${name}/git/commits{/sha}`,
  git_refs_url: `https://api.github.com/repos/${owner}/${name}/git/refs{/sha}`,
  git_tags_url: `https://api.github.com/repos/${owner}/${name}/git/tags{/sha}`,
  git_url: `git:github.com/${owner}/${name}.git`,
  issue_comment_url: `https://api.github.com/repos/${owner}/${name}/issues/comments{/number}`,
  issue_events_url: `https://api.github.com/repos/${owner}/${name}/issues/events{/number}`,
  issues_url: `https://api.github.com/repos/${owner}/${name}/issues{/number}`,
  keys_url: `https://api.github.com/repos/${owner}/${name}/keys{/key_id}`,
  labels_url: `https://api.github.com/repos/${owner}/${name}/labels{/name}`,
  languages_url: `https://api.github.com/repos/${owner}/${name}/languages`,
  merges_url: `https://api.github.com/repos/${owner}/${name}/merges`,
  milestones_url: `https://api.github.com/repos/${owner}/${name}/milestones{/number}`,
  notifications_url: `https://api.github.com/repos/${owner}/${name}/notifications{?since,all,participating}`,
  pulls_url: `https://api.github.com/repos/${owner}/${name}/pulls{/number}`,
  releases_url: `https://api.github.com/repos/${owner}/${name}/releases{/id}`,
  ssh_url: `git@github.com:${owner}/${name}.git`,
  stargazers_url: `https://api.github.com/repos/${owner}/${name}/stargazers`,
  statuses_url: `https://api.github.com/repos/${owner}/${name}/statuses/{sha}`,
  subscribers_url: `https://api.github.com/repos/${owner}/${name}/subscribers`,
  subscription_url: `https://api.github.com/repos/${owner}/${name}/subscription`,
  tags_url: `https://api.github.com/repos/${owner}/${name}/tags`,
  teams_url: `https://api.github.com/repos/${owner}/${name}/teams`,
  trees_url: `https://api.github.com/repos/${owner}/${name}/git/trees{/sha}`,
  hooks_url: `https://api.github.com/repos/${owner}/${name}/hooks`,
  clone_url: `https://github.com/${owner}/${name}.git`,
  mirror_url: null,
  svn_url: `https://github.com/${owner}/${name}`,
  homepage: null,
  language: options.language ?? 'TypeScript',
  forks_count: options.forks_count ?? 0,
  stargazers_count: options.stargazers_count ?? 0,
  watchers_count: 0,
  size: 0,
  default_branch: 'main',
  open_issues_count: 0,
  is_template: false,
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
  pushed_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  permissions: {
    admin: true,
    maintain: true,
    push: true,
    triage: true,
    pull: true
  },
  allow_rebase_merge: options.allow_rebase_merge ?? true,
  template_repository: null,
  temp_clone_token: null,
  allow_squash_merge: options.allow_squash_merge ?? true,
  allow_auto_merge: options.allow_auto_merge ?? false,
  delete_branch_on_merge: false,
  allow_merge_commit: options.allow_merge_commit ?? true,
  subscribers_count: 0,
  network_count: 0,
  license: null,
  forks: 0,
  open_issues: 0,
  watchers: 0,
  allow_forking: true,
  web_commit_signoff_required: false,
  security_and_analysis: null
});

describe('GitHubService - Repository Operations', () => {
  const ctx = createMockContext();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
    setupSuccessfulMocks(ctx);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Repository Settings', () => {
    it('should fetch repository settings', async () => {
      const result = await service.getRepository(TEST_OWNER, TEST_REPO);

      expectRepositoryData(result, {
        settings: {
          id: `${result.id}-settings`,
          repositoryId: result.id.toString(),
          autoMergeEnabled: true,
          requireApprovals: 1,
          protectedBranches: ['main'],
          allowedMergeTypes: ['merge', 'squash', 'rebase']
        }
      });
    });

    it('should handle repositories with different merge settings', async () => {
      // Mock a repository with limited merge options
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepository('limited-merge-repo', TEST_OWNER, {
          description: 'Test repo with limited merge options',
          allow_merge_commit: true,
          allow_squash_merge: false,
          allow_rebase_merge: false,
          allow_auto_merge: false
        }),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/limited-merge-repo`,
        headers: {}
      });

      const result = await service.getRepository(TEST_OWNER, 'limited-merge-repo');

      expectRepositoryData(result, {
        settings: {
          id: `123-settings`,
          repositoryId: '123',
          autoMergeEnabled: false,
          requireApprovals: 1,
          protectedBranches: ['main'],
          allowedMergeTypes: ['merge']
        }
      });
    });
  });

  describe('Repository Metadata', () => {
    it('should fetch repository metadata', async () => {
      const result = await service.getRepository(TEST_OWNER, TEST_REPO);

      expectRepositoryData(result, {
        name: TEST_REPO,
        fullName: `${TEST_OWNER}/${TEST_REPO}`,
        private: false,
        language: 'TypeScript',
        stargazersCount: expect.any(Number),
        forksCount: expect.any(Number)
      });
    });

    it('should handle repositories with minimal metadata', async () => {
      // Mock a repository with minimal data
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepository('minimal-repo', TEST_OWNER, {
          description: null,
          language: ''
        }),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/minimal-repo`,
        headers: {}
      });

      const result = await service.getRepository(TEST_OWNER, 'minimal-repo');

      expectRepositoryData(result, {
        name: 'minimal-repo',
        fullName: `${TEST_OWNER}/minimal-repo`,
        private: false,
        language: '',
        stargazersCount: 0,
        forksCount: 0
      });
    });
  });

  describe('Repository Cache Management', () => {
    it('should cache repository data', async () => {
      // First call should hit the API
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
    });

    it('should clear cache on destroy', async () => {
      // First call to populate cache
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // Destroy service
      await service.destroy();

      // Next call should hit API again
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });

    it('should maintain separate caches for different repositories', async () => {
      // Get first repository
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);

      // Get second repository
      await service.getRepository(TEST_OWNER, 'different-repo');
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);

      // Get first repository again (should use cache)
      await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
    });
  });
});
