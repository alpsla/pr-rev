import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { Octokit } from '@octokit/rest';
import type { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

type AuthorAssociation = 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' | 'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER';

interface GitHubErrorResponse {
  response: {
    status: number;
    data: {
      message: string;
    };
  };
}

interface GitHubNetworkError extends Error {
  status: number;
  message: string;
}

type GitHubRepository = RestEndpointMethodTypes['repos']['get']['response']['data'];
type PullRequestRepository = NonNullable<RestEndpointMethodTypes['pulls']['get']['response']['data']['head']['repo']>;

export const createMockGitHubUser = (overrides: Partial<RestEndpointMethodTypes['users']['getAuthenticated']['response']['data']> = {}): RestEndpointMethodTypes['users']['getAuthenticated']['response']['data'] => ({
  login: 'test-user',
  id: 1,
  node_id: 'U_1',
  avatar_url: 'https://github.com/test-user.png',
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
  site_admin: false,
  name: 'Test User',
  company: 'Test Company',
  blog: 'https://test-user.dev',
  location: 'Test City',
  email: 'test@example.com',
  hireable: true,
  bio: 'Test bio',
  twitter_username: 'testuser',
  public_repos: 10,
  public_gists: 5,
  followers: 100,
  following: 50,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  private_gists: 1,
  total_private_repos: 5,
  owned_private_repos: 3,
  disk_usage: 1000,
  collaborators: 2,
  two_factor_authentication: true,
  plan: {
    name: 'pro',
    space: 10000,
    collaborators: 0,
    private_repos: 9999,
  },
  ...overrides,
});

export const createMockGitHubRepository = (): GitHubRepository => ({
  id: 123,
  node_id: 'R_1',
  name: 'test-repo',
  full_name: 'owner/test-repo',
  private: false,
  owner: createMockGitHubUser(),
  html_url: 'https://github.com/owner/test-repo',
  description: 'Test repository',
  fork: false,
  url: 'https://api.github.com/repos/owner/test-repo',
  archive_url: 'https://api.github.com/repos/owner/test-repo/{archive_format}{/ref}',
  assignees_url: 'https://api.github.com/repos/owner/test-repo/assignees{/user}',
  blobs_url: 'https://api.github.com/repos/owner/test-repo/git/blobs{/sha}',
  branches_url: 'https://api.github.com/repos/owner/test-repo/branches{/branch}',
  collaborators_url: 'https://api.github.com/repos/owner/test-repo/collaborators{/collaborator}',
  comments_url: 'https://api.github.com/repos/owner/test-repo/comments{/number}',
  commits_url: 'https://api.github.com/repos/owner/test-repo/commits{/sha}',
  compare_url: 'https://api.github.com/repos/owner/test-repo/compare/{base}...{head}',
  contents_url: 'https://api.github.com/repos/owner/test-repo/contents/{+path}',
  contributors_url: 'https://api.github.com/repos/owner/test-repo/contributors',
  deployments_url: 'https://api.github.com/repos/owner/test-repo/deployments',
  downloads_url: 'https://api.github.com/repos/owner/test-repo/downloads',
  events_url: 'https://api.github.com/repos/owner/test-repo/events',
  forks_url: 'https://api.github.com/repos/owner/test-repo/forks',
  git_commits_url: 'https://api.github.com/repos/owner/test-repo/git/commits{/sha}',
  git_refs_url: 'https://api.github.com/repos/owner/test-repo/git/refs{/sha}',
  git_tags_url: 'https://api.github.com/repos/owner/test-repo/git/tags{/sha}',
  git_url: 'git://github.com/owner/test-repo.git',
  hooks_url: 'https://api.github.com/repos/owner/test-repo/hooks',
  issue_comment_url: 'https://api.github.com/repos/owner/test-repo/issues/comments{/number}',
  issue_events_url: 'https://api.github.com/repos/owner/test-repo/issues/events{/number}',
  issues_url: 'https://api.github.com/repos/owner/test-repo/issues{/number}',
  keys_url: 'https://api.github.com/repos/owner/test-repo/keys{/key_id}',
  labels_url: 'https://api.github.com/repos/owner/test-repo/labels{/name}',
  languages_url: 'https://api.github.com/repos/owner/test-repo/languages',
  merges_url: 'https://api.github.com/repos/owner/test-repo/merges',
  milestones_url: 'https://api.github.com/repos/owner/test-repo/milestones{/number}',
  mirror_url: null,
  notifications_url: 'https://api.github.com/repos/owner/test-repo/notifications{?since,all,participating}',
  pulls_url: 'https://api.github.com/repos/owner/test-repo/pulls{/number}',
  releases_url: 'https://api.github.com/repos/owner/test-repo/releases{/id}',
  ssh_url: 'git@github.com:owner/test-repo.git',
  stargazers_url: 'https://api.github.com/repos/owner/test-repo/stargazers',
  statuses_url: 'https://api.github.com/repos/owner/test-repo/statuses/{sha}',
  subscribers_url: 'https://api.github.com/repos/owner/test-repo/subscribers',
  subscription_url: 'https://api.github.com/repos/owner/test-repo/subscription',
  svn_url: 'https://github.com/owner/test-repo',
  tags_url: 'https://api.github.com/repos/owner/test-repo/tags',
  teams_url: 'https://api.github.com/repos/owner/test-repo/teams',
  trees_url: 'https://api.github.com/repos/owner/test-repo/git/trees{/sha}',
  clone_url: 'https://github.com/owner/test-repo.git',
  homepage: null,
  language: 'TypeScript',
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
    admin: false,
    maintain: false,
    push: false,
    triage: false,
    pull: true,
  },
  allow_rebase_merge: true,
  template_repository: null,
  temp_clone_token: '',
  allow_squash_merge: true,
  allow_auto_merge: false,
  delete_branch_on_merge: false,
  allow_merge_commit: true,
  allow_update_branch: false,
  use_squash_pr_title_as_default: false,
  squash_merge_commit_title: 'COMMIT_OR_PR_TITLE',
  squash_merge_commit_message: 'COMMIT_MESSAGES',
  merge_commit_title: 'MERGE_MESSAGE',
  merge_commit_message: 'PR_TITLE',
  allow_forking: true,
  web_commit_signoff_required: false,
  subscribers_count: 0,
  network_count: 0,
  license: null,
  forks: 0,
  open_issues: 0,
  watchers: 0,
});

