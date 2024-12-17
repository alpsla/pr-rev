import type { MockRepository, GitHubAPIUser, MockPullRequest } from './mock-types';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import { ReviewStatus } from '@prisma/client';

type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];

const createMockUser = (owner: string): GitHubAPIUser => ({
  login: owner,
  id: 1,
  node_id: 'U_1',
  avatar_url: `https://github.com/${owner}.png`,
  gravatar_id: '',
  url: `https://api.github.com/users/${owner}`,
  html_url: `https://github.com/${owner}`,
  followers_url: `https://api.github.com/users/${owner}/followers`,
  following_url: `https://api.github.com/users/${owner}/following{/other_user}`,
  gists_url: `https://api.github.com/users/${owner}/gists{/gist_id}`,
  starred_url: `https://api.github.com/users/${owner}/starred{/owner}{/repo}`,
  subscriptions_url: `https://api.github.com/users/${owner}/subscriptions`,
  organizations_url: `https://api.github.com/users/${owner}/orgs`,
  repos_url: `https://api.github.com/users/${owner}/repos`,
  events_url: `https://api.github.com/users/${owner}/events{/privacy}`,
  received_events_url: `https://api.github.com/users/${owner}/received_events`,
  type: 'User',
  site_admin: false
});

export const createMockRepositoryResponse = (owner: string, repo: string, overrides = {}): MockRepository => ({
  id: 123,
  node_id: 'R_123',
  name: repo,
  full_name: `${owner}/${repo}`,
  owner: createMockUser(owner),
  private: false,
  html_url: `https://github.com/${owner}/${repo}`,
  description: '',
  fork: false,
  url: `https://api.github.com/repos/${owner}/${repo}`,
  archive_url: `https://api.github.com/repos/${owner}/${repo}/{archive_format}{/ref}`,
  assignees_url: `https://api.github.com/repos/${owner}/${repo}/assignees{/user}`,
  blobs_url: `https://api.github.com/repos/${owner}/${repo}/git/blobs{/sha}`,
  branches_url: `https://api.github.com/repos/${owner}/${repo}/branches{/branch}`,
  collaborators_url: `https://api.github.com/repos/${owner}/${repo}/collaborators{/collaborator}`,
  comments_url: `https://api.github.com/repos/${owner}/${repo}/comments{/number}`,
  commits_url: `https://api.github.com/repos/${owner}/${repo}/commits{/sha}`,
  compare_url: `https://api.github.com/repos/${owner}/${repo}/compare/{base}...{head}`,
  contents_url: `https://api.github.com/repos/${owner}/${repo}/contents/{+path}`,
  contributors_url: `https://api.github.com/repos/${owner}/${repo}/contributors`,
  deployments_url: `https://api.github.com/repos/${owner}/${repo}/deployments`,
  downloads_url: `https://api.github.com/repos/${owner}/${repo}/downloads`,
  events_url: `https://api.github.com/repos/${owner}/${repo}/events`,
  forks_url: `https://api.github.com/repos/${owner}/${repo}/forks`,
  git_commits_url: `https://api.github.com/repos/${owner}/${repo}/git/commits{/sha}`,
  git_refs_url: `https://api.github.com/repos/${owner}/${repo}/git/refs{/sha}`,
  git_tags_url: `https://api.github.com/repos/${owner}/${repo}/git/tags{/sha}`,
  git_url: `git:github.com/${owner}/${repo}.git`,
  hooks_url: `https://api.github.com/repos/${owner}/${repo}/hooks`,
  issue_comment_url: `https://api.github.com/repos/${owner}/${repo}/issues/comments{/number}`,
  issue_events_url: `https://api.github.com/repos/${owner}/${repo}/issues/events{/number}`,
  issues_url: `https://api.github.com/repos/${owner}/${repo}/issues{/number}`,
  keys_url: `https://api.github.com/repos/${owner}/${repo}/keys{/key_id}`,
  labels_url: `https://api.github.com/repos/${owner}/${repo}/labels{/name}`,
  languages_url: `https://api.github.com/repos/${owner}/${repo}/languages`,
  merges_url: `https://api.github.com/repos/${owner}/${repo}/merges`,
  milestones_url: `https://api.github.com/repos/${owner}/${repo}/milestones{/number}`,
  mirror_url: null,
  notifications_url: `https://api.github.com/repos/${owner}/${repo}/notifications{?since,all,participating}`,
  pulls_url: `https://api.github.com/repos/${owner}/${repo}/pulls{/number}`,
  releases_url: `https://api.github.com/repos/${owner}/${repo}/releases{/id}`,
  ssh_url: `git@github.com:${owner}/${repo}.git`,
  stargazers_url: `https://api.github.com/repos/${owner}/${repo}/stargazers`,
  statuses_url: `https://api.github.com/repos/${owner}/${repo}/statuses/{sha}`,
  subscribers_url: `https://api.github.com/repos/${owner}/${repo}/subscribers`,
  subscription_url: `https://api.github.com/repos/${owner}/${repo}/subscription`,
  svn_url: `https://github.com/${owner}/${repo}`,
  tags_url: `https://api.github.com/repos/${owner}/${repo}/tags`,
  teams_url: `https://api.github.com/repos/${owner}/${repo}/teams`,
  trees_url: `https://api.github.com/repos/${owner}/${repo}/git/trees{/sha}`,
  clone_url: `https://github.com/${owner}/${repo}.git`,
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
  subscribers_count: 0,
  network_count: 0,
  license: null,
  forks: 0,
  open_issues: 0,
  watchers: 0,
  allow_forking: true,
  web_commit_signoff_required: false,
  security_and_analysis: null,
  ...overrides
});

