import type { RestEndpointMethodTypes } from '@octokit/rest';
import { createMockPullRequest, createMockRepository } from './mock-factory';
import { TEST_OWNER, TEST_REPO } from './test-data';

type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];
type PullsGetResponse = RestEndpointMethodTypes['pulls']['get']['response'];
type PullsListReviewsResponse = RestEndpointMethodTypes['pulls']['listReviews']['response']['data'][number];

export const createMockRepositoryResponse = (
    owner: string = TEST_OWNER,
    repo: string = TEST_REPO
  ): ReposGetResponse['data'] => {

    const baseRepo = createMockRepository({ owner: { login: owner, avatar_url: 'https://example.com/avatar.png' }});

    return {
      ...baseRepo,
      id: 123,
      node_id: 'R_kgDOHbQX0w',
      name: repo,
      full_name: `${owner}/${repo}`,
      private: false,
      html_url: `https://github.com/${owner}/${repo}`,
      description: 'mock description',
      fork: false,
      url: `https://api.github.com/repos/${owner}/${repo}`,
      git_url: `git://github.com/${owner}/${repo}.git`,
      ssh_url: `git@github.com:${owner}/${repo}.git`,
      clone_url: `https://github.com/${owner}/${repo}.git`,
      svn_url: `https://github.com/${owner}/${repo}`,
      has_discussions: false,
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
      hooks_url: `https://api.github.com/repos/${owner}/${repo}/hooks`,
      issue_comment_url: `https://api.github.com/repos/${owner}/${repo}/issues/comments{/number}`,
      issue_events_url: `https://api.github.com/repos/${owner}/${repo}/issues/events{/number}`,
      issues_url: `https://api.github.com/repos/${owner}/${repo}/issues{/number}`,
      keys_url: `https://api.github.com/repos/${owner}/${repo}/keys{/key_id}`,
      labels_url: `https://api.github.com/repos/${owner}/${repo}/labels{/name}`,
      languages_url: `https://api.github.com/repos/${owner}/${repo}/languages`,
      merges_url: `https://api.github.com/repos/${owner}/${repo}/merges`,
      milestones_url: `https://api.github.com/repos/${owner}/${repo}/milestones{/number}`,
      notifications_url: `https://api.github.com/repos/${owner}/${repo}/notifications{?since,all,participating}`,
      pulls_url: `https://api.github.com/repos/${owner}/${repo}/pulls{/number}`,
      releases_url: `https://api.github.com/repos/${owner}/${repo}/releases{/id}`,
      stargazers_url: `https://api.github.com/repos/${owner}/${repo}/stargazers`,
      statuses_url: `https://api.github.com/repos/${owner}/${repo}/statuses/{sha}`,
      subscribers_url: `https://api.github.com/repos/${owner}/${repo}/subscribers`,
      subscription_url: `https://api.github.com/repos/${owner}/${repo}/subscription`,
      tags_url: `https://api.github.com/repos/${owner}/${repo}/tags`,
      teams_url: `https://api.github.com/repos/${owner}/${repo}/teams`,
      trees_url: `https://api.github.com/repos/${owner}/${repo}/git/trees{/sha}`,
      owner: {
        ...baseRepo.owner,
        // Ensure url is always a string
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
        // ... other owner fields
        id: 1,
        node_id: 'MDQ6VXNlcjE=',
        gravatar_id: '',
        type: 'User',
        login: 'test-owner',
        avatar_url: 'https://example.com/avatar.png',
        site_admin: false
      },
      created_at: '2024-01-01T12:00:00Z',
      updated_at: '2024-01-01T13:00:00Z',
      pushed_at: '2024-01-01T14:00:00Z',
      // ... rest of fields, ensuring all required fields are present and of the correct type
      homepage: null,
      size: 1024,
      stargazers_count: 42,
      watchers_count: 42,
      language: 'TypeScript',
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      forks_count: 10,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 5,
      license: null,
      allow_forking: true,
      is_template: false,
      web_commit_signoff_required: false,
      topics: [],
      visibility: 'public',
      forks: 10,
      open_issues: 5,
      watchers: 42,
      default_branch: 'main',
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: true,
      allow_auto_merge: false,
      delete_branch_on_merge: false,
      master_branch: undefined, // or 'main' if applicable
      allow_update_branch: false,
      use_squash_pr_title_as_default: false,
      squash_merge_commit_message: 'COMMIT_MESSAGES',
      squash_merge_commit_title: 'COMMIT_OR_PR_TITLE',
      merge_commit_message: 'PR_TITLE',
      merge_commit_title: 'MERGE_MESSAGE',
      temp_clone_token: null,
      organization: undefined,
      network_count: 12,
      subscribers_count: 3,
      security_and_analysis: null,
      permissions: {
        admin: true,
        maintain: true,
        push: true,
        triage: true,
        pull: true
      }
    };
  };