export const createMockPullRequestRepo = (): PullRequestRepository => {
  const baseRepo = createMockGitHubRepository();
  const prRepo: PullRequestRepository = {
    id: baseRepo.id,
    node_id: baseRepo.node_id,
    name: baseRepo.name,
    full_name: baseRepo.full_name,
    private: baseRepo.private,
    owner: baseRepo.owner,
    html_url: baseRepo.html_url,
    description: baseRepo.description,
    fork: baseRepo.fork,
    url: baseRepo.url,
    archive_url: baseRepo.archive_url,
    assignees_url: baseRepo.assignees_url,
    blobs_url: baseRepo.blobs_url,
    branches_url: baseRepo.branches_url,
    collaborators_url: baseRepo.collaborators_url,
    comments_url: baseRepo.comments_url,
    commits_url: baseRepo.commits_url,
    compare_url: baseRepo.compare_url,
    contents_url: baseRepo.contents_url,
    contributors_url: baseRepo.contributors_url,
    deployments_url: baseRepo.deployments_url,
    downloads_url: baseRepo.downloads_url,
    events_url: baseRepo.events_url,
    forks_url: baseRepo.forks_url,
    git_commits_url: baseRepo.git_commits_url,
    git_refs_url: baseRepo.git_refs_url,
    git_tags_url: baseRepo.git_tags_url,
    git_url: baseRepo.git_url,
    hooks_url: baseRepo.hooks_url,
    issue_comment_url: baseRepo.issue_comment_url,
    issue_events_url: baseRepo.issue_events_url,
    issues_url: baseRepo.issues_url,
    keys_url: baseRepo.keys_url,
    labels_url: baseRepo.labels_url,
    languages_url: baseRepo.languages_url,
    merges_url: baseRepo.merges_url,
    milestones_url: baseRepo.milestones_url,
    mirror_url: baseRepo.mirror_url,
    notifications_url: baseRepo.notifications_url,
    pulls_url: baseRepo.pulls_url,
    releases_url: baseRepo.releases_url,
    ssh_url: baseRepo.ssh_url,
    stargazers_url: baseRepo.stargazers_url,
    statuses_url: baseRepo.statuses_url,
    subscribers_url: baseRepo.subscribers_url,
    subscription_url: baseRepo.subscription_url,
    svn_url: baseRepo.svn_url,
    tags_url: baseRepo.tags_url,
    teams_url: baseRepo.teams_url,
    trees_url: baseRepo.trees_url,
    clone_url: baseRepo.clone_url,
    homepage: baseRepo.homepage,
    language: baseRepo.language,
    forks_count: baseRepo.forks_count,
    stargazers_count: baseRepo.stargazers_count,
    watchers_count: baseRepo.watchers_count,
    size: baseRepo.size,
    default_branch: baseRepo.default_branch,
    open_issues_count: baseRepo.open_issues_count,
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    has_pages: false,
    has_downloads: true,
    has_discussions: false,
    archived: false,
    disabled: false,
    visibility: baseRepo.visibility,
    pushed_at: baseRepo.pushed_at,
    created_at: baseRepo.created_at,
    updated_at: baseRepo.updated_at,
    permissions: baseRepo.permissions,
    allow_rebase_merge: true,
    temp_clone_token: '',
    allow_squash_merge: true,
    allow_merge_commit: true,
    allow_forking: true,
    web_commit_signoff_required: false,
    forks: baseRepo.forks,
    open_issues: baseRepo.open_issues,
    watchers: baseRepo.watchers,
    license: baseRepo.license,
  };

  return prRepo;
};

