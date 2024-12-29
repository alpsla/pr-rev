import { Octokit } from '@octokit/rest';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockOctokit = DeepMockProxy<Octokit>;

export const createMockOctokit = (): MockOctokit => {
  return mockDeep<Octokit>();
};
