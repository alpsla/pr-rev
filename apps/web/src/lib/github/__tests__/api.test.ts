import { createMockContext, type MockContext } from './mocks/prisma';
import { Octokit } from '@octokit/rest';
import { GitHubService } from '../api';

describe('Enhanced GitHub Service Tests', () => {
  let service: GitHubService;
  let ctx: MockContext;
  let octokitInstance: Octokit;
  

  beforeEach(() => {
    // Initialize the mock context
    ctx = createMockContext();
    
    // Reset all mocks
    jest.clearAllMocks();

    // Create new Octokit instance
    octokitInstance = new Octokit({ auth: 'test-token' });

    // Set up rate limit mock
    mocks.mockRateLimitGet.mockImplementation(() => 
      Promise.resolve(createMockResponse(createRateLimitResponse()))
    );
    
    service = new GitHubService(
      ctx.prisma,
      octokitInstance,
      {
        type: 'token',
        credentials: { token: 'test-token' }
      }
    );

    // Add any additional mock setups
    mocks.mockReposGet.mockResolvedValue(mockGithubRepoResponse);
    mocks.mockPullsGet.mockResolvedValue(mockPullsGetResponse);
  });


  afterEach(async () => {
    await service.destroy();
  });

  const createBasicMockRepo = (overrides: Partial<RepoData> = {}): RepoData => ({
    id: 1,
    node_id: 'R_1',
    name: 'test-repo',
    full_name: 'test-owner/test-repo',
    private: false,
    owner: {
      login: 'test-owner',
      id: 1,
      node_id: 'U_1',
      avatar_url: 'https://github.com/images/error/octocat.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/test-owner',
      html_url: 'https://github.com/test-owner',
      type: 'User',
      site_admin: false,
      starred_at: undefined,
      followers_url: 'https://api.github.com/users/test-owner/followers',
      following_url: 'https://api.github.com/users/test-owner/following{/other_user}',
      gists_url: 'https://api.github.com/users/test-owner/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/test-owner/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/test-owner/subscriptions',
      organizations_url: 'https://api.github.com/users/test-owner/orgs',
      repos_url: 'https://api.github.com/users/test-owner/repos',
      events_url: 'https://api.github.com/users/test-owner/events{/privacy}',
      received_events_url: 'https://api.github.com/users/test-owner/received_events'
    },
    html_url: 'https://github.com/test-owner/test-repo',
    description: 'Test repository',
    fork: false,
    url: 'https://api.github.com/repos/test-owner/test-repo',
    archive_url: 'https://api.github.com/repos/test-owner/test-repo/{archive_format}{/ref}',
    assignees_url: 'https://api.github.com/repos/test-owner/test-repo/assignees{/user}',
    blobs_url: 'https://api.github.com/repos/test-owner/test-repo/git/blobs{/sha}',
    branches_url: 'https://api.github.com/repos/test-owner/test-repo/branches{/branch}',
    collaborators_url: 'https://api.github.com/repos/test-owner/test-repo/collaborators{/collaborator}',
    comments_url: 'https://api.github.com/repos/test-owner/test-repo/comments{/number}',
    commits_url: 'https://api.github.com/repos/test-owner/test-repo/commits{/sha}',
    compare_url: 'https://api.github.com/repos/test-owner/test-repo/compare/{base}...{head}',
    contents_url: 'https://api.github.com/repos/test-owner/test-repo/contents/{+path}',
    contributors_url: 'https://api.github.com/repos/test-owner/test-repo/contributors',
    deployments_url: 'https://api.github.com/repos/test-owner/test-repo/deployments',
    downloads_url: 'https://api.github.com/repos/test-owner/test-repo/downloads',
    events_url: 'https://api.github.com/repos/test-owner/test-repo/events',
    forks_url: 'https://api.github.com/repos/test-owner/test-repo/forks',
    git_commits_url: 'https://api.github.com/repos/test-owner/test-repo/git/commits{/sha}',
    git_refs_url: 'https://api.github.com/repos/test-owner/test-repo/git/refs{/sha}',
    git_tags_url: 'https://api.github.com/repos/test-owner/test-repo/git/tags{/sha}',
    git_url: 'git://github.com/test-owner/test-repo.git',
    hooks_url: 'https://api.github.com/repos/test-owner/test-repo/hooks',
    issue_comment_url: 'https://api.github.com/repos/test-owner/test-repo/issues/comments{/number}',
    issue_events_url: 'https://api.github.com/repos/test-owner/test-repo/issues/events{/number}',
    issues_url: 'https://api.github.com/repos/test-owner/test-repo/issues{/number}',
    keys_url: 'https://api.github.com/repos/test-owner/test-repo/keys{/key_id}',
    labels_url: 'https://api.github.com/repos/test-owner/test-repo/labels{/name}',
    languages_url: 'https://api.github.com/repos/test-owner/test-repo/languages',
    merges_url: 'https://api.github.com/repos/test-owner/test-repo/merges',
    milestones_url: 'https://api.github.com/repos/test-owner/test-repo/milestones{/number}',
    mirror_url: null,
    notifications_url: 'https://api.github.com/repos/test-owner/test-repo/notifications{?since,all,participating}',
    pulls_url: 'https://api.github.com/repos/test-owner/test-repo/pulls{/number}',
    releases_url: 'https://api.github.com/repos/test-owner/test-repo/releases{/id}',
    ssh_url: 'git@github.com:test-owner/test-repo.git',
    stargazers_url: 'https://api.github.com/repos/test-owner/test-repo/stargazers',
    statuses_url: 'https://api.github.com/repos/test-owner/test-repo/statuses/{sha}',
    subscribers_url: 'https://api.github.com/repos/test-owner/test-repo/subscribers',
    subscription_url: 'https://api.github.com/repos/test-owner/test-repo/subscription',
    tags_url: 'https://api.github.com/repos/test-owner/test-repo/tags',
    teams_url: 'https://api.github.com/repos/test-owner/test-repo/teams',
    trees_url: 'https://api.github.com/repos/test-owner/test-repo/git/trees{/sha}',
    clone_url: 'https://github.com/test-owner/test-repo.git',
    svn_url: 'https://github.com/test-owner/test-repo',
    homepage: null,
    language: null,
    forks_count: 0,
    stargazers_count: 0,
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
    allow_rebase_merge: true,
    template_repository: null,
    temp_clone_token: '',
    allow_squash_merge: true,
    allow_auto_merge: false,
    delete_branch_on_merge: false,
    allow_update_branch: false,
    use_squash_pr_title_as_default: false,
    squash_merge_commit_title: 'COMMIT_OR_PR_TITLE',
    squash_merge_commit_message: 'COMMIT_MESSAGES',
    merge_commit_title: 'MERGE_MESSAGE',
    merge_commit_message: 'PR_TITLE',
    allow_merge_commit: true,
    allow_forking: true,
    web_commit_signoff_required: false,
    subscribers_count: 0,
    network_count: 0,
    license: null,
    forks: 0,
    open_issues: 0,
    watchers: 0,
    ...overrides
  });

  describe('Repository Operations', () => {
    test('fetches repository information', async () => {
      const mockRepo = createBasicMockRepo();
      mocks.mockReposGet.mockImplementation(() => Promise.resolve(createMockResponse(mockRepo)));

      const repo = await service.getRepository('test-owner', 'test-repo');
      expect(repo).toBeDefined();
      expect(repo.name).toBe('test-repo');
      expect(repo.fullName).toBe('test-owner/test-repo');
      expect(mocks.mockReposGet).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo'
      });
    });

    test('handles repository not found error', async () => {
      const error = new Error('Not Found');
      Object.assign(error, { status: 404 });
      mocks.mockReposGet.mockImplementation(() => Promise.reject(error));
      await expect(service.getRepository('test-owner', 'test-repo'))
        .rejects.toThrow('Not Found');
    });
  });

  describe('Rate Limiting', () => {
    test('handles rate limit errors with retry', async () => {
      const rateLimitError = new Error('API rate limit exceeded');
      Object.assign(rateLimitError, { status: 403 });

      const mockRepo = createBasicMockRepo();
      mocks.mockReposGet
        .mockImplementationOnce(() => Promise.reject(rateLimitError))
        .mockImplementationOnce(() => Promise.resolve(createMockResponse(mockRepo)));

      const repo = await service.getRepository('test-owner', 'test-repo');
      expect(repo).toBeDefined();
      expect(mocks.mockReposGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    test('handles network errors', async () => {
      const networkError = new Error('Network error');
      Object.assign(networkError, { status: 500 });
      mocks.mockReposGet.mockImplementation(() => Promise.reject(networkError));

      await expect(service.getRepository('test-owner', 'test-repo'))
        .rejects.toThrow('Network error');
    });

    test('handles invalid responses', async () => {
      mocks.mockReposGet.mockImplementation(() => Promise.resolve(createMockResponse({} as RepoData)));

      await expect(service.getRepository('test-owner', 'test-repo'))
        .rejects.toThrow();
    });
  });
});