export const createMockGitHubPullRequest = (): RestEndpointMethodTypes['pulls']['get']['response']['data'] => {
  const bugLabel = {
    id: 1,
    node_id: 'L_1',
    url: 'https://api.github.com/repos/owner/test-repo/labels/bug',
    name: 'bug',
    description: 'Something is not working',
    color: 'f29513',
    default: true,
  };

  const enhancementLabel = {
    id: 2,
    node_id: 'L_2',
    url: 'https://api.github.com/repos/owner/test-repo/labels/enhancement',
    name: 'enhancement',
    description: 'New feature or request',
    color: '84b6eb',
    default: false,
  };

  const mockRepo = createMockPullRequestRepo();

  return {
    url: 'https://api.github.com/repos/owner/test-repo/pulls/1',
    id: 1,
    node_id: 'PR_1',
    html_url: 'https://github.com/owner/test-repo/pull/1',
    diff_url: 'https://github.com/owner/test-repo/pull/1.diff',
    patch_url: 'https://github.com/owner/test-repo/pull/1.patch',
    issue_url: 'https://api.github.com/repos/owner/test-repo/issues/1',
    commits_url: 'https://api.github.com/repos/owner/test-repo/pulls/1/commits',
    review_comments_url: 'https://api.github.com/repos/owner/test-repo/pulls/1/comments',
    review_comment_url: 'https://api.github.com/repos/owner/test-repo/pulls/comments{/number}',
    comments_url: 'https://api.github.com/repos/owner/test-repo/issues/1/comments',
    statuses_url: 'https://api.github.com/repos/owner/test-repo/statuses/abc123',
    number: 1,
    state: 'open',
    locked: false,
    title: 'Test PR',
    user: createMockGitHubUser(),
    body: 'Test PR description',
    labels: [bugLabel, enhancementLabel],
    milestone: null,
    active_lock_reason: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: null,
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    head: {
      label: 'owner:feature',
      ref: 'feature',
      sha: 'abc123',
      user: createMockGitHubUser(),
      repo: mockRepo,
    },
    base: {
      label: 'owner:main',
      ref: 'main',
      sha: 'def456',
      user: createMockGitHubUser(),
      repo: mockRepo,
    },
    _links: {
      self: { href: 'https://api.github.com/repos/owner/test-repo/pulls/1' },
      html: { href: 'https://github.com/owner/test-repo/pull/1' },
      issue: { href: 'https://api.github.com/repos/owner/test-repo/issues/1' },
      comments: { href: 'https://api.github.com/repos/owner/test-repo/issues/1/comments' },
      review_comments: { href: 'https://api.github.com/repos/owner/test-repo/pulls/1/comments' },
      review_comment: { href: 'https://api.github.com/repos/owner/test-repo/pulls/comments{/number}' },
      commits: { href: 'https://api.github.com/repos/owner/test-repo/pulls/1/commits' },
      statuses: { href: 'https://api.github.com/repos/owner/test-repo/statuses/abc123' },
    },
    author_association: 'MEMBER',
    auto_merge: null,
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
  };
};

