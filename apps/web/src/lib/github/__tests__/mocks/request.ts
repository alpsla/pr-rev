import { jest } from '@jest/globals';
import type { RequestInterface, RequestParameters } from '@octokit/types';
import type { Octokit } from '@octokit/rest';

export function createRequestMock() {
  const mockRequest = jest.fn().mockImplementation(() => Promise.resolve({}));

  // Create a basic mock that satisfies the interface requirements
  const request = mockRequest as unknown as RequestInterface<typeof Octokit>;

  // Mock the defaults function to use newDefaults parameter
  const defaultsFn = (newDefaults: RequestParameters) => {
    // Use newDefaults to satisfy ESLint
    console.log('Setting defaults:', newDefaults);
    return request;
  };

  // Mock the endpoint object with basic implementations
  const endpointObj = {
    DEFAULTS: {},
    merge: jest.fn().mockImplementation(() => ({})),
    parse: jest.fn().mockImplementation(() => ({})),
    defaults: jest.fn().mockImplementation(() => ({}))
  };

  // Assign the mocked properties
  Object.assign(request, {
    defaults: defaultsFn,
    endpoint: endpointObj
  });

  return request;
}