export const createMockPullRequestResponse = (
    owner: string = TEST_OWNER,
    repo: string = TEST_REPO,
    pullNumber: number = 1
  ): PullsGetResponse['data'] => {

  const mockRepo = createMockRepositoryResponse(owner, repo);

  const basePullRequest = createMockPullRequest({
    number: pullNumber,
    head: {
      ref: 'feature',
      sha: 'head-sha-123',
      repo: createMockRepository({
        name: repo,
        fullName: `${owner}/${repo}`,
        owner: mockRepo.owner,
        description: 'Test repository',
        pushedAt: '2024-01-01T14:00:00Z',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T13:00:00Z'
      })
    },
    base: {
      ref: 'main',
      sha: 'base-sha-456',
      repo: createMockRepository({
        name: repo,
        fullName: `${owner}/${repo}`,
        owner: mockRepo.owner,
        description: 'Test repository',
        pushedAt: '2024-01-01T14:00:00Z',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T13:00:00Z'
      })
    },
    state: 'open' as 'open' | 'closed'
  });
  return {
    ...basePullRequest,
    state: 'open' as 'open' | 'closed',
    head: {
      label: `${owner}:feature`,
      ref: 'feature',
      sha: 'head-sha-123',
      user: mockRepo.owner,
      repo: {
        ...mockRepo,
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
        description: 'Test repository',
        downloads_url: `https://api.github.com/repos/${owner}/${repo}/downloads`,
        events_url: `https://api.github.com/repos/${owner}/${repo}/events`,
        fork: false,
        forks_url: `https://api.github.com/repos/${owner}/${repo}/forks`,
        full_name: `${owner}/${repo}`,
        git_commits_url: `https://api.github.com/repos/${owner}/${repo}/git/commits{/sha}`,
        git_refs_url: `https://api.github.com/repos/${owner}/${repo}/git/refs{/sha}`,
        git_tags_url: `https://api.github.com/repos/${owner}/${repo}/git/tags{/sha}`,
        hooks_url: `https://api.github.com/repos/${owner}/${repo}/hooks`,
        html_url: `https://github.com/${owner}/${repo}`,
        id: 123,
        issue_comment_url: `https://api.github.com/repos/${owner}/${repo}/issues/comments{/number}`,
        issue_events_url: `https://api.github.com/repos/${owner}/${repo}/issues/events{/number}`,
        issues_url: `https://api.github.com/repos/${owner}/${repo}/issues{/number}`,
        keys_url: `https://api.github.com/repos/${owner}/${repo}/keys{/key_id}`,
        labels_url: `https://api.github.com/repos/${owner}/${repo}/labels{/name}`,
        languages_url: `https://api.github.com/repos/${owner}/${repo}/languages`,
        merges_url: `https://api.github.com/repos/${owner}/${repo}/merges`,
        milestones_url: `https://api.github.com/repos/${owner}/${repo}/milestones{/number}`,
        name: repo,
        node_id: 'R_1',
        notifications_url: `https://api.github.com/repos/${owner}/${repo}/notifications{?since,all,participating}`,
        owner: mockRepo.owner,
        private: false,
        pulls_url: `https://api.github.com/repos/${owner}/${repo}/pulls{/number}`,
        releases_url: `https://api.github.com/repos/${owner}/${repo}/releases{/id}`,
        stargazers_url: `https://api.github.com/repos/${owner}/${repo}/stargazers`,
        statuses_url: `https://api.github.com/repos/${owner}/${repo}/statuses/{sha}`,
        subscribers_url: `https://api.github.com/repos/${owner}/${repo}/subscribers`,
        subscription_url: `https://api.github.com/repos/${owner}/${repo}/subscription`,
        tags_url: `https://api.github.com/repos/${owner}/${repo}/tags`,
        teams_url: `https://api.github.com/repos/${owner}/${repo}/teams`,
        trees_url: `https://api.github.com/repos/${owner}/${repo}/git/trees{/sha}`,
        url: `https://api.github.com/repos/${owner}/${repo}`,
        clone_url: `https://github.com/${owner}/${repo}.git`,
        has_downloads: true,
        temp_clone_token: undefined,
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false
      }
    },
    base: {
      label: `${owner}:main`,
      ref: 'main',
      sha: 'base-sha-456',
      user: mockRepo.owner,
      repo: {
        ...mockRepo,
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
        description: 'Test repository',
        downloads_url: `https://api.github.com/repos/${owner}/${repo}/downloads`,
        events_url: `https://api.github.com/repos/${owner}/${repo}/events`,
        fork: false,
        forks_url: `https://api.github.com/repos/${owner}/${repo}/forks`,
        full_name: `${owner}/${repo}`,
        git_commits_url: `https://api.github.com/repos/${owner}/${repo}/git/commits{/sha}`,
        git_refs_url: `https://api.github.com/repos/${owner}/${repo}/git/refs{/sha}`,
        git_tags_url: `https://api.github.com/repos/${owner}/${repo}/git/tags{/sha}`,
        hooks_url: `https://api.github.com/repos/${owner}/${repo}/hooks`,
        html_url: `https://github.com/${owner}/${repo}`,
        id: 123,
        issue_comment_url: `https://api.github.com/repos/${owner}/${repo}/issues/comments{/number}`,
        issue_events_url: `https://api.github.com/repos/${owner}/${repo}/issues/events{/number}`,
        issues_url: `https://api.github.com/repos/${owner}/${repo}/issues{/number}`,
        keys_url: `https://api.github.com/repos/${owner}/${repo}/keys{/key_id}`,
        labels_url: `https://api.github.com/repos/${owner}/${repo}/labels{/name}`,
        languages_url: `https://api.github.com/repos/${owner}/${repo}/languages`,
        merges_url: `https://api.github.com/repos/${owner}/${repo}/merges`,
        milestones_url: `https://api.github.com/repos/${owner}/${repo}/milestones{/number}`,
        name: repo,
        node_id: 'R_1',
        notifications_url: `https://api.github.com/repos/${owner}/${repo}/notifications{?since,all,participating}`,
        owner: mockRepo.owner,
        private: false,
        pulls_url: `https://api.github.com/repos/${owner}/${repo}/pulls{/number}`,
        releases_url: `https://api.github.com/repos/${owner}/${repo}/releases{/id}`,
        stargazers_url: `https://api.github.com/repos/${owner}/${repo}/stargazers`,
        statuses_url: `https://api.github.com/repos/${owner}/${repo}/statuses/{sha}`,
        subscribers_url: `https://api.github.com/repos/${owner}/${repo}/subscribers`,
        subscription_url: `https://api.github.com/repos/${owner}/${repo}/subscription`,
        tags_url: `https://api.github.com/repos/${owner}/${repo}/tags`,
        teams_url: `https://api.github.com/repos/${owner}/${repo}/teams`,
        trees_url: `https://api.github.com/repos/${owner}/${repo}/git/trees{/sha}`,
        url: `https://api.github.com/repos/${owner}/${repo}`,
        clone_url: `https://github.com/${owner}/${repo}.git`,
        temp_clone_token: undefined,
        has_downloads: true,
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false
      }
    },
    node_id: 'MDExOlB1bGxSZXF1ZXN0MTIzNDU2',
    labels: [
      { id: 1, node_id: 'l1', url: 'https://example.com/label1', name: 'label1', color: 'c1', default: false, description: 'desc1' },
      { id: 2, node_id: 'l2', url: 'https://example.com/label2', name: 'label2', color: 'c2', default: true, description: 'desc2' }
    ],
    milestone: null,
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T13:00:00Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: 'abcdef1234567890',
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
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
    additions: 100,
    deletions: 50,
    changed_files: 2,
    author_association: 'OWNER',
    auto_merge: null,
    active_lock_reason: null,
    url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
    html_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
    diff_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}.diff`,
    patch_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}.patch`,
    issue_url: `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}`,
    commits_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/commits`,
    review_comments_url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
    review_comment_url: `https://api.github.com/repos/${owner}/${repo}/pulls/comments{/number}`,
    comments_url: `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
    statuses_url: `https://api.github.com/repos/${owner}/${repo}/statuses/{sha}`,
    _links: {
      self: { href: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}` },
      html: { href: `https://github.com/${owner}/${repo}/pull/${pullNumber}` },
      issue: { href: `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}` },
      comments: { href: `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments` },
      review_comments: { href: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments` },
      review_comment: { href: `https://api.github.com/repos/${owner}/${repo}/pulls/comments{/number}` },
      commits: { href: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/commits` },
      statuses: { href: `https://api.github.com/repos/${owner}/${repo}/statuses/{sha}` }
    },
    user: mockRepo.owner
  };
};


export const createMockPullRequestReviewResponse = (
  user: string,
  state: 'APPROVED' | 'COMMENTED' | 'CHANGES_REQUESTED' | 'DISMISSED',
  submitted_at: string
): PullsListReviewsResponse => ({
  id: 1,
  node_id: '1',
  user: {
    login: user,
    id: 1,
    node_id: 'U_1',
    avatar_url: 'https://github.com/testuser.png',
    gravatar_id: null,
    url: 'https://api.github.com/users/testuser',
    html_url: 'https://github.com/testuser',
    followers_url: 'https://api.github.com/users/testuser/followers',
    following_url: 'https://api.github.com/users/testuser/following{/other_user}',
    gists_url: 'https://api.github.com/users/testuser/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/testuser/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/testuser/subscriptions',
    organizations_url: 'https://api.github.com/users/testuser/orgs',
    repos_url: 'https://api.github.com/users/testuser/repos',
    events_url: 'https://api.github.com/users/testuser/events{/privacy}',
    received_events_url: 'https://api.github.com/users/testuser/received_events',
    type: 'User',
    site_admin: false,
    name: 'Test User',
    email: 'test@user.com',
    starred_at: undefined
  },
  body: 'Test Review Body',
  state,
  html_url: 'https://github.com/testuser/test-repo/pull/1#pullrequestreview-1',
  pull_request_url: 'https://api.github.com/repos/testuser/test-repo/pulls/1',
  author_association: 'COLLABORATOR',
  submitted_at,
  commit_id: 'test-commit-id',
  _links: {
    html: {
      href: 'https://github.com/testuser/test-repo/pull/1#pullrequestreview-1'
    },
    pull_request: {
      href: 'https://api.github.com/repos/testuser/test-repo/pulls/1'
    }
  }
});

export const createMockErrorResponse = (status: number, message: string) => ({
  response: { status, data: { message } }
});
