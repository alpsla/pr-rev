import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { 
  RateLimitError, 
  NotFoundError, 
  AuthenticationError, 
  NetworkError, 
  ServerError 
} from '../../errors';

type RateLimitGetResponse = RestEndpointMethodTypes['rateLimit']['get']['response'];
type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];
type PullsGetResponse = RestEndpointMethodTypes['pulls']['get']['response'];
type PullsListReviewsResponse = RestEndpointMethodTypes['pulls']['listReviews']['response'];

// Mock error responses
export const mockRateLimitExceededError = {
  status: 403,
  response: {
    status: 403,
    data: {
      message: new RateLimitError().message
    }
  }
};

export const mockNotFoundError = {
  status: 404,
  response: {
    status: 404,
    data: {
      message: new NotFoundError().message
    }
  }
};

export const mockAuthenticationError = {
  status: 401,
  response: {
    status: 401,
    data: {
      message: new AuthenticationError().message
    }
  }
};

export const mockNetworkError = {
  message: new NetworkError().message,
  status: 500
};

export const mockServerError = {
  status: 500,
  response: {
    status: 500,
    data: {
      message: new ServerError().message
    }
  }
};

const mockUser = {
  login: 'test-owner',
  id: 1,
  node_id: 'U_1',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/test-owner',
  html_url: 'https://github.com/test-owner',
  followers_url: 'https://api.github.com/users/test-owner/followers',
  following_url: 'https://api.github.com/users/test-owner/following{/other_user}',
  gists_url: 'https://api.github.com/users/test-owner/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/test-owner/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/test-owner/subscriptions',
  organizations_url: 'https://api.github.com/users/test-owner/orgs',
  repos_url: 'https://api.github.com/users/test-owner/repos',
  events_url: 'https://api.github.com/users/test-owner/events{/privacy}',
  received_events_url: 'https://api.github.com/users/test-owner/received_events',
  type: 'User',
  site_admin: false,
  name: 'Test Owner',
  email: null,
  starred_at: undefined
};

const mockRepo = {
  id: 123456,
  node_id: 'R_123456',
  name: 'test-repo',
  full_name: 'test-owner/test-repo',
  private: false,
  owner: mockUser,
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
  issue_comment_url: 'https://api.github.com/repos/test-owner/test-repo/issues/comments{/number}',
  issue_events_url: 'https://api.github.com/repos/test-owner/test-repo/issues/events{/number}',
  issues_url: 'https://api.github.com/repos/test-owner/test-repo/issues{/number}',
  keys_url: 'https://api.github.com/repos/test-owner/test-repo/keys{/key_id}',
  labels_url: 'https://api.github.com/repos/test-owner/test-repo/labels{/name}',
  languages_url: 'https://api.github.com/repos/test-owner/test-repo/languages',
  merges_url: 'https://api.github.com/repos/test-owner/test-repo/merges',
  milestones_url: 'https://api.github.com/repos/test-owner/test-repo/milestones{/number}',
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
  mirror_url: null,
  hooks_url: 'https://api.github.com/repos/test-owner/test-repo/hooks',
  svn_url: 'https://github.com/test-owner/test-repo',
  homepage: null,
  language: 'TypeScript',
  forks_count: 0,
  stargazers_count: 0,
  watchers_count: 0,
  size: 0,
  default_branch: 'main',
  open_issues_count: 0,
  is_template: false,
  topics: [] as string[],
  has_issues: true,
  has_projects: true,
  has_wiki: true,
  has_pages: false,
  has_downloads: true,
  has_discussions: false,
  archived: false,
  disabled: false,
  visibility: 'public',
  pushed_at: '2023-01-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  permissions: {
    admin: true,
    push: true,
    pull: true
  },
  allow_rebase_merge: true,
  template_repository: null,
  temp_clone_token: '',
  allow_squash_merge: true,
  allow_auto_merge: false,
  delete_branch_on_merge: false,
  allow_merge_commit: true,
  subscribers_count: 0,
  network_count: 0,
  license: null,
  forks: 0,
  open_issues: 0,
  watchers: 0
};

