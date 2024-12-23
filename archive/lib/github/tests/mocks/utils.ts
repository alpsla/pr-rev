import { jest } from '@jest/globals';
import type { ResponseHeaders, OctokitResponse } from '@octokit/types';

// Helper function to create typed responses
export function createResponse<T>(data: T): OctokitResponse<T, 200> {
  const headers: ResponseHeaders = {
    'x-github-media-type': 'github.v3; format=json',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-reset': Math.floor(Date.now() / 1000 + 3600).toString()
  };

  return {
    data,
    status: 200,
    url: 'https://api.github.com',
    headers
  };
}

// Helper function to create typed mock functions
export function createTypedMock<P, R>(
  mockImpl: (params: P) => Promise<R>
): jest.MockedFunction<(params: P) => Promise<R>> {
  return jest.fn(mockImpl) as jest.MockedFunction<(params: P) => Promise<R>>;
}

export type { OctokitResponse, ResponseHeaders };