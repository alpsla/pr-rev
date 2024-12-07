import { jest } from '@jest/globals';
import { Octokit } from '@octokit/rest';
import type { PaginateInterface } from '@octokit/plugin-paginate-rest';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import type { OctokitResponse, RequestParameters } from '@octokit/types';
import type { PrismaClient } from '../types';
import { createRequestMock, createGraphQLMock } from './mocks';

// Types
export type OctokitMock = Pick<Octokit, 'request' | 'graphql' | 'paginate'> & {
  rest: {
    apps: {
      createInstallationAccessToken: RestEndpointMethodTypes['apps']['createInstallationAccessToken']
    },
    actions: {
      addCustomLabelsToSelfHostedRunnerForOrg: RestEndpointMethodTypes['actions']['addCustomLabelsToSelfHostedRunnerForOrg'],
      addCustomLabelsToSelfHostedRunnerForRepo: RestEndpointMethodTypes['actions']['addCustomLabelsToSelfHostedRunnerForRepo'],
      addSelectedRepoToOrgSecret: RestEndpointMethodTypes['actions']['addSelectedRepoToOrgSecret'],
      addSelectedRepoToOrgVariable: RestEndpointMethodTypes['actions']['addSelectedRepoToOrgVariable'],
      approveWorkflowRun: RestEndpointMethodTypes['actions']['approveWorkflowRun'],
      cancelWorkflowRun: RestEndpointMethodTypes['actions']['cancelWorkflowRun']
    }
  }
};

export type PrismaMockClient = jest.MockedObject<PrismaClient>;

// Factory function to create properly typed mock
export function createMockOctokit(): OctokitMock {
  const request = createRequestMock();
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

  // Create installation token mock with proper typing
  const createInstallationAccessToken = Object.assign(
    jest.fn().mockImplementation(
      (params: RestEndpointMethodTypes['apps']['createInstallationAccessToken']['parameters']) => 
        Promise.resolve({
          data: {
            token: 'mock-token',
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            permissions: {
              metadata: 'read',
              pull_requests: 'write'
            },
            repository_selection: 'all',
            repositories: []
          },
          status: 201,
          url: `https://api.github.com/app/installations/${params.installation_id}/access_tokens`,
          headers: {}
        } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response'])
    ),
    {
      endpoint: {
        DEFAULTS: {
          method: 'POST',
          baseUrl: 'https://api.github.com',
          headers: {
            accept: 'application/vnd.github.v3+json',
            'user-agent': 'octokit-test'
          },
          mediaType: {
            format: '',
            previews: []
          }
        },
        defaults: jest.fn(),
        merge: jest.fn(),
        parse: jest.fn()
      },
      defaults: jest.fn()
    }
  ) as unknown as RestEndpointMethodTypes['apps']['createInstallationAccessToken'];

  const mockOctokit: OctokitMock = {
    request,
    graphql,
    paginate: paginateMock,
    rest: {
      apps: {
        createInstallationAccessToken
      },
      actions: {
        addCustomLabelsToSelfHostedRunnerForOrg: jest.fn(),
        addCustomLabelsToSelfHostedRunnerForRepo: jest.fn(),
        addSelectedRepoToOrgSecret: jest.fn(),
        addSelectedRepoToOrgVariable: jest.fn(),
        approveWorkflowRun: jest.fn(),
        cancelWorkflowRun: jest.fn()
      }
    }
  };

  return mockOctokit;
}

// Mock rate limit response
export const mockRateLimitResponse = {
  resources: {
    core: {
      limit: 5000,
      used: 0,
      remaining: 5000,
      reset: Math.floor(Date.now() / 1000 + 3600)
    }
  }
};

// Create properly typed mock instance
export const mockOctokitInstance = createMockOctokit() as unknown as jest.Mocked<Octokit>;

// Mock Octokit constructor
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(() => mockOctokitInstance)
}));