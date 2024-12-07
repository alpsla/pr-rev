import { jest } from '@jest/globals';
import { Octokit } from '@octokit/rest';

interface GraphQLDefaults {
  baseUrl: string;
  headers: {
    'user-agent': string;
    accept: string;
  };
  method: 'POST';
  url: string;
}

const defaultEndpoint: GraphQLDefaults = {
  baseUrl: 'https://api.github.com',
  headers: {
    'user-agent': 'octokit-test',
    accept: 'application/vnd.github.v3+json'
  },
  method: 'POST',
  url: ''
} as const;

export function createGraphQLMock(): ReturnType<typeof jest.fn> & Octokit['graphql'] {
  const graphql = Object.assign(
    jest.fn().mockImplementation(() => Promise.resolve({})),
    {
      defaults: {} as Octokit['graphql']['defaults'],
      endpoint: {
        DEFAULTS: defaultEndpoint
      }
    }
  ) as ReturnType<typeof jest.fn> & Octokit['graphql'];
  
  return graphql;
}

export { defaultEndpoint };