export const createMockPullRequestResponse = (owner: string, repo: string, number: number, overrides = {}): MockPullRequest => ({
  url: `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`,
  id: 12345,
  node_id: `PR_${number}`,
  html_url: `https://github.com/${owner}/${repo}/pull/${number}`,
  diff_url: `https://github.com/${owner}/${repo}/pull/${number}.diff`,
  patch_url: `https://github.com/${owner}/${repo}/pull/${number}.patch`,
  issue_url: `https://api.github.com/repos/${owner}/${repo}/issues/${number}`,
  commits_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${number}/commits`,
  review_comments_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${number}/comments`,
  review_comment_url: `https://api.github.com/repos/${owner}/${repo}/pulls/comments{/number}`,
  comments_url: `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`,
  statuses_url: `https://api.github.com/repos/${owner}/${repo}/statuses/abc123`,
  number,
  state: 'open',
  locked: false,
  title: 'Test PR',
  user: createMockUser(owner),
  body: 'Test PR description',
  labels: [],
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
    label: `${owner}:feature`,
    ref: 'feature',
    sha: 'abc123',
    user: createMockUser(owner),
    repo: createMockRepositoryResponse(owner, repo)
  },
  base: {
    label: `${owner}:main`,
    ref: 'main',
    sha: 'def456',
    user: createMockUser(owner),
    repo: createMockRepositoryResponse(owner, repo)
  },
  _links: {
    self: {
      href: `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`
    },
    html: {
      href: `https://github.com/${owner}/${repo}/pull/${number}`
    },
    issue: {
      href: `https://api.github.com/repos/${owner}/${repo}/issues/${number}`
    },
    comments: {
      href: `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`
    },
    review_comments: {
      href: `https://api.github.com/repos/${owner}/${repo}/pulls/${number}/comments`
    },
    review_comment: {
      href: `https://api.github.com/repos/${owner}/${repo}/pulls/comments{/number}`
    },
    commits: {
      href: `https://api.github.com/repos/${owner}/${repo}/pulls/${number}/commits`
    },
    statuses: {
      href: `https://api.github.com/repos/${owner}/${repo}/statuses/abc123`
    }
  },
  author_association: 'OWNER',
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
  changed_files: 1,
  ...overrides
});

export const mockGithubRepoResponse: ReposGetResponse = {
  data: createMockRepositoryResponse('testowner', 'test-repo'),
  status: 200,
  headers: {},
  url: 'https://api.github.com/repos/testowner/test-repo'
};

export const mockPullRequestResponse = {
  data: createMockPullRequestResponse('testowner', 'test-repo', 1),
  status: 200,
  headers: {},
  url: 'https://api.github.com/repos/testowner/test-repo/pulls/1'
};

export const mockPullRequestReviewsResponse = {
  data: [{
    id: 1,
    node_id: 'PRR_1',
    user: createMockUser('testowner'),
    body: 'LGTM',
    state: ReviewStatus.APPROVED,  // Updated to use ReviewStatus
    html_url: 'https://github.com/testowner/test-repo/pull/1#pullrequestreview-1',
    pull_request_url: 'https://api.github.com/repos/testowner/test-repo/pulls/1',
    author_association: 'COLLABORATOR',
    submitted_at: '2024-01-01T00:00:00Z',
    commit_id: 'abc123',
    _links: {
      html: { href: 'https://github.com/testowner/test-repo/pull/1#pullrequestreview-1' },
      pull_request: { href: 'https://api.github.com/repos/testowner/test-repo/pulls/1' }
    }
  }],
  status: 200,
  headers: {},
  url: 'https://api.github.com/repos/testowner/test-repo/pulls/1/reviews'
};

export const mockRateLimitResponse: RestEndpointMethodTypes['rateLimit']['get']['response'] = {
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
        remaining: 30,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 0
      },
      graphql: {
        limit: 5000,
        remaining: 5000,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 0
      }
    },
    rate: {
      limit: 5000,
      remaining: 4999,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 1
    }
  },
  status: 200,
  headers: {},
  url: 'https://api.github.com/rate_limit'
};
