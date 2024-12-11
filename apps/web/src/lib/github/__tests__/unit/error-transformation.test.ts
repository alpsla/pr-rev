import { GitHubService } from '../../api';
import { createMockContext } from '../utils/mock-factory';
import { expectGitHubError } from '../utils/test-helpers';
import { TEST_OWNER, TEST_REPO, TEST_PR_NUMBER } from '../utils/test-data';
import { GitHubError, ServerError } from '../../errors';

const createMockRepositoryResponse = (owner: string, repo: string) => ({
  id: 123,
  node_id: 'R_123',
  name: repo,
  full_name: `${owner}/${repo}`,
  owner: {
    login: owner,
    id: 1,
    node_id: 'U_1',
    avatar_url: `https://github.com/${owner}.png`,
    gravatar_id: null,
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
    site_admin: false,
    name: null,
    email: null,
    starred_at: undefined
  },
  private: false,
  html_url: `https://github.com/${owner}/${repo}`,
  description: null,
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
  temp_clone_token: null,
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
  security_and_analysis: null
});

describe('GitHubService - Error Transformation', () => {
  const ctx = createMockContext();
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API Error Transformation', () => {
    it('should transform 404 errors into GitHubError with correct status', async () => {
      // Mock a 404 response
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      });

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        404,
        'Not Found'
      );
    });

    it('should transform 401 errors into GitHubError with authentication message', async () => {
      // Mock a 401 response
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Bad credentials' }
        }
      });

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        401,
        'Bad credentials'
      );
    });

    it('should transform 403 rate limit errors into GitHubError', async () => {
      // Mock a 403 rate limit response
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { message: 'API rate limit exceeded' }
        }
      });

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        403,
        'API rate limit exceeded'
      );
    });

    it('should transform 500+ errors into ServerError', async () => {
      // Mock a 500 response
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof ServerError) {
          expect(error.message).toBe('Internal Server Error');
        } else {
          fail('Expected ServerError to be thrown');
        }
      }
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors without response object', async () => {
      // Mock a network error
      ctx.octokit.rest.repos.get.mockRejectedValueOnce(
        new Error('Network Error')
      );

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Network Error'
      );
    });

    it('should handle timeout errors', async () => {
      // Mock a timeout error
      ctx.octokit.rest.repos.get.mockRejectedValueOnce(
        new Error('Request timeout')
      );

      await expectGitHubError(
        service.getRepository(TEST_OWNER, TEST_REPO),
        500,
        'Request timeout'
      );
    });
  });

  describe('Error Context Preservation', () => {
    it('should preserve error context in repository operations', async () => {
      // Mock an error with additional context
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 422,
          data: {
            message: 'Validation Failed',
            errors: [
              { resource: 'Repository', code: 'custom_field_key' }
            ]
          }
        }
      });

      try {
        await service.getRepository(TEST_OWNER, TEST_REPO);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.status).toBe(422);
          expect(error.message).toBe('Validation Failed');
          expect(error.data).toBeDefined();
          if (error.data && typeof error.data === 'object' && 'errors' in error.data) {
            expect(Array.isArray(error.data.errors)).toBe(true);
          } else {
            fail('Expected error.data.errors to be an array');
          }
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
    });

    it('should preserve error context in pull request operations', async () => {
      // Mock an error with additional context
      ctx.octokit.rest.pulls.get.mockRejectedValueOnce({
        response: {
          status: 422,
          data: {
            message: 'Validation Failed',
            errors: [
              { resource: 'PullRequest', code: 'missing_field' }
            ]
          }
        }
      });

      try {
        await service.getPullRequest(TEST_OWNER, TEST_REPO, TEST_PR_NUMBER);
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof GitHubError) {
          expect(error.status).toBe(422);
          expect(error.message).toBe('Validation Failed');
          expect(error.data).toBeDefined();
          if (error.data && typeof error.data === 'object' && 'errors' in error.data) {
            expect(Array.isArray(error.data.errors)).toBe(true);
          } else {
            fail('Expected error.data.errors to be an array');
          }
        } else {
          fail('Expected GitHubError to be thrown');
        }
      }
    });
  });

  describe('Error Recovery', () => {
    it('should allow operations after error recovery', async () => {
      // First request fails
      ctx.octokit.rest.repos.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      // Error should be thrown
      await expect(
        service.getRepository(TEST_OWNER, TEST_REPO)
      ).rejects.toThrow('Internal Server Error');

      // Mock successful response for second attempt
      ctx.octokit.rest.repos.get.mockResolvedValueOnce({
        data: createMockRepositoryResponse(TEST_OWNER, TEST_REPO),
        status: 200,
        url: `https://api.github.com/repos/${TEST_OWNER}/${TEST_REPO}`,
        headers: {}
      });

      // Second request should succeed
      const result = await service.getRepository(TEST_OWNER, TEST_REPO);
      expect(result).toBeDefined();
      expect(result.name).toBe(TEST_REPO);
    });
  });
});
