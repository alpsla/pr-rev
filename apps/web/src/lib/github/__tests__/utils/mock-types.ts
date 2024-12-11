import type { RestEndpointMethodTypes } from '@octokit/rest';

export type MockGitHubUser = RestEndpointMethodTypes['users']['getAuthenticated']['response']['data'];
export type MockRepository = RestEndpointMethodTypes['repos']['get']['response']['data'];
export type MockPullRequest = RestEndpointMethodTypes['pulls']['get']['response']['data'];

export type WebhookEventName = 'pull_request' | 'pull_request_review' | 'repository';

export interface BaseWebhookPayload {
  action: string;
  repository: {
    id: string;
    name: string;
    full_name: string;
    private?: boolean;
    html_url?: string;
    owner: MockGitHubUser;
  };
}

export interface PullRequestWebhookPayload extends BaseWebhookPayload {
  pull_request: {
    number: number;
    title: string;
    state: string;
    user: MockGitHubUser;
    head: {
      ref: string;
      sha: string;
    };
    base: {
      ref: string;
    };
    draft: boolean;
    merged?: boolean;
    merged_at?: string;
  };
}

export interface PullRequestReviewWebhookPayload extends BaseWebhookPayload {
  review: {
    id: string;
    user: MockGitHubUser;
    body: string;
    state: string;
    submitted_at: string;
  };
  pull_request: {
    id: string;
    number: number;
    user: MockGitHubUser;
  };
}

export interface RepositoryWebhookPayload extends BaseWebhookPayload {
  // No additional fields needed for repository events
}

export type WebhookEventPayload = 
  | PullRequestWebhookPayload 
  | PullRequestReviewWebhookPayload 
  | RepositoryWebhookPayload;

export const isPullRequestPayload = (payload: WebhookEventPayload): payload is PullRequestWebhookPayload => {
  return 'pull_request' in payload && !('review' in payload);
};

export const isPullRequestReviewPayload = (payload: WebhookEventPayload): payload is PullRequestReviewWebhookPayload => {
  return 'review' in payload && 'pull_request' in payload;
};

export const isRepositoryPayload = (payload: WebhookEventPayload): payload is RepositoryWebhookPayload => {
  return !('pull_request' in payload) && !('review' in payload);
};

export const createBasicRepository = (): MockRepository => ({
  id: 123,
  node_id: 'R_1',
  name: 'test-repo',
  full_name: 'owner/test-repo',
  private: false,
  owner: {
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
  },
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
    admin: false,
    maintain: false,
    push: false,
    triage: false,
    pull: true,
  },
  allow_rebase_merge: true,
  allow_squash_merge: true,
  allow_merge_commit: true,
  subscribers_count: 0,
  network_count: 0,
  license: null,
  forks: 0,
  open_issues: 0,
  watchers: 0,
  allow_forking: true,
  web_commit_signoff_required: false,
  security_and_analysis: {},
  custom_properties: {},
});
