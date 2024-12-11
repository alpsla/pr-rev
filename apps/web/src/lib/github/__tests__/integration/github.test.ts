import { describe, expect, beforeEach, test } from '@jest/globals';
import { GitHubService } from '../../api';
import { createMockContext } from '../utils/mock-factory';
import { mockRateLimitResponse } from '../mocks/responses';

describe('GitHub Service Integration Tests', () => {
  let service: InstanceType<typeof GitHubService>;
  let ctx = createMockContext();
  
  beforeEach(() => {
    ctx = createMockContext();
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );

    // Set up default rate limit response
    ctx.octokit.rest.rateLimit.get.mockResolvedValue(mockRateLimitResponse);
  });

  describe('Repository Integration', () => {
    test('should fetch and transform repository data', async () => {
      const baseUrl = 'https://api.github.com/repos/test-owner/test-repo';
      const mockRepo = {
        data: {
          id: 123456,
          node_id: 'R_123456',
          name: 'test-repo',
          full_name: 'test-owner/test-repo',
          private: false,
          owner: {
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
            name: null,
            email: null,
            starred_at: undefined
          },
          description: 'Test repository',
          fork: false,
          url: baseUrl,
          html_url: 'https://github.com/test-owner/test-repo',
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
          git_url: `git://github.com/test-owner/test-repo.git`,
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
          ssh_url: 'git@github.com:test-owner/test-repo.git',
          stargazers_url: `${baseUrl}/stargazers`,
          statuses_url: `${baseUrl}/statuses/{sha}`,
          subscribers_url: `${baseUrl}/subscribers`,
          subscription_url: `${baseUrl}/subscription`,
          tags_url: `${baseUrl}/tags`,
          teams_url: `${baseUrl}/teams`,
          trees_url: `${baseUrl}/git/trees{/sha}`,
          hooks_url: `${baseUrl}/hooks`,
          clone_url: 'https://github.com/test-owner/test-repo.git',
          svn_url: 'https://github.com/test-owner/test-repo',
          default_branch: 'main',
          language: 'TypeScript',
          stargazers_count: 0,
          watchers_count: 0,
          subscribers_count: 0,
          network_count: 0,
          forks_count: 0,
          allow_auto_merge: false,
          allow_merge_commit: true,
          allow_squash_merge: true,
          allow_rebase_merge: true,
          archived: false,
          disabled: false,
          open_issues_count: 0,
          license: null,
          forks: 0,
          open_issues: 0,
          watchers: 0,
          topics: [],
          mirror_url: null,
          has_issues: true,
          has_projects: true,
          has_pages: false,
          has_wiki: true,
          has_downloads: true,
          has_discussions: false,
          visibility: 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
          size: 0,
          homepage: null,
          permissions: {
            admin: true,
            maintain: true,
            push: true,
            triage: true,
            pull: true
          }
        },
        status: 200 as const,
        headers: {},
        url: baseUrl
      };

      ctx.octokit.rest.repos.get.mockResolvedValue(mockRepo);

      const repo = await service.getRepository('test-owner', 'test-repo');

      // Verify the repository data is transformed correctly
      expect(repo).toMatchObject({
        id: 123456,
        name: 'test-repo',
        fullName: 'test-owner/test-repo',
        private: false,
        description: 'Test repository',
        defaultBranch: 'main',
        language: 'TypeScript',
        stargazersCount: 0,
        forksCount: 0,
        settings: {
          id: '123456-settings',
          repositoryId: '123456',
          autoMergeEnabled: false,
          requireApprovals: 1,
          protectedBranches: ['main'],
          allowedMergeTypes: ['merge', 'squash', 'rebase']
        }
      });

      // Verify the mock was called with correct parameters
      expect(ctx.octokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo'
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle rate limit errors', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'API rate limit exceeded' }
        }
      };

      ctx.octokit.rest.repos.get.mockRejectedValue(error);

      let thrown = false;
      try {
        await service.getRepository('test-owner', 'test-repo');
      } catch (error) {
        thrown = true;
        expect(error).toMatchObject({
          status: 403,
          message: 'API rate limit exceeded'
        });
      }
      expect(thrown).toBeTruthy();
    });

    test('should handle network errors', async () => {
      const error = new Error('Network error');
      ctx.octokit.rest.repos.get.mockRejectedValue(error);

      let thrown = false;
      try {
        await service.getRepository('test-owner', 'test-repo');
      } catch (error) {
        thrown = true;
        expect(error).toMatchObject({
          message: 'Network error'
        });
      }
      expect(thrown).toBeTruthy();
    });
  });
});
