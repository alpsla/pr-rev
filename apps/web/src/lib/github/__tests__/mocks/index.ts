import type { RequestParameters } from '@octokit/types';
import type { OctokitResponse } from './utils';
import { createTypedMock } from './utils';

// Types
export type InstallationTokenParams = RequestParameters & {
  installation_id: number;
  repositories?: string[];
  repository_ids?: number[];
  permissions?: {
    actions?: 'write' | 'read';
    administration?: 'write' | 'read';
    checks?: 'write' | 'read';
    contents?: 'write' | 'read';
    deployments?: 'write' | 'read';
    environments?: 'write' | 'read';
    issues?: 'write' | 'read';
    metadata?: 'write' | 'read';
    packages?: 'write' | 'read';
    pages?: 'write' | 'read';
    pull_requests?: 'write' | 'read';
    repository_hooks?: 'write' | 'read';
    repository_projects?: 'write' | 'read';
    security_events?: 'write' | 'read';
    statuses?: 'write' | 'read';
    vulnerability_alerts?: 'write' | 'read';
    workflows?: 'write' | 'read';
  };
};

export type InstallationTokenResponse = OctokitResponse<{
  token: string;
  expires_at: string;
  permissions: {
    pull_requests: 'write';
    metadata: 'read';
  };
  repository_selection: 'all';
  repositories: [];
}, 201>;

// Create installation token mock
export const createInstallationAccessToken = createTypedMock<
  InstallationTokenParams,
  InstallationTokenResponse
>((params) => 
  Promise.resolve({
    data: {
      token: 'test-token',
      expires_at: '2024-01-01T00:00:00Z',
      permissions: {
        pull_requests: 'write',
        metadata: 'read'
      },
      repository_selection: 'all',
      repositories: []
    },
    status: 201,
    url: `https://api.github.com/app/installations/${params.installation_id}/access_tokens`,
    headers: {
      'x-github-media-type': 'github.v3; format=json',
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4999',
      'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString()
    }
  } as InstallationTokenResponse)
);

export { createRequestMock } from './request';
export { createGraphQLMock } from './graphql';