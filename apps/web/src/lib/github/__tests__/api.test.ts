import { jest } from '@jest/globals';
import { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { RequestInterface, RequestParameters, EndpointInterface } from '@octokit/types';
import type { PaginateInterface } from '@octokit/plugin-paginate-rest';
import { RequestError } from '@octokit/request-error';
import type { OctokitMock } from './setup';
import type { ResponseHeaders, OctokitResponse } from '@octokit/types';
import { createRequestMock, createGraphQLMock, createPullRequestResponse } from './mocks';
import type { PullRequestParams, PullRequestResponse } from './mocks';

function createMockOctokit(): Partial<Octokit> {
  // Create properly typed request function
  const request = createRequestMock();

  // Create GraphQL mock
  const graphql = createGraphQLMock();

  // Create paginate mock
  const paginateMock = Object.assign(
    jest.fn().mockImplementation(() => Promise.resolve([])),
    {
      iterator: jest.fn().mockImplementation(() => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.resolve({ done: true, value: undefined })
        })
      }))
    }
  ) as unknown as PaginateInterface & jest.Mock;

  // Helper function for creating responses
  function createResponse<T>(data: T): OctokitResponse<T, 200> {
    const headers: ResponseHeaders = {
      'x-github-media-type': 'github.v3; format=json',
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4999',
      'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString(),
      'content-type': 'application/json; charset=utf-8'
    };

    return {
      data,
      status: 200 as const,
      url: 'https://api.github.com/test',
      headers
    };
  }

  // Create typed mock function helper
  function createTypedMock<P, R>(implementation: (params: P) => Promise<R>) {
    return jest.fn(implementation);
  }

  // Pull request mock response creator
  function createMockPullRequestResponse(params: PullRequestParams): Promise<PullRequestResponse> {
    return Promise.resolve(createPullRequestResponse(params));
  }

  // Create the mock Octokit instance
  return {
    request,
    paginate: paginateMock,
    graphql,
    rest: {
      pulls: {
        get: createTypedMock<
          PullRequestParams,
          PullRequestResponse
        >((params) => {
          if (!params.owner) {
            throw new Error("Required parameter 'owner' is missing");
          }
          if (!params.repo) {
            throw new Error("Required parameter 'repo' is missing");
          }
          if (!params.pull_number) {
            throw new Error("Required parameter 'pull_number' is missing");
          }
          
          return Promise.resolve(createMockPullRequestResponse(params));
        }),
        listReviews: createTypedMock<
          RestEndpointMethodTypes['pulls']['listReviews']['parameters'],
          OctokitResponse<RestEndpointMethodTypes['pulls']['listReviews']['response']['data'], 200>
        >((params) => Promise.resolve(createResponse([{
          id: 1,
          node_id: 'PRR_1',
          user: {
            login: 'reviewer',
            id: 2,
            node_id: 'U_2',
            avatar_url: 'https://avatars.githubusercontent.com/u/2',
            gravatar_id: '',
            url: 'https://api.github.com/users/reviewer',
            html_url: 'https://github.com/reviewer',
            followers_url: 'https://api.github.com/users/reviewer/followers',
            following_url: 'https://api.github.com/users/reviewer/following{/other_user}',
            gists_url: 'https://api.github.com/users/reviewer/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/reviewer/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/reviewer/subscriptions',
            organizations_url: 'https://api.github.com/users/reviewer/orgs',
            repos_url: 'https://api.github.com/users/reviewer/repos',
            events_url: 'https://api.github.com/users/reviewer/events{/privacy}',
            received_events_url: 'https://api.github.com/users/reviewer/received_events',
            type: 'User',
            site_admin: false
          },
          body: 'Looks good!',
          state: 'APPROVED',
          html_url: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}#pullrequestreview-1`,
          pull_request_url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}`,
          _links: {
            html: { href: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}#pullrequestreview-1` },
            pull_request: { href: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}` }
          },
          commit_id: 'abc123',
          submitted_at: new Date().toISOString(),
          author_association: 'COLLABORATOR' as const
        }]))),
        listReviewComments: createTypedMock<
          RestEndpointMethodTypes['pulls']['listReviewComments']['parameters'],
          OctokitResponse<RestEndpointMethodTypes['pulls']['listReviewComments']['response']['data'], 200>
        >((params) => Promise.resolve(createResponse([{
          url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/comments/1`,
          pull_request_review_id: null,
          id: 1,
          node_id: 'PRRC_1',
          diff_hunk: '@@ -1,1 +1,2 @@\n+// TODO: Add implementation',
          path: 'src/main.ts',
          position: undefined,
          original_position: undefined,
          commit_id: 'abc123',
          original_commit_id: 'def456',
          user: {
            login: 'reviewer',
            id: 2,
            node_id: 'U_2',
            avatar_url: 'https://avatars.githubusercontent.com/u/2',
            gravatar_id: '',
            url: 'https://api.github.com/users/reviewer',
            html_url: 'https://github.com/reviewer',
            followers_url: 'https://api.github.com/users/reviewer/followers',
            following_url: 'https://api.github.com/users/reviewer/following{/other_user}',
            gists_url: 'https://api.github.com/users/reviewer/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/reviewer/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/reviewer/subscriptions',
            organizations_url: 'https://api.github.com/users/reviewer/orgs',
            repos_url: 'https://api.github.com/users/reviewer/repos',
            events_url: 'https://api.github.com/users/reviewer/events{/privacy}',
            received_events_url: 'https://api.github.com/users/reviewer/received_events',
            type: 'User',
            site_admin: false
          },
          body: 'Need implementation here',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          html_url: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}#discussion_r1`,
          pull_request_url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}`,
          author_association: 'COLLABORATOR' as const,
          _links: {
            self: { href: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/comments/1` },
            html: { href: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}#discussion_r1` },
            pull_request: { href: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/${params.pull_number}` }
          },
          start_line: undefined,
          original_start_line: undefined,
          start_side: undefined,
          line: 1,
          original_line: 1,
          side: 'RIGHT' as const,
          in_reply_to_id: undefined,
          body_text: 'Need implementation here',
          body_html: '<p>Need implementation here</p>',
          reactions: {
            url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls/comments/1/reactions`,
            total_count: 0,
            '+1': 0,
            '-1': 0,
            laugh: 0,
            confused: 0,
            heart: 0,
            hooray: 0,
            rocket: 0,
            eyes: 0
          }
        }]))),
      },
      repos: {
        get: jest.fn((params: RestEndpointMethodTypes['repos']['get']['parameters']) => {
          if (!params.owner) {
            throw new Error("Required parameter 'owner' is missing");
          }
          if (!params.repo) {
            throw new Error("Required parameter 'repo' is missing");
          }
          
          return Promise.resolve({
            data: {
              id: 1,
              node_id: 'R_1',
              name: params.repo,
              full_name: `${params.owner}/${params.repo}`,
              private: false,
              owner: {
                login: params.owner,
                id: 1,
                node_id: 'U_1',
                avatar_url: 'https://github.com/images/error/octocat.gif',
                gravatar_id: '',
                name: null,
                email: null,
                url: `https://api.github.com/users/${params.owner}`,
                html_url: `https://github.com/${params.owner}`,
                followers_url: `https://api.github.com/users/${params.owner}/followers`,
                following_url: `https://api.github.com/users/${params.owner}/following{/other_user}`,
                gists_url: `https://api.github.com/users/${params.owner}/gists{/gist_id}`,
                starred_url: `https://api.github.com/users/${params.owner}/starred{/owner}{/repo}`,
                subscriptions_url: `https://api.github.com/users/${params.owner}/subscriptions`,
                organizations_url: `https://api.github.com/users/${params.owner}/orgs`,
                repos_url: `https://api.github.com/users/${params.owner}/repos`,
                events_url: `https://api.github.com/users/${params.owner}/events{/privacy}`,
                received_events_url: `https://api.github.com/users/${params.owner}/received_events`,
                type: 'User',
                site_admin: false,
                starred_at: undefined
              },
              description: 'Test repository',
              fork: false,
              url: `https://api.github.com/repos/${params.owner}/${params.repo}`,
              archive_url: `https://api.github.com/repos/${params.owner}/${params.repo}/{archive_format}{/ref}`,
              assignees_url: `https://api.github.com/repos/${params.owner}/${params.repo}/assignees{/user}`,
              blobs_url: `https://api.github.com/repos/${params.owner}/${params.repo}/git/blobs{/sha}`,
              branches_url: `https://api.github.com/repos/${params.owner}/${params.repo}/branches{/branch}`,
              collaborators_url: `https://api.github.com/repos/${params.owner}/${params.repo}/collaborators{/collaborator}`,
              comments_url: `https://api.github.com/repos/${params.owner}/${params.repo}/comments{/number}`,
              commits_url: `https://api.github.com/repos/${params.owner}/${params.repo}/commits{/sha}`,
              compare_url: `https://api.github.com/repos/${params.owner}/${params.repo}/compare/{base}...{head}`,
              contents_url: `https://api.github.com/repos/${params.owner}/${params.repo}/contents/{+path}`,
              contributors_url: `https://api.github.com/repos/${params.owner}/${params.repo}/contributors`,
              deployments_url: `https://api.github.com/repos/${params.owner}/${params.repo}/deployments`,
              downloads_url: `https://api.github.com/repos/${params.owner}/${params.repo}/downloads`,
              events_url: `https://api.github.com/repos/${params.owner}/${params.repo}/events`,
              forks_url: `https://api.github.com/repos/${params.owner}/${params.repo}/forks`,
              git_commits_url: `https://api.github.com/repos/${params.owner}/${params.repo}/git/commits{/sha}`,
              git_refs_url: `https://api.github.com/repos/${params.owner}/${params.repo}/git/refs{/sha}`,
              git_tags_url: `https://api.github.com/repos/${params.owner}/${params.repo}/git/tags{/sha}`,
              git_url: `git://github.com/${params.owner}/${params.repo}.git`,
              hooks_url: `https://api.github.com/repos/${params.owner}/${params.repo}/hooks`,
              issue_comment_url: `https://api.github.com/repos/${params.owner}/${params.repo}/issues/comments{/number}`,
              issue_events_url: `https://api.github.com/repos/${params.owner}/${params.repo}/issues/events{/number}`,
              issues_url: `https://api.github.com/repos/${params.owner}/${params.repo}/issues{/number}`,
              keys_url: `https://api.github.com/repos/${params.owner}/${params.repo}/keys{/key_id}`,
              labels_url: `https://api.github.com/repos/${params.owner}/${params.repo}/labels{/name}`,
              languages_url: `https://api.github.com/repos/${params.owner}/${params.repo}/languages`,
              merges_url: `https://api.github.com/repos/${params.owner}/${params.repo}/merges`,
              milestones_url: `https://api.github.com/repos/${params.owner}/${params.repo}/milestones{/number}`,
              notifications_url: `https://api.github.com/repos/${params.owner}/${params.repo}/notifications{?since,all,participating}`,
              pulls_url: `https://api.github.com/repos/${params.owner}/${params.repo}/pulls{/number}`,
              releases_url: `https://api.github.com/repos/${params.owner}/${params.repo}/releases{/id}`,
              ssh_url: `git@github.com:${params.owner}/${params.repo}.git`,
              stargazers_url: `https://api.github.com/repos/${params.owner}/${params.repo}/stargazers`,
              statuses_url: `https://api.github.com/repos/${params.owner}/${params.repo}/statuses/{sha}`,
              subscribers_url: `https://api.github.com/repos/${params.owner}/${params.repo}/subscribers`,
              subscription_url: `https://api.github.com/repos/${params.owner}/${params.repo}/subscription`,
              tags_url: `https://api.github.com/repos/${params.owner}/${params.repo}/tags`,
              teams_url: `https://api.github.com/repos/${params.owner}/${params.repo}/teams`,
              trees_url: `https://api.github.com/repos/${params.owner}/${params.repo}/git/trees{/sha}`,
              clone_url: `https://github.com/${params.owner}/${params.repo}.git`,
              svn_url: `https://github.com/${params.owner}/${params.repo}`,
              mirror_url: null,
              homepage: null,
              default_branch: 'main',
              open_issues: 0,
              open_issues_count: 0,
              watchers: 0,
              has_issues: true,
              has_projects: true,
              has_pages: false,
              has_wiki: true,
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
              temp_clone_token: '',
              allow_squash_merge: true,
              allow_auto_merge: false,
              delete_branch_on_merge: false,
              allow_merge_commit: true,
              subscribers_count: 0,
              network_count: 0,
              master_branch: 'main',
              anonymous_access_enabled: false,
              web_commit_signoff_required: false,
              topics: [],
              custom_properties: undefined
            },
            status: 200 as const,
            url: `https://api.github.com/repos/${params.owner}/${params.repo}`,
            headers: {
              'x-github-media-type': 'github.v3; format=json',
              'x-ratelimit-limit': '5000',
              'x-ratelimit-remaining': '4999',
              'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString(),
              'content-type': 'application/json; charset=utf-8'
            }
          });
        }),
        listForOrg: jest.fn(() => Promise.resolve(createResponse([]))),
        listCommits: jest.fn(() => Promise.resolve(createResponse([])))
      },
      listForOrg: jest.fn(() => Promise.resolve(createResponse([]))),
      listCommits: jest.fn(() => Promise.resolve(createResponse([])))
    },
    rateLimit: {
      get: jest.fn(() => Promise.resolve(createResponse({
        resources: {
          core: {
            limit: 5000,
            remaining: 4999,
            reset: Math.floor(Date.now() / 1000 + 3600),
            used: 1
          }
        }
      })))
    },
    apps: {
      createInstallationAccessToken: jest.fn((params: RestEndpointMethodTypes['apps']['createInstallationAccessToken']['parameters']) => 
        Promise.resolve(createResponse({
          token: 'test-token',
          expires_at: new Date().toISOString(),
          permissions: { contents: 'read' },
          repository_selection: 'all'
        }))
      )
    }
  },
  hook: {
    before: jest.fn() as ReturnType<typeof jest.fn> & Octokit['hook']['before'],
    after: jest.fn() as ReturnType<typeof jest.fn> & Octokit['hook']['after'],
    error: jest.fn() as ReturnType<typeof jest.fn> & Octokit['hook']['error'],
    wrap: jest.fn() as ReturnType<typeof jest.fn> & Octokit['hook']['wrap'],
    remove: jest.fn() as ReturnType<typeof jest.fn> & Octokit['hook']['remove'],
    api: {
      request: jest.fn() as ReturnType<typeof jest.fn> & Octokit['hook']['api']['request']
    }
  },
  auth: jest.fn() as ReturnType<typeof jest.fn> & Octokit['auth'],
  log: {
    debug: jest.fn() as ReturnType<typeof jest.fn> & Octokit['log']['debug'],
    info: jest.fn() as ReturnType<typeof jest.fn> & Octokit['log']['info'],
    warn: jest.fn() as ReturnType<typeof jest.fn> & Octokit['log']['warn'],
    error: jest.fn() as ReturnType<typeof jest.fn> & Octokit['log']['error']
  }
};

  describe('GitHub API Error Handling', () => {
    let octokit: Partial<Octokit>;

    beforeEach(() => {
      octokit = createMockOctokit();
    });

    test('throws error when required parameters are missing', async () => {
      // Test missing owner
      await expect(octokit.rest.repos.get({
        repo: 'test-repo'
      } as any)).rejects.toThrow("Required parameter 'owner' is missing");

      // Test missing repo
      await expect(octokit.rest.repos.get({
        owner: 'test-owner'
      } as any)).rejects.toThrow("Required parameter 'repo' is missing");

      // Test missing pull number
      await expect(octokit.rest.pulls.get({
        owner: 'test-owner',
        repo: 'test-repo'
      } as any)).rejects.toThrow("Required parameter 'pull_number' is missing");
    });

    test('handles rate limit errors', async () => {
      const rateLimitError = new RequestError('API rate limit exceeded', 403, {
        request: { method: 'GET', url: '', headers: {} },
        response: {
          status: 403,
          headers: {},
          data: {
            message: 'API rate limit exceeded',
            documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
          }
        }
      });

      octokit.rest.repos.get.mockRejectedValueOnce(rateLimitError);

      await expect(octokit.rest.repos.get({
        owner: 'test-owner',
        repo: 'test-repo'
      })).rejects.toThrow('API rate limit exceeded');
    });

    test('handles not found errors', async () => {
      const notFoundError = new RequestError('Not Found', 404, {
        request: { method: 'GET', url: '', headers: {} },
        response: {
          status: 404,
          headers: {},
          data: {
            message: 'Not Found',
            documentation_url: 'https://docs.github.com/rest'
          }
        }
      });

      octokit.rest.pulls.get.mockRejectedValueOnce(notFoundError);

      await expect(octokit.rest.pulls.get({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 1
      })).rejects.toThrow('Not Found');
    });
  });

  // Export the function
  export { createMockOctokit };