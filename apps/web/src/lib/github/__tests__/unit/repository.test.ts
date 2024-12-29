import { GitHubRepositoryService } from '../../services/repository';
import { createMockOctokit } from '../mocks/github';
import type { RestEndpointMethodTypes } from '@octokit/rest';

type RepoResponse = RestEndpointMethodTypes['repos']['get']['response'];
type ListOrgReposResponse = RestEndpointMethodTypes['repos']['listForOrg']['response'];
type ListUserReposResponse = RestEndpointMethodTypes['repos']['listForUser']['response'];
type BaseOctokitRepository = RestEndpointMethodTypes['repos']['get']['response']['data'];

// Extend the base type to make temp_clone_token optional
interface OctokitRepository extends Omit<BaseOctokitRepository, 'temp_clone_token'> {
  temp_clone_token?: string;
}

// Mock Octokit
const mockOctokit = createMockOctokit();
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(() => mockOctokit)
}));

describe('GitHubRepositoryService', () => {
  let service: GitHubRepositoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GitHubRepositoryService('test-token');
  });

  describe('getRepository', () => {
    it('should fetch and transform repository data', async () => {
      const mockRepo: OctokitRepository = {
        id: 123,
        node_id: 'node123',
        name: 'test-repo',
        full_name: 'owner/test-repo',
        private: false,
        owner: {
          login: 'owner',
          id: 456,
          node_id: 'node456',
          avatar_url: 'https://github.com/avatar.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/owner',
          html_url: 'https://github.com/owner',
          followers_url: 'https://api.github.com/users/owner/followers',
          following_url: 'https://api.github.com/users/owner/following{/other_user}',
          gists_url: 'https://api.github.com/users/owner/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/owner/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/owner/subscriptions',
          organizations_url: 'https://api.github.com/users/owner/orgs',
          repos_url: 'https://api.github.com/users/owner/repos',
          events_url: 'https://api.github.com/users/owner/events{/privacy}',
          received_events_url: 'https://api.github.com/users/owner/received_events',
          type: 'User',
          site_admin: false,
          name: null,
          email: null,
          starred_at: undefined
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
        issue_comment_url: 'https://api.github.com/repos/owner/test-repo/issues/comments{/number}',
        issue_events_url: 'https://api.github.com/repos/owner/test-repo/issues/events{/number}',
        issues_url: 'https://api.github.com/repos/owner/test-repo/issues{/number}',
        keys_url: 'https://api.github.com/repos/owner/test-repo/keys{/key_id}',
        labels_url: 'https://api.github.com/repos/owner/test-repo/labels{/name}',
        languages_url: 'https://api.github.com/repos/owner/test-repo/languages',
        merges_url: 'https://api.github.com/repos/owner/test-repo/merges',
        milestones_url: 'https://api.github.com/repos/owner/test-repo/milestones{/number}',
        notifications_url: 'https://api.github.com/repos/owner/test-repo/notifications{?since,all,participating}',
        pulls_url: 'https://api.github.com/repos/owner/test-repo/pulls{/number}',
        releases_url: 'https://api.github.com/repos/owner/test-repo/releases{/id}',
        ssh_url: 'git@github.com:owner/test-repo.git',
        stargazers_url: 'https://api.github.com/repos/owner/test-repo/stargazers',
        statuses_url: 'https://api.github.com/repos/owner/test-repo/statuses/{sha}',
        subscribers_url: 'https://api.github.com/repos/owner/test-repo/subscribers',
        subscription_url: 'https://api.github.com/repos/owner/test-repo/subscription',
        tags_url: 'https://api.github.com/repos/owner/test-repo/tags',
        teams_url: 'https://api.github.com/repos/owner/test-repo/teams',
        trees_url: 'https://api.github.com/repos/owner/test-repo/git/trees{/sha}',
        hooks_url: 'https://api.github.com/repos/owner/test-repo/hooks',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        pushed_at: '2023-01-01T00:00:00Z',
        clone_url: 'https://github.com/owner/test-repo.git',
        svn_url: 'https://github.com/owner/test-repo',
        homepage: null,
        size: 100,
        stargazers_count: 10,
        watchers_count: 10,
        language: 'TypeScript',
        forks_count: 5,
        archived: false,
        disabled: false,
        open_issues_count: 2,
        license: {
          key: 'mit',
          name: 'MIT License',
          url: 'https://api.github.com/licenses/mit',
          spdx_id: 'MIT',
          node_id: 'MDc6TGljZW5zZW1pdA==',
          html_url: 'https://github.com/licenses/mit'
        },
        allow_forking: true,
        is_template: false,
        topics: ['typescript', 'testing'],
        visibility: 'public',
        forks: 5,
        open_issues: 2,
        watchers: 10,
        default_branch: 'main',
        network_count: 0,
        subscribers_count: 0,
        mirror_url: null,
        has_issues: true,
        has_projects: true,
        has_pages: false,
        has_wiki: true,
        has_downloads: true,
        has_discussions: false,
        allow_update_branch: false,
        web_commit_signoff_required: false,
        security_and_analysis: null,
        permissions: {
          admin: false,
          maintain: false,
          push: false,
          triage: false,
          pull: true
        }
      };

      const mockResponse: RepoResponse = {
        data: mockRepo as BaseOctokitRepository,
        status: 200,
        url: 'https://api.github.com/repos/owner/test-repo',
        headers: {
          'content-type': 'application/json'
        }
      };

      mockOctokit.repos.get.mockResolvedValueOnce(mockResponse);

      const repository = await service.getRepository('owner', 'test-repo');

      expect(repository).toEqual({
        id: 123,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        private: false,
        owner: {
          login: 'owner',
          id: 456,
          avatarUrl: 'https://github.com/avatar.png',
          type: 'User'
        },
        description: 'Test repository',
        fork: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        pushedAt: '2023-01-01T00:00:00Z',
        homepage: null,
        size: 100,
        stargazersCount: 10,
        watchersCount: 10,
        language: 'TypeScript',
        forksCount: 5,
        archived: false,
        disabled: false,
        openIssuesCount: 2,
        license: {
          key: 'mit',
          name: 'MIT License',
          url: 'https://api.github.com/licenses/mit'
        },
        allowForking: true,
        isTemplate: false,
        topics: ['typescript', 'testing'],
        visibility: 'public',
        defaultBranch: 'main'
      });

      expect(mockOctokit.repos.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'test-repo'
      });
    });

    it('should handle API errors', async () => {
      mockOctokit.repos.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getRepository('owner', 'test-repo'))
        .rejects
        .toThrow('Failed to get repository');
    });
  });

  describe('listRepositories', () => {
    it('should list repositories for an organization', async () => {
      const mockRepo: OctokitRepository = {
        id: 123,
        node_id: 'node123',
        name: 'repo1',
        full_name: 'owner/repo1',
        private: false,
        owner: {
          login: 'owner',
          id: 456,
          node_id: 'node456',
          avatar_url: 'https://github.com/avatar.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/owner',
          html_url: 'https://github.com/owner',
          followers_url: 'https://api.github.com/users/owner/followers',
          following_url: 'https://api.github.com/users/owner/following{/other_user}',
          gists_url: 'https://api.github.com/users/owner/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/owner/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/owner/subscriptions',
          organizations_url: 'https://api.github.com/users/owner/orgs',
          repos_url: 'https://api.github.com/users/owner/repos',
          events_url: 'https://api.github.com/users/owner/events{/privacy}',
          received_events_url: 'https://api.github.com/users/owner/received_events',
          type: 'User',
          site_admin: false,
          name: null,
          email: null,
          starred_at: undefined
        },
        html_url: 'https://github.com/owner/repo1',
        description: 'Repository 1',
        fork: false,
        url: 'https://api.github.com/repos/owner/repo1',
        archive_url: 'https://api.github.com/repos/owner/repo1/{archive_format}{/ref}',
        assignees_url: 'https://api.github.com/repos/owner/repo1/assignees{/user}',
        blobs_url: 'https://api.github.com/repos/owner/repo1/git/blobs{/sha}',
        branches_url: 'https://api.github.com/repos/owner/repo1/branches{/branch}',
        collaborators_url: 'https://api.github.com/repos/owner/repo1/collaborators{/collaborator}',
        comments_url: 'https://api.github.com/repos/owner/repo1/comments{/number}',
        commits_url: 'https://api.github.com/repos/owner/repo1/commits{/sha}',
        compare_url: 'https://api.github.com/repos/owner/repo1/compare/{base}...{head}',
        contents_url: 'https://api.github.com/repos/owner/repo1/contents/{+path}',
        contributors_url: 'https://api.github.com/repos/owner/repo1/contributors',
        deployments_url: 'https://api.github.com/repos/owner/repo1/deployments',
        downloads_url: 'https://api.github.com/repos/owner/repo1/downloads',
        events_url: 'https://api.github.com/repos/owner/repo1/events',
        forks_url: 'https://api.github.com/repos/owner/repo1/forks',
        git_commits_url: 'https://api.github.com/repos/owner/repo1/git/commits{/sha}',
        git_refs_url: 'https://api.github.com/repos/owner/repo1/git/refs{/sha}',
        git_tags_url: 'https://api.github.com/repos/owner/repo1/git/tags{/sha}',
        git_url: 'git://github.com/owner/repo1.git',
        issue_comment_url: 'https://api.github.com/repos/owner/repo1/issues/comments{/number}',
        issue_events_url: 'https://api.github.com/repos/owner/repo1/issues/events{/number}',
        issues_url: 'https://api.github.com/repos/owner/repo1/issues{/number}',
        keys_url: 'https://api.github.com/repos/owner/repo1/keys{/key_id}',
        labels_url: 'https://api.github.com/repos/owner/repo1/labels{/name}',
        languages_url: 'https://api.github.com/repos/owner/repo1/languages',
        merges_url: 'https://api.github.com/repos/owner/repo1/merges',
        milestones_url: 'https://api.github.com/repos/owner/repo1/milestones{/number}',
        notifications_url: 'https://api.github.com/repos/owner/repo1/notifications{?since,all,participating}',
        pulls_url: 'https://api.github.com/repos/owner/repo1/pulls{/number}',
        releases_url: 'https://api.github.com/repos/owner/repo1/releases{/id}',
        ssh_url: 'git@github.com:owner/repo1.git',
        stargazers_url: 'https://api.github.com/repos/owner/repo1/stargazers',
        statuses_url: 'https://api.github.com/repos/owner/repo1/statuses/{sha}',
        subscribers_url: 'https://api.github.com/repos/owner/repo1/subscribers',
        subscription_url: 'https://api.github.com/repos/owner/repo1/subscription',
        tags_url: 'https://api.github.com/repos/owner/repo1/tags',
        teams_url: 'https://api.github.com/repos/owner/repo1/teams',
        trees_url: 'https://api.github.com/repos/owner/repo1/git/trees{/sha}',
        hooks_url: 'https://api.github.com/repos/owner/repo1/hooks',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        pushed_at: '2023-01-01T00:00:00Z',
        clone_url: 'https://github.com/owner/repo1.git',
        svn_url: 'https://github.com/owner/repo1',
        homepage: null,
        size: 100,
        stargazers_count: 10,
        watchers_count: 10,
        language: 'TypeScript',
        forks_count: 5,
        archived: false,
        disabled: false,
        open_issues_count: 2,
        license: null,
        allow_forking: true,
        is_template: false,
        topics: [],
        visibility: 'public',
        forks: 5,
        open_issues: 2,
        watchers: 10,
        default_branch: 'main',
        network_count: 0,
        subscribers_count: 0,
        mirror_url: null,
        has_issues: true,
        has_projects: true,
        has_pages: false,
        has_wiki: true,
        has_downloads: true,
        has_discussions: false,
        allow_update_branch: false,
        web_commit_signoff_required: false,
        security_and_analysis: null,
        permissions: {
          admin: false,
          maintain: false,
          push: false,
          triage: false,
          pull: true
        }
      };

      const mockResponse: ListOrgReposResponse = {
        data: [mockRepo as BaseOctokitRepository],
        status: 200,
        url: 'https://api.github.com/orgs/owner/repos',
        headers: {
          'content-type': 'application/json'
        }
      };

      mockOctokit.repos.listForOrg.mockResolvedValueOnce(mockResponse);

      const repositories = await service.listRepositories('owner', 'Organization');

      expect(repositories).toHaveLength(1);
      expect(repositories[0]).toEqual({
        id: 123,
        name: 'repo1',
        fullName: 'owner/repo1',
        private: false,
        owner: {
          login: 'owner',
          id: 456,
          avatarUrl: 'https://github.com/avatar.png',
          type: 'User'
        },
        description: 'Repository 1',
        fork: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        pushedAt: '2023-01-01T00:00:00Z',
        homepage: null,
        size: 100,
        stargazersCount: 10,
        watchersCount: 10,
        language: 'TypeScript',
        forksCount: 5,
        archived: false,
        disabled: false,
        openIssuesCount: 2,
        license: undefined,
        allowForking: true,
        isTemplate: false,
        topics: [],
        visibility: 'public',
        defaultBranch: 'main'
      });

      expect(mockOctokit.repos.listForOrg).toHaveBeenCalledWith({
        org: 'owner',
        per_page: 100
      });
    });

    it('should list repositories for a user', async () => {
      const mockRepo: OctokitRepository = {
        id: 123,
        node_id: 'node123',
        name: 'repo1',
        full_name: 'owner/repo1',
        private: false,
        owner: {
          login: 'owner',
          id: 456,
          node_id: 'node456',
          avatar_url: 'https://github.com/avatar.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/owner',
          html_url: 'https://github.com/owner',
          followers_url: 'https://api.github.com/users/owner/followers',
          following_url: 'https://api.github.com/users/owner/following{/other_user}',
          gists_url: 'https://api.github.com/users/owner/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/owner/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/owner/subscriptions',
          organizations_url: 'https://api.github.com/users/owner/orgs',
          repos_url: 'https://api.github.com/users/owner/repos',
          events_url: 'https://api.github.com/users/owner/events{/privacy}',
          received_events_url: 'https://api.github.com/users/owner/received_events',
          type: 'User',
          site_admin: false,
          name: null,
          email: null,
          starred_at: undefined
        },
        html_url: 'https://github.com/owner/repo1',
        description: 'Repository 1',
        fork: false,
        url: 'https://api.github.com/repos/owner/repo1',
        archive_url: 'https://api.github.com/repos/owner/repo1/{archive_format}{/ref}',
        assignees_url: 'https://api.github.com/repos/owner/repo1/assignees{/user}',
        blobs_url: 'https://api.github.com/repos/owner/repo1/git/blobs{/sha}',
        branches_url: 'https://api.github.com/repos/owner/repo1/branches{/branch}',
        collaborators_url: 'https://api.github.com/repos/owner/repo1/collaborators{/collaborator}',
        comments_url: 'https://api.github.com/repos/owner/repo1/comments{/number}',
        commits_url: 'https://api.github.com/repos/owner/repo1/commits{/sha}',
        compare_url: 'https://api.github.com/repos/owner/repo1/compare/{base}...{head}',
        contents_url: 'https://api.github.com/repos/owner/repo1/contents/{+path}',
        contributors_url: 'https://api.github.com/repos/owner/repo1/contributors',
        deployments_url: 'https://api.github.com/repos/owner/repo1/deployments',
        downloads_url: 'https://api.github.com/repos/owner/repo1/downloads',
        events_url: 'https://api.github.com/repos/owner/repo1/events',
        forks_url: 'https://api.github.com/repos/owner/repo1/forks',
        git_commits_url: 'https://api.github.com/repos/owner/repo1/git/commits{/sha}',
        git_refs_url: 'https://api.github.com/repos/owner/repo1/git/refs{/sha}',
        git_tags_url: 'https://api.github.com/repos/owner/repo1/git/tags{/sha}',
        git_url: 'git://github.com/owner/repo1.git',
        issue_comment_url: 'https://api.github.com/repos/owner/repo1/issues/comments{/number}',
        issue_events_url: 'https://api.github.com/repos/owner/repo1/issues/events{/number}',
        issues_url: 'https://api.github.com/repos/owner/repo1/issues{/number}',
        keys_url: 'https://api.github.com/repos/owner/repo1/keys{/key_id}',
        labels_url: 'https://api.github.com/repos/owner/repo1/labels{/name}',
        languages_url: 'https://api.github.com/repos/owner/repo1/languages',
        merges_url: 'https://api.github.com/repos/owner/repo1/merges',
        milestones_url: 'https://api.github.com/repos/owner/repo1/milestones{/number}',
        notifications_url: 'https://api.github.com/repos/owner/repo1/notifications{?since,all,participating}',
        pulls_url: 'https://api.github.com/repos/owner/repo1/pulls{/number}',
        releases_url: 'https://api.github.com/repos/owner/repo1/releases{/id}',
        ssh_url: 'git@github.com:owner/repo1.git',
        stargazers_url: 'https://api.github.com/repos/owner/repo1/stargazers',
        statuses_url: 'https://api.github.com/repos/owner/repo1/statuses/{sha}',
        subscribers_url: 'https://api.github.com/repos/owner/repo1/subscribers',
        subscription_url: 'https://api.github.com/repos/owner/repo1/subscription',
        tags_url: 'https://api.github.com/repos/owner/repo1/tags',
        teams_url: 'https://api.github.com/repos/owner/repo1/teams',
        trees_url: 'https://api.github.com/repos/owner/repo1/git/trees{/sha}',
        hooks_url: 'https://api.github.com/repos/owner/repo1/hooks',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        pushed_at: '2023-01-01T00:00:00Z',
        clone_url: 'https://github.com/owner/repo1.git',
        svn_url: 'https://github.com/owner/repo1',
        homepage: null,
        size: 100,
        stargazers_count: 10,
        watchers_count: 10,
        language: 'TypeScript',
        forks_count: 5,
        archived: false,
        disabled: false,
        open_issues_count: 2,
        license: null,
        allow_forking: true,
        is_template: false,
        topics: [],
        visibility: 'public',
        forks: 5,
        open_issues: 2,
        watchers: 10,
        default_branch: 'main',
        network_count: 0,
        subscribers_count: 0,
        mirror_url: null,
        has_issues: true,
        has_projects: true,
        has_pages: false,
        has_wiki: true,
        has_downloads: true,
        has_discussions: false,
        allow_update_branch: false,
        web_commit_signoff_required: false,
        security_and_analysis: null,
        permissions: {
          admin: false,
          maintain: false,
          push: false,
          triage: false,
          pull: true
        }
      };

      const mockResponse: ListUserReposResponse = {
        data: [mockRepo as BaseOctokitRepository],
        status: 200,
        url: 'https://api.github.com/users/owner/repos',
        headers: {
          'content-type': 'application/json'
        }
      };

      mockOctokit.repos.listForUser.mockResolvedValueOnce(mockResponse);

      const repositories = await service.listRepositories('owner', 'User');

      expect(repositories).toHaveLength(1);
      expect(mockOctokit.repos.listForUser).toHaveBeenCalledWith({
        username: 'owner',
        per_page: 100
      });
    });

    it('should handle API errors for organization repositories', async () => {
      mockOctokit.repos.listForOrg.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.listRepositories('owner', 'Organization'))
        .rejects
        .toThrow('Failed to list repositories');
    });

    it('should handle API errors for user repositories', async () => {
      mockOctokit.repos.listForUser.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.listRepositories('owner', 'User'))
        .rejects
        .toThrow('Failed to list repositories');
    });
  });
});
