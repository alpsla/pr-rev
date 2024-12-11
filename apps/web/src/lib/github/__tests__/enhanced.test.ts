import { GitHubService } from '../api';
import { mockPrismaClient } from './mocks/prisma';
import { Octokit } from '@octokit/rest';
import { mockRequest, mockRepository, mockPullRequest, mockErrors } from './mocks/request';
import type { GitHubError, PrismaClient } from '../types';
import type { RestEndpointMethodTypes } from '@octokit/rest';

type RateLimitGetResponse = RestEndpointMethodTypes['rateLimit']['get']['response'];
type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];

const mockRateLimitResponse: RateLimitGetResponse = {
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
  },
  status: 200,
  url: 'https://api.github.com/rate_limit',
  headers: {
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
  }
};

const mockGithubRepoResponse: ReposGetResponse = {
  data: {
    id: 1,
    node_id: 'R_1',
    name: 'test-repo',
    full_name: 'test-owner/test-repo',
    private: false,
    owner: {
      login: 'test-owner',
      id: 1,
      node_id: 'U_1',
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
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
    hooks_url: 'https://api.github.com/repos/test-owner/test-repo/hooks',
    issue_comment_url: 'https://api.github.com/repos/test-owner/test-repo/issues/comments{/number}',
    issue_events_url: 'https://api.github.com/repos/test-owner/test-repo/issues/events{/number}',
    issues_url: 'https://api.github.com/repos/test-owner/test-repo/issues{/number}',
    keys_url: 'https://api.github.com/repos/test-owner/test-repo/keys{/key_id}',
    labels_url: 'https://api.github.com/repos/test-owner/test-repo/labels{/name}',
    languages_url: 'https://api.github.com/repos/test-owner/test-repo/languages',
    merges_url: 'https://api.github.com/repos/test-owner/test-repo/merges',
    milestones_url: 'https://api.github.com/repos/test-owner/test-repo/milestones{/number}',
    mirror_url: null,
    notifications_url: 'https://api.github.com/repos/test-owner/test-repo/notifications{?since,all,participating}',
    pulls_url: 'https://api.github.com/repos/test-owner/test-repo/pulls{/number}',
    releases_url: 'https://api.github.com/repos/test-owner/test-repo/releases{/id}',
    ssh_url: 'git@github.com:test-owner/test-repo.git',
    stargazers_url: 'https://api.github.com/repos/test-owner/test-repo/stargazers',
    statuses_url: 'https://api.github.com/repos/test-owner/test-repo/statuses/{sha}',
    subscribers_url: 'https://api.github.com/repos/test-owner/test-repo/subscribers',
    subscription_url: 'https://api.github.com/repos/test-owner/test-repo/subscription',
    svn_url: 'https://github.com/test-owner/test-repo',
    tags_url: 'https://api.github.com/repos/test-owner/test-repo/tags',
    teams_url: 'https://api.github.com/repos/test-owner/test-repo/teams',
    trees_url: 'https://api.github.com/repos/test-owner/test-repo/git/trees{/sha}',
    clone_url: 'https://github.com/test-owner/test-repo.git',
    homepage: null,
    size: 0,
    stargazers_count: 0,
    watchers_count: 0,
    language: 'TypeScript',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    has_discussions: false,
    forks_count: 0,
    archived: false,
    disabled: false,
    open_issues_count: 0,
    license: null,
    allow_forking: true,
    is_template: false,
    web_commit_signoff_required: false,
    topics: [],
    visibility: 'public',
    forks: 0,
    open_issues: 0,
    watchers: 0,
    default_branch: 'main',
    temp_clone_token: null,
    network_count: 0,
    subscribers_count: 0,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    pushed_at: '2023-01-01T00:00:00Z',
    permissions: {
      admin: true,
      maintain: true,
      push: true,
      triage: true,
      pull: true
    },
    allow_rebase_merge: true,
    allow_squash_merge: true,
    allow_merge_commit: true,
    delete_branch_on_merge: false,
    allow_update_branch: false,
    use_squash_pr_title_as_default: false,
    squash_merge_commit_message: 'COMMIT_MESSAGES',
    squash_merge_commit_title: 'COMMIT_OR_PR_TITLE',
    merge_commit_message: 'PR_TITLE',
    merge_commit_title: 'MERGE_MESSAGE',
    security_and_analysis: null,
    custom_properties: {}
  },
  status: 200,
  url: 'https://api.github.com/repos/test-owner/test-repo',
  headers: {
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
  }
};

const createMockOctokit = () => ({
  request: mockRequest.intercept,
  rateLimit: {
    get: jest.fn().mockResolvedValue(mockRateLimitResponse)
  },
  repos: {
    get: jest.fn().mockImplementation((params) => {
      if (params.repo === 'non-existent-repo') {
        return Promise.reject(mockErrors.notFound);
      }
      return Promise.resolve(mockGithubRepoResponse);
    })
  },
  pulls: {
    get: jest.fn().mockImplementation((params) => {
      if (params.pull_number === 999) {
        return Promise.reject(mockErrors.notFound);
      }
      return Promise.resolve({
        data: mockPullRequest,
        status: 200,
        url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}`,
        headers: {
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600)
        }
      });
    })
  }
});

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => createMockOctokit())
}));

describe('Enhanced GitHub Service Tests', () => {
  let service: GitHubService;
  let octokitInstance: Octokit;
  
  const TEST_REPO_OWNER = 'test-owner';
  const TEST_REPO_NAME = 'test-repo';

  beforeEach(() => {
    jest.clearAllMocks();
    octokitInstance = new Octokit({ auth: 'test-token' });
    
    service = new GitHubService(
      mockPrismaClient as unknown as PrismaClient,
      octokitInstance,
      {
        type: 'token',
        credentials: { token: 'test-token' }
      }
    );
  });

  describe('Repository Operations', () => {
    it('should fetch repository successfully', async () => {
      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      expect(repo).toEqual(mockRepository);
    });

    it('should handle rate limiting with retry', async () => {
      const mockOctokit = createMockOctokit();
      mockOctokit.rateLimit.get
        .mockRejectedValueOnce(mockErrors.rateLimit)
        .mockResolvedValueOnce(mockRateLimitResponse);

      service = new GitHubService(
        mockPrismaClient as unknown as PrismaClient,
        mockOctokit as unknown as Octokit,
        {
          type: 'token',
          credentials: { token: 'test-token' }
        }
      );

      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      expect(repo).toEqual(mockRepository);
    });

    it('should handle non-existent repository', async () => {
      await expect(
        service.getRepository(TEST_REPO_OWNER, 'non-existent-repo')
      ).rejects.toMatchObject({
        status: 404,
        message: expect.stringContaining('Not Found')
      } as GitHubError);
    });
  });

  describe('Pull Request Operations', () => {
    it('should fetch pull request details', async () => {
      const pr = await service.getPullRequest(
        TEST_REPO_OWNER,
        TEST_REPO_NAME,
        1
      );

      expect(pr).toEqual(mockPullRequest);
    });

    it('should handle pull request not found', async () => {
      await expect(
        service.getPullRequest(TEST_REPO_OWNER, TEST_REPO_NAME, 999)
      ).rejects.toMatchObject({
        status: 404,
        message: expect.stringContaining('Not Found')
      } as GitHubError);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid authentication', async () => {
      const mockOctokit = createMockOctokit();
      mockOctokit.repos.get.mockRejectedValueOnce(mockErrors.unauthorized);

      service = new GitHubService(
        mockPrismaClient as unknown as PrismaClient,
        mockOctokit as unknown as Octokit,
        {
          type: 'token',
          credentials: { token: 'invalid-token' }
        }
      );

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toMatchObject({
        status: 401,
        message: expect.stringContaining('Bad credentials')
      } as GitHubError);
    });

    it('should handle server errors', async () => {
      const mockOctokit = createMockOctokit();
      mockOctokit.repos.get.mockRejectedValueOnce(mockErrors.serverError);

      service = new GitHubService(
        mockPrismaClient as unknown as PrismaClient,
        mockOctokit as unknown as Octokit,
        {
          type: 'token',
          credentials: { token: 'test-token' }
        }
      );

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toMatchObject({
        status: 500,
        message: expect.stringContaining('Internal Server Error')
      } as GitHubError);
    });

    it('should handle network errors', async () => {
      const mockOctokit = createMockOctokit();
      mockOctokit.repos.get.mockRejectedValueOnce(new Error('Network error'));

      service = new GitHubService(
        mockPrismaClient as unknown as PrismaClient,
        mockOctokit as unknown as Octokit,
        {
          type: 'token',
          credentials: { token: 'test-token' }
        }
      );

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toThrow('Network error');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit with exponential backoff', async () => {
      const mockOctokit = createMockOctokit();
      mockOctokit.repos.get
        .mockRejectedValueOnce(mockErrors.rateLimit)
        .mockRejectedValueOnce(mockErrors.rateLimit)
        .mockResolvedValueOnce(mockGithubRepoResponse);

      service = new GitHubService(
        mockPrismaClient as unknown as PrismaClient,
        mockOctokit as unknown as Octokit,
        {
          type: 'token',
          credentials: { token: 'test-token' }
        }
      );

      const startTime = Date.now();
      const repo = await service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME);
      const duration = Date.now() - startTime;

      expect(repo).toEqual(mockRepository);
      expect(duration).toBeGreaterThan(3000); // Base delay (1s) + 2s + jitter
    });

    it('should fail after max retries', async () => {
      const mockOctokit = createMockOctokit();
      mockOctokit.repos.get.mockRejectedValue(mockErrors.rateLimit);

      service = new GitHubService(
        mockPrismaClient as unknown as PrismaClient,
        mockOctokit as unknown as Octokit,
        {
          type: 'token',
          credentials: { token: 'test-token' }
        }
      );

      await expect(
        service.getRepository(TEST_REPO_OWNER, TEST_REPO_NAME)
      ).rejects.toMatchObject({
        status: 403,
        message: expect.stringContaining('API rate limit exceeded')
      } as GitHubError);
    });
  });
});
