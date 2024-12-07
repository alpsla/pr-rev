import { RestEndpointMethodTypes } from '@octokit/rest';
import { ResponseHeaders} from '@octokit/types';
import { createTypedMock } from './utils';

type PullRequestParams = RestEndpointMethodTypes['pulls']['get']['parameters'];
type PullRequestResponse = RestEndpointMethodTypes['pulls']['get']['response'];

function createUserResponse(login: string) {
  return {
    login,
    id: 1,
    node_id: 'U_1',
    avatar_url: `https://github.com/${login}.png`,
    gravatar_id: '',
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
    type: 'User' as const,
    site_admin: false,
    name: null,
    email: null,
    starred_at: undefined
  };
}

function createRepoResponse(params: { owner: string; repo: string }) {
  const baseUrl = `https://api.github.com/repos/${params.owner}/${params.repo}`;
  return {
    id: 1,
    node_id: 'R_1',
    name: params.repo,
    full_name: `${params.owner}/${params.repo}`,
    private: false,
    owner: createUserResponse(params.owner),
    html_url: `https://github.com/${params.owner}/${params.repo}`,
    description: 'Test repository',
    fork: false,
    url: baseUrl,
    archive_url: `${baseUrl}/{archive_format}{/ref}`,
    assignees_url: `${baseUrl}/assignees{/user}`,
    blobs_url: `${baseUrl}/git/blobs{/sha}`,
    branches_url: `${baseUrl}/branches{/branch}`,
    collaborators_url: `${baseUrl}/collaborators{/collaborator}`,
    comments_url: `${baseUrl}/comments{/number}`,
    commits_url: `${baseUrl}/commits{/sha}`,
    compare_url: `${baseUrl}/compare/{base}...{head}`,
    contents_url: `${baseUrl}/contents/{+path}`,
    contributors_url: `${baseUrl}/contributors`,
    deployments_url: `${baseUrl}/deployments`,
    downloads_url: `${baseUrl}/downloads`,
    events_url: `${baseUrl}/events`,
    forks_url: `${baseUrl}/forks`,
    git_commits_url: `${baseUrl}/git/commits{/sha}`,
    git_refs_url: `${baseUrl}/git/refs{/sha}`,
    git_tags_url: `${baseUrl}/git/tags{/sha}`,
    git_url: `git://github.com/${params.owner}/${params.repo}.git`,
    hooks_url: `${baseUrl}/hooks`,
    issue_comment_url: `${baseUrl}/issues/comments{/number}`,
    issue_events_url: `${baseUrl}/issues/events{/number}`,
    issues_url: `${baseUrl}/issues{/number}`,
    keys_url: `${baseUrl}/keys{/key_id}`,
    labels_url: `${baseUrl}/labels{/name}`,
    languages_url: `${baseUrl}/languages`,
    merges_url: `${baseUrl}/merges`,
    milestones_url: `${baseUrl}/milestones{/number}`,
    notifications_url: `${baseUrl}/notifications{?since,all,participating}`,
    pulls_url: `${baseUrl}/pulls{/number}`,
    releases_url: `${baseUrl}/releases{/id}`,
    ssh_url: `git@github.com:${params.owner}/${params.repo}.git`,
    stargazers_url: `${baseUrl}/stargazers`,
    statuses_url: `${baseUrl}/statuses/{sha}`,
    subscribers_url: `${baseUrl}/subscribers`,
    subscription_url: `${baseUrl}/subscription`,
    tags_url: `${baseUrl}/tags`,
    teams_url: `${baseUrl}/teams`,
    trees_url: `${baseUrl}/git/trees{/sha}`,
    clone_url: `https://github.com/${params.owner}/${params.repo}.git`,
    svn_url: `https://github.com/${params.owner}/${params.repo}`,
    mirror_url: null,
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
    visibility: 'public' as const,
    pushed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    permissions: {
      admin: false,
      maintain: false,
      push: false,
      triage: false,
      pull: true
    },
    allow_rebase_merge: true,
    temp_clone_token: '',
    allow_squash_merge: true,
    allow_merge_commit: true,
    allow_forking: true,
    forks: 0,
    open_issues: 0,
    license: null,
    watchers: 0,
    web_commit_signoff_required: false
  };
}

function createPullRequestLinks(params: PullRequestParams) {
  const baseUrl = `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}`;
  return {
    self: { href: baseUrl },
    html: { href: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}` },
    issue: { href: baseUrl.replace('/pulls/', '/issues/') },
    comments: { href: `${baseUrl}/comments` },
    review_comments: { href: `${baseUrl}/reviews` },
    review_comment: { href: `${baseUrl}/comments{/number}` },
    commits: { href: `${baseUrl}/commits` },
    statuses: { href: `${baseUrl}/statuses` }
  };
}

function createDefaultHeaders(): ResponseHeaders {
  return {
    'x-github-media-type': 'github.v3; format=json',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString()
  };
}

export const createPullRequestResponse = createTypedMock<PullRequestParams, PullRequestResponse>(
  async (params) => ({
    status: 200,
    url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}`,
    headers: createDefaultHeaders(),
    data: {
      url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}`,
      id: 1,
      node_id: 'PR_1',
      html_url: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}`,
      diff_url: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}.diff`,
      patch_url: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}.patch`,
      issue_url: `https://api.github.com/repos/${params.owner}/${params.repo}/issues/${params.pull_number}`,
      commits_url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}/commits`,
      review_comments_url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}/comments`,
      review_comment_url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/comments{/number}`,
      comments_url: `https://api.github.com/repos/${params.owner}/${params.repo}/issues/${params.pull_number}/comments`,
      statuses_url: `https://api.github.com/repos/${params.owner}/${params.repo}/statuses/abc123`,
      number: params.pull_number,
      state: 'open',
      locked: false,
      title: 'Test PR',
      user: createUserResponse(params.owner),
      body: 'Test PR description',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
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
      commits: 1,
      additions: 100,
      deletions: 50,
      changed_files: 3,
      head: {
        label: 'feature',
        ref: 'feature',
        sha: 'abc123',
        user: createUserResponse(params.owner),
        repo: createRepoResponse(params)
      },
      base: {
        label: 'main',
        ref: 'main',
        sha: 'def456',
        user: createUserResponse(params.owner),
        repo: createRepoResponse(params)
      },
      _links: createPullRequestLinks(params),
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
      maintainer_can_modify: true
    }
  })
);

export type { PullRequestParams, PullRequestResponse };