export const createMockGitHubPullRequestReview = (
  state = 'APPROVED',
  body = 'Looks good to me!',
  authorAssociation: AuthorAssociation = 'MEMBER',
  overrides: Partial<RestEndpointMethodTypes['pulls']['listReviews']['response']['data'][0]> = {}
): RestEndpointMethodTypes['pulls']['listReviews']['response']['data'][0] => ({
  id: 1,
  node_id: 'PRR_1',
  user: createMockGitHubUser({ login: 'reviewer' }),
  body,
  state,
  html_url: 'https://github.com/owner/test-repo/pull/1#pullrequestreview-1',
  pull_request_url: 'https://api.github.com/repos/owner/test-repo/pulls/1',
  _links: {
    html: { href: 'https://github.com/owner/test-repo/pull/1#pullrequestreview-1' },
    pull_request: { href: 'https://api.github.com/repos/owner/test-repo/pulls/1' },
  },
  submitted_at: '2024-01-01T00:00:00Z',
  commit_id: 'abc123',
  author_association: authorAssociation,
  ...overrides,
});

interface MockContext {
  prisma: jest.Mocked<PrismaClient>;
  octokit: jest.Mocked<Octokit>;
  responses: {
    repository: RestEndpointMethodTypes['repos']['get']['response'];
    pullRequest: RestEndpointMethodTypes['pulls']['get']['response'];
    pullRequestReview: RestEndpointMethodTypes['pulls']['listReviews']['response'];
  };
}

export const createMockContext = (): MockContext => {
  const mockRepository = createMockGitHubRepository();
  const mockPullRequest = createMockGitHubPullRequest();
  const mockPullRequestReview = createMockGitHubPullRequestReview();

  const ctx: MockContext = {
    prisma: {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    } as unknown as jest.Mocked<PrismaClient>,
    octokit: {
      rest: {
        pulls: {
          get: jest.fn(),
          listReviews: jest.fn(),
        },
        repos: {
          get: jest.fn(),
        },
      },
    } as unknown as jest.Mocked<Octokit>,
    responses: {
      repository: {
        data: mockRepository,
        status: 200,
        url: 'https://api.github.com/repos/owner/test-repo',
        headers: {},
      },
      pullRequest: {
        data: mockPullRequest,
        status: 200,
        url: 'https://api.github.com/repos/owner/test-repo/pulls/1',
        headers: {},
      },
      pullRequestReview: {
        data: [mockPullRequestReview],
        status: 200,
        url: 'https://api.github.com/repos/owner/test-repo/pulls/1/reviews',
        headers: {},
      },
    },
  };

  return ctx;
};

export const setupSuccessfulMocks = (ctx: MockContext): void => {
  ctx.octokit.rest.pulls.get.mockResolvedValue(ctx.responses.pullRequest);
  ctx.octokit.rest.pulls.listReviews.mockResolvedValue(ctx.responses.pullRequestReview);
  ctx.octokit.rest.repos.get.mockResolvedValue(ctx.responses.repository);
};

export const setupNotFoundErrorMocks = (ctx: MockContext): void => {
  const notFoundError: GitHubErrorResponse = {
    response: {
      status: 404,
      data: { message: 'Not Found' },
    },
  };
  ctx.octokit.rest.pulls.get.mockRejectedValue(notFoundError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(notFoundError);
  ctx.octokit.rest.repos.get.mockRejectedValue(notFoundError);
};

export const setupAuthenticationErrorMocks = (ctx: MockContext): void => {
  const authError: GitHubErrorResponse = {
    response: {
      status: 401,
      data: { message: 'Bad credentials' },
    },
  };
  ctx.octokit.rest.pulls.get.mockRejectedValue(authError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(authError);
  ctx.octokit.rest.repos.get.mockRejectedValue(authError);
};

export const setupRateLimitExceededMocks = (ctx: MockContext): void => {
  const rateLimitError: GitHubErrorResponse = {
    response: {
      status: 403,
      data: { message: 'API rate limit exceeded' },
    },
  };
  ctx.octokit.rest.pulls.get.mockRejectedValue(rateLimitError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(rateLimitError);
  ctx.octokit.rest.repos.get.mockRejectedValue(rateLimitError);
};

export const setupServerErrorMocks = (ctx: MockContext): void => {
  const serverError: GitHubErrorResponse = {
    response: {
      status: 500,
      data: { message: 'Internal Server Error' },
    },
  };
  ctx.octokit.rest.pulls.get.mockRejectedValue(serverError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(serverError);
  ctx.octokit.rest.repos.get.mockRejectedValue(serverError);
};

export const setupNetworkErrorMocks = (ctx: MockContext): void => {
  const networkError: GitHubNetworkError = {
    name: 'NetworkError',
    message: 'Network Error',
    status: 0,
  };
  ctx.octokit.rest.pulls.get.mockRejectedValue(networkError);
  ctx.octokit.rest.pulls.listReviews.mockRejectedValue(networkError);
  ctx.octokit.rest.repos.get.mockRejectedValue(networkError);
};
