import type { Octokit } from '@octokit/rest';
import type {
    EndpointInterface,
} from '@octokit/types';
import { createGraphQLMock } from './mocks/graphql';

// Create alias for the GitHub API client type
type OctokitClient = Octokit['rest'];

// Helper type for endpoint interface
type EndpointDefaults = {
  baseUrl: string;
  headers: { [key: string]: string };
  mediaType: { format: string };
  method: string;
  url: string;
};

// Helper function to create endpoint interface
function createEndpoint<T extends { url: string }>(defaults: EndpointDefaults): EndpointInterface<T> {
  return {
    DEFAULTS: defaults,
    merge: jest.fn((route: string, parameters?: object) => ({
      ...defaults,
      ...parameters,
      url: route,
    })),
    parse: jest.fn(),
    defaults: jest.fn(),
  } as unknown as EndpointInterface<T>;
}

export interface OctokitMock {
  request: jest.MockedFunction<Octokit['request']>;
  graphql: ReturnType<typeof createGraphQLMock>;
  paginate: jest.MockedFunction<Octokit['paginate']>;
  rest: {
    apps: {
      createInstallationAccessToken: OctokitClient['apps']['createInstallationAccessToken'];
    };
    actions: {
      addCustomLabelsToSelfHostedRunnerForOrg: OctokitClient['actions']['addCustomLabelsToSelfHostedRunnerForOrg'];
      addCustomLabelsToSelfHostedRunnerForRepo: OctokitClient['actions']['addCustomLabelsToSelfHostedRunnerForRepo'];
      addSelectedRepoToOrgSecret: OctokitClient['actions']['addSelectedRepoToOrgSecret'];
      addSelectedRepoToOrgVariable: OctokitClient['actions']['addSelectedRepoToOrgVariable'];
      approveWorkflowRun: OctokitClient['actions']['approveWorkflowRun'];
      cancelWorkflowRun: OctokitClient['actions']['cancelWorkflowRun'];
    };
  };
}

export const createMockOctokit = (): OctokitMock => {
  const defaults: EndpointDefaults = {
    baseUrl: 'https://api.github.com',
    headers: {
      accept: 'application/vnd.github.v3+json',
      'user-agent': 'octokit-test'
    },
    mediaType: { format: '' },
    method: 'GET',
    url: '/'
  };

  // Create request mock
  const request = Object.assign(jest.fn(), {
    defaults: jest.fn(),
    endpoint: createEndpoint<{ url: string }>(defaults)
  }) as jest.MockedFunction<Octokit['request']>;

  // Create paginate mock
  const paginateMock = Object.assign(
    jest.fn().mockImplementation(() => Promise.resolve([])),
    {
      iterator: jest.fn().mockImplementation(() => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.resolve({ done: true, value: undefined }),
        }),
      })),
    }
  ) as jest.MockedFunction<Octokit['paginate']>;

  // Create rest API mocks with proper typing
  const createInstallationAccessToken = Object.assign(
    jest.fn().mockImplementation((params: { installation_id: number }) => Promise.resolve({
      data: {
        token: `mock-token-${params.installation_id}`,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        permissions: {
          metadata: 'read',
          pull_requests: 'write',
        },
        repository_selection: 'all',
        repositories: [],
      },
      status: 201,
      url: `https://api.github.com/app/installations/${params.installation_id}/access_tokens`,
      headers: {},
    })),
    {
      defaults: jest.fn(),
      endpoint: createEndpoint<{ url: string }>(defaults)
    }
  ) as OctokitClient['apps']['createInstallationAccessToken'];

  const addCustomLabelsToSelfHostedRunnerForOrg = Object.assign(
    jest.fn().mockImplementation((params: { org: string; runner_id: number; labels: string[] }) => Promise.resolve({
      status: 200,
      url: `https://api.github.com/orgs/${params.org}/actions/runners/${params.runner_id}/labels`,
      headers: {},
      data: {
        total_count: 1,
        labels: [{ id: 123, name: 'test', type: 'custom' }],
      },
    })),
    {
      defaults: jest.fn(),
      endpoint: createEndpoint<{ url: string }>(defaults)
    }
  ) as OctokitClient['actions']['addCustomLabelsToSelfHostedRunnerForOrg'];

  const addCustomLabelsToSelfHostedRunnerForRepo = Object.assign(
    jest.fn().mockImplementation((params: { owner: string; repo: string; runner_id: number; labels: string[] }) => Promise.resolve({
      status: 200,
      url: `https://api.github.com/repos/${params.owner}/${params.repo}/actions/runners/${params.runner_id}/labels`,
      headers: {},
      data: {
        total_count: 1,
        labels: [{ id: 123, name: 'test', type: 'custom' }],
      },
    })),
    {
      defaults: jest.fn(),
      endpoint: createEndpoint<{ url: string }>(defaults)
    }
  ) as OctokitClient['actions']['addCustomLabelsToSelfHostedRunnerForRepo'];

  const addSelectedRepoToOrgSecret = Object.assign(
    jest.fn().mockImplementation((params: { org: string; secret_name: string; repository_id: number }) => Promise.resolve({
      status: 204,
      url: `https://api.github.com/orgs/${params.org}/actions/secrets/${params.secret_name}/repositories/${params.repository_id}`,
      headers: {},
      data: undefined,
    })),
    {
      defaults: jest.fn(),
      endpoint: createEndpoint<{ url: string }>(defaults)
    }
  ) as OctokitClient['actions']['addSelectedRepoToOrgSecret'];

  const addSelectedRepoToOrgVariable = Object.assign(
    jest.fn().mockImplementation((params: { org: string; name: string; repository_id: number }) => Promise.resolve({
      status: 204,
      url: `https://api.github.com/orgs/${params.org}/actions/variables/${params.name}/repositories/${params.repository_id}`,
      headers: {},
      data: undefined,
    })),
    {
      defaults: jest.fn(),
      endpoint: createEndpoint<{ url: string }>(defaults)
    }
  ) as OctokitClient['actions']['addSelectedRepoToOrgVariable'];

  const approveWorkflowRun = Object.assign(
    jest.fn().mockImplementation((params: { owner: string; repo: string; run_id: number }) => Promise.resolve({
      status: 201,
      url: `https://api.github.com/repos/${params.owner}/${params.repo}/actions/runs/${params.run_id}/approve`,
      headers: {},
      data: {},
    })),
    {
      defaults: jest.fn(),
      endpoint: createEndpoint<{ url: string }>(defaults)
    }
  ) as OctokitClient['actions']['approveWorkflowRun'];

  const cancelWorkflowRun = Object.assign(
    jest.fn().mockImplementation((params: { owner: string; repo: string; run_id: number }) => Promise.resolve({
      status: 202,
      url: `https://api.github.com/repos/${params.owner}/${params.repo}/actions/runs/${params.run_id}/cancel`,
      headers: {},
      data: {},
    })),
    {
      defaults: jest.fn(),
      endpoint: createEndpoint<{ url: string }>(defaults)
    }
  ) as OctokitClient['actions']['cancelWorkflowRun'];

  return {
    request,
    graphql: createGraphQLMock(),
    paginate: paginateMock,
    rest: {
      apps: {
        createInstallationAccessToken,
      },
      actions: {
        addCustomLabelsToSelfHostedRunnerForOrg,
        addCustomLabelsToSelfHostedRunnerForRepo,
        addSelectedRepoToOrgSecret,
        addSelectedRepoToOrgVariable,
        approveWorkflowRun,
        cancelWorkflowRun,
      },
    },
  };
};