export const mockRateLimitResponse: RateLimitGetResponse = {
  status: 200,
  url: 'https://api.github.com/rate_limit',
  headers: {},
  data: {
    resources: {
      core: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      },
      search: {
        limit: 30,
        remaining: 29,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      },
      graphql: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      },
      integration_manifest: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      },
      source_import: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      },
      code_scanning_upload: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      },
      actions_runner_registration: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      },
      scim: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1
      }
    },
    rate: {
      limit: 5000,
      remaining: 4999,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 1
    }
  }
};

export const mockGithubRepoResponse: ReposGetResponse = {
  status: 200,
  url: 'https://api.github.com/repos/test-owner/test-repo',
  headers: {},
  data: mockRepo
};

export const mockPullRequestResponse: PullsGetResponse = {
  status: 200,
  url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
  headers: {},
  data: {
    url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
    id: 1,
    node_id: 'PR_1',
    html_url: 'https://github.com/test-owner/test-repo/pull/1',
    diff_url: 'https://github.com/test-owner/test-repo/pull/1.diff',
    patch_url: 'https://github.com/test-owner/test-repo/pull/1.patch',
    issue_url: 'https://api.github.com/repos/test-owner/test-repo/issues/1',
    number: 1,
    state: 'open',
    locked: false,
    title: 'Test PR',
    user: mockUser,
    body: 'Test PR description',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: null,
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    labels: [],
    milestone: null,
    draft: false,
    commits_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/commits',
    review_comments_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/comments',
    review_comment_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/comments{/number}',
    comments_url: 'https://api.github.com/repos/test-owner/test-repo/issues/1/comments',
    statuses_url: 'https://api.github.com/repos/test-owner/test-repo/statuses/{sha}',
    head: {
      label: 'test-owner:feature',
      ref: 'feature',
      sha: 'abc123',
      user: mockUser,
      repo: mockRepo
    },
    base: {
      label: 'test-owner:main',
      ref: 'main',
      sha: 'def456',
      user: mockUser,
      repo: mockRepo
    },
    _links: {
      self: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1' },
      html: { href: 'https://github.com/test-owner/test-repo/pull/1' },
      issue: { href: 'https://api.github.com/repos/test-owner/test-repo/issues/1' },
      comments: { href: 'https://api.github.com/repos/test-owner/test-repo/issues/1/comments' },
      review_comments: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/comments' },
      review_comment: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/comments{/number}' },
      commits: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/commits' },
      statuses: { href: 'https://api.github.com/repos/test-owner/test-repo/statuses/abc123' }
    },
    author_association: 'OWNER',
    auto_merge: null,
    active_lock_reason: null,
    merged: false,
    mergeable: true,
    rebaseable: true,
    mergeable_state: 'clean',
    merged_by: null,
    comments: 0,
    review_comments: 0,
    maintainer_can_modify: false,
    commits: 1,
    additions: 10,
    deletions: 5,
    changed_files: 2
  }
};

export const mockPullRequestReviewsResponse: PullsListReviewsResponse = {
  status: 200,
  url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1/reviews',
  headers: {},
  data: [{
    id: 1,
    node_id: 'PRR_1',
    user: mockUser,
    body: 'LGTM',
    state: 'APPROVED',
    html_url: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1',
    pull_request_url: 'https://api.github.com/repos/test-owner/test-repo/pulls/1',
    author_association: 'COLLABORATOR',
    submitted_at: '2023-01-01T00:00:00Z',
    commit_id: 'abc123',
    _links: {
      html: { href: 'https://github.com/test-owner/test-repo/pull/1#pullrequestreview-1' },
      pull_request: { href: 'https://api.github.com/repos/test-owner/test-repo/pulls/1' }
    }
  }]
};
