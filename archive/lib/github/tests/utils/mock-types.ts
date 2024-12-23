import { ReviewStatus } from '@prisma/client';

// Extended type for API responses that require more fields than webhook payloads
export interface GitHubAPIUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface MockRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: GitHubAPIUser;
  private: boolean;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  hooks_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  mirror_url: null | string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  svn_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  clone_url: string;
  homepage: null | string;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template: boolean;
  topics: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  has_discussions: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  allow_rebase_merge: boolean;
  template_repository: null | MockRepository;
  temp_clone_token: string;
  allow_squash_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_merge_commit: boolean;
  subscribers_count: number;
  network_count: number;
  license: null | {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  };
  forks: number;
  open_issues: number;
  watchers: number;
  allow_forking: boolean;
  web_commit_signoff_required: boolean;
  security_and_analysis: null | Record<string, unknown>;
}

export interface MockPullRequest {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  number: number;
  state: 'open' | 'closed';
  locked: boolean;
  title: string;
  user: GitHubAPIUser;
  body: string | null;
  labels: Array<{ id: number; name: string; description?: string; color?: string }>;
  milestone: null | {
    id: number;
    number: number;
    title: string;
    description: string;
    state: 'open' | 'closed';
    due_on: string | null;
  };
  active_lock_reason: null | string;
  created_at: string;
  updated_at: string;
  closed_at: null | string;
  merged_at: null | string;
  merge_commit_sha: null | string;
  assignee: null | GitHubAPIUser;
  assignees: GitHubAPIUser[];
  requested_reviewers: GitHubAPIUser[];
  requested_teams: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    privacy: string;
    permission: string;
  }>;
  head: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubAPIUser;
    repo: MockRepository;
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubAPIUser;
    repo: MockRepository;
  };
  _links: {
    self: { href: string };
    html: { href: string };
    issue: { href: string };
    comments: { href: string };
    review_comments: { href: string };
    review_comment: { href: string };
    commits: { href: string };
    statuses: { href: string };
  };
  author_association: string;
  auto_merge: null | {
    enabled_by: GitHubAPIUser;
    merge_method: 'merge' | 'squash' | 'rebase';
    commit_title: string;
    commit_message: string;
  };
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  mergeable_state: string;
  merged_by: null | GitHubAPIUser;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

// Export ReviewStatus for use in tests
export { ReviewStatus };


export const createMockPrismaClient = () => ({
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn(),
  $use: jest.fn(),
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $queryRaw: jest.fn(),
  platform: {
    findFirstOrThrow: jest.fn().mockResolvedValue({
      id: 'platform-1',
      type: 'GITHUB',
      name: 'GitHub',
      enabled: true,
    }),
  },
  repository: {
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    upsert: jest.fn().mockResolvedValue({}),
  },
  pullRequest: {
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    upsert: jest.fn().mockResolvedValue({}),
  },
  review: {
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({}),
  },
});