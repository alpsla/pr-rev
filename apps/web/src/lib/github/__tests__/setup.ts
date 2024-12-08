// apps/web/src/lib/github/__tests__/setup.ts
import { Octokit } from '@octokit/rest';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';
import { createGraphQLMock } from './mocks/graphql'; 
import {
    RestEndpointMethodTypes
} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

// ... other imports if any


const MyOctokit = Octokit.plugin(paginateRest, restEndpointMethods);
const octokit = new MyOctokit();

// Create alias for the GitHub API client type
type OctokitClient = typeof octokit.rest;


export interface OctokitMock {
  request: jest.MockedFunction<typeof octokit.request>;
  graphql: jest.MockedFunction<typeof octokit.graphql>;
  paginate: jest.MockedFunction<typeof octokit.paginate>;
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
  const request = jest.fn();
  const paginateMock = Object.assign(
    jest.fn().mockImplementation(() => Promise.resolve([])),
    {
      iterator: jest.fn().mockImplementation(() => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.resolve({ done: true, value: undefined }),
        }),
      })),
    },
  ) as unknown as jest.MockedFunction<typeof octokit.paginate>;

  const createInstallationAccessToken = Object.assign(
    jest.fn().mockImplementation((params: RestEndpointMethodTypes['apps']['createInstallationAccessToken']['parameters']) =>
      Promise.resolve({
        data: {
          token: 'mock-token',
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
      } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']),
    ),
    {
      endpoint: octokit.rest.apps.createInstallationAccessToken.endpoint,
      defaults: jest.fn(),
    },
  ) as unknown as OctokitClient['apps']['createInstallationAccessToken'];

  //  rest of mock implementation:
  const addCustomLabelsToSelfHostedRunnerForOrg = jest
    .fn()
    .mockImplementation(
      (
        params: RestEndpointMethodTypes['actions']['addCustomLabelsToSelfHostedRunnerForOrg']['parameters'],
      ) =>
        Promise.resolve({
          status: 200,
          url: '',
          headers: {},
          data: {
            total_count: 1,
            labels: [
              {
                id: 123,
                name: 'test',
                color: 'ffffff',
                description: 'Test label',
              },
            ],
          },
        } as RestEndpointMethodTypes['actions']['addCustomLabelsToSelfHostedRunnerForOrg']['response']),
    ) as unknown as OctokitClient['actions']['addCustomLabelsToSelfHostedRunnerForOrg'];

  const addCustomLabelsToSelfHostedRunnerForRepo = jest
    .fn()
    .mockImplementation(
      (
        params: RestEndpointMethodTypes['actions']['addCustomLabelsToSelfHostedRunnerForRepo']['parameters'],
      ) =>
        Promise.resolve({
          status: 200,
          url: '',
          headers: {},
          data: {
            total_count: 1,
            labels: [
              {
                id: 123,
                name: 'test',
                color: 'ffffff',
                description: 'Test label',
              },
            ],
          },
        } as RestEndpointMethodTypes['actions']['addCustomLabelsToSelfHostedRunnerForRepo']['response']),
    ) as unknown as OctokitClient['actions']['addCustomLabelsToSelfHostedRunnerForRepo'];

  const addSelectedRepoToOrgSecret = jest
    .fn()
    .mockImplementation(
      (params: RestEndpointMethodTypes['actions']['addSelectedRepoToOrgSecret']['parameters']) =>
        Promise.resolve({
          status: 204,
          url: '',
          headers: {},
          data: null,
        } as RestEndpointMethodTypes['actions']['addSelectedRepoToOrgSecret']['response']),
    ) as unknown as OctokitClient['actions']['addSelectedRepoToOrgSecret'];

  const addSelectedRepoToOrgVariable = jest
    .fn()
    .mockImplementation(
      (params: RestEndpointMethodTypes['actions']['addSelectedRepoToOrgVariable']['parameters']) =>
        Promise.resolve({
          status: 204,
          url: '',
          headers: {},
          data: null,
        } as RestEndpointMethodTypes['actions']['addSelectedRepoToOrgVariable']['response']),
    ) as unknown as OctokitClient['actions']['addSelectedRepoToOrgVariable'];

  const approveWorkflowRun = jest
    .fn()
    .mockImplementation(
      (params: RestEndpointMethodTypes['actions']['approveWorkflowRun']['parameters']) =>
        Promise.resolve({
          status: 201,
          url: '',
          headers: {},
          data: {},
        } as RestEndpointMethodTypes['actions']['approveWorkflowRun']['response']),
    ) as unknown as OctokitClient['actions']['approveWorkflowRun'];

  const cancelWorkflowRun = jest
    .fn()
    .mockImplementation(
      (params: RestEndpointMethodTypes['actions']['cancelWorkflowRun']['parameters']) =>
        Promise.resolve({
          status: 202,
          url: '',
          headers: {},
          data: {},
        } as RestEndpointMethodTypes['actions']['cancelWorkflowRun']['response']),
    ) as unknown as OctokitClient['actions']['cancelWorkflowRun'];

    const mockOctokit: OctokitMock = {
      request,
      graphql: createGraphQLMock(), // Changed here
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
  
    return mockOctokit;
};