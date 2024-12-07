import { jest } from '@jest/globals';
import type { 
  RequestInterface, 
  EndpointInterface,
} from '@octokit/types';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';

// Define types for better readability
type InstallationTokenParams = RestEndpointMethodTypes['apps']['createInstallationAccessToken']['parameters'];
type InstallationTokenResponse = RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response'];
type InstallationTokenFunction = (
  params: InstallationTokenParams
) => Promise<InstallationTokenResponse>;

// Create mock function with explicit type casting
const mockFn = jest.fn(
  (params: InstallationTokenParams) => Promise.resolve({
    data: {
      token: 'ghs_mock_token',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
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
) as jest.MockedFunction<InstallationTokenFunction>;

// Add Octokit properties
const enhancedMock = Object.assign(mockFn, {
  endpoint: {
    DEFAULTS: {
      method: 'POST' as const,
      baseUrl: 'https://api.github.com',
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': 'octokit-test'
      },
      mediaType: {
        format: '',
        previews: [] as string[]
      }
    },
    defaults: jest.fn(),
    merge: jest.fn(),
    parse: jest.fn()
  },
  defaults: jest.fn()
});

type InstallationDefaults = RequestInterface<InstallationTokenParams>['defaults'];
// Export with proper typing
export const createInstallationAccessToken = enhancedMock as unknown as InstallationTokenFunction & {
    defaults: InstallationDefaults;
    endpoint: EndpointInterface;
  };