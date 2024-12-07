import { jest } from '@jest/globals';
import type { RequestInterface, RequestParameters, EndpointInterface } from '@octokit/types';

// Enhanced request defaults type
interface RequestDefaults {
  method: 'GET';
  baseUrl: string;
  headers: Record<string, string>;
  mediaType: {
    format: string;
    previews: string[];
  };
  request?: {
    fetch: unknown;
    timeout: number;
  };
}

const defaultEndpoint: RequestDefaults = {
  method: 'GET' as const,
  baseUrl: 'https://api.github.com',
  headers: {
    accept: 'application/vnd.github.v3+json',
    'user-agent': 'octokit-mock'
  },
  mediaType: {
    format: '',
    previews: [] as string[]
  },
  request: {
    fetch: undefined,
    timeout: 0
  }
} as const;

export function createRequestMock() {
  const mockFn = jest.fn().mockImplementation(() => Promise.resolve({}));
  
  const requestInterface = mockFn as unknown as jest.MockedFunction<RequestInterface<object>>;
  
  // Create endpoint object first
  type EndpointDefaults = EndpointInterface<object>;
  type MergeFunction = {
    <R extends string, P extends RequestParameters = RequestParameters>(
      route: R,
      parameters?: P
    ): RequestParameters & RequestDefaults & P;
  };
  
  const endpointObj: {
    DEFAULTS: RequestDefaults;
    defaults: jest.MockedFunction<EndpointDefaults['defaults']>;
    merge: EndpointDefaults['merge'];
    parse: jest.MockedFunction<EndpointDefaults['parse']>;
  } = {
    DEFAULTS: defaultEndpoint,
    defaults: jest.fn() as jest.MockedFunction<
      <O extends RequestParameters = RequestParameters>(newDefaults: O) => EndpointInterface<object & O>
    >,
    merge: Object.assign(
      jest.fn(<R extends string, P extends RequestParameters = RequestParameters>(
        route: R,
        parameters?: P
      ) => ({
        ...defaultEndpoint,
        ...(parameters || {}),
        url: route,
      })) as unknown as MergeFunction,
      {
        endpoint: jest.fn(<P extends RequestParameters>(params: P) => ({
          ...defaultEndpoint,
          ...params
        }))
      }
    ) as unknown as EndpointDefaults['merge'],
    parse: jest.fn(<O extends EndpointDefaults = EndpointDefaults>(options: O) => ({
      ...defaultEndpoint,
      ...options
    })) as unknown as jest.MockedFunction<EndpointDefaults['parse']>
  };

  const endpoint = endpointObj as unknown as EndpointInterface<object>;

  // Create and return the request interface
  Object.assign(requestInterface, {
    defaults: jest.fn(<O extends RequestParameters>(newDefaults: O) => {
      const requestWithDefaults = Object.assign(requestInterface, {
        ...requestInterface,
        ...newDefaults
      });
      return requestWithDefaults as unknown as RequestInterface<object & O>;
    }),
    endpoint
  });

  return requestInterface;
}