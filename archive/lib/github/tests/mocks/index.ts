import { mockRequest } from './request';
import { createGraphQLMock } from './graphql';
import { createPullRequestResponse } from './pullRequest';
import type { PullRequestParams, PullRequestResponse } from './pullRequest';
import type { 
  PullRequestWebhookPayload, 
  ReviewWebhookPayload, 
  GitHubWebhookUser 
} from '../../types';
import {
  mockRateLimitResponse,
  mockGithubRepoResponse,
  mockPullRequestResponse,
  mockPullRequestReviewsResponse
} from './responses';
import { createMockOctokit } from './octokit';
import type { Octokit } from '@octokit/rest';

export type MockOctokit = jest.Mocked<Octokit>;

export function createPullRequestWebhookPayload(params: {
  action: 'opened' | 'closed' | 'reopened' | 'edited' | 'synchronize';
  number: number;
  title: string;
  owner: string;
  repo: string;
}): PullRequestWebhookPayload {
  const mockOwner: GitHubWebhookUser = {
    login: params.owner,
    id: 1,
    avatar_url: 'https://github.com/images/error/octocat_happy.gif',
    gravatar_id: '',
    url: `https://api.github.com/users/${params.owner}`,
    html_url: `https://github.com/${params.owner}`,
    type: 'User',
    site_admin: false
  };

  const mockRepo = {
    id: '1',  // Changed to string
    name: params.repo,
    full_name: `${params.owner}/${params.repo}`,
    private: false,
    html_url: `https://github.com/${params.owner}/${params.repo}`,
    owner: mockOwner
  };

  return {
    action: params.action,
    repository: mockRepo,
    pull_request: {
      number: params.number,
      title: params.title,
      body: '',
      state: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      merged_at: null,
      draft: false,
      mergeable: true,
      rebaseable: true,
      labels: [],
      user: mockOwner,
      head: {
        ref: 'feature',
        sha: 'head-sha'
      },
      base: {
        ref: 'main'
      }
    }
  };
}

export function createReviewWebhookPayload(params: {
  action: 'submitted' | 'edited' | 'dismissed';  // Fixed action type
  state: 'PENDING' | 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED';
  number: number;
  owner: string;
  repo: string;
}): ReviewWebhookPayload {
  const mockOwner: GitHubWebhookUser = {
    login: params.owner,
    id: 1,
    avatar_url: 'https://github.com/images/error/octocat_happy.gif',
    gravatar_id: '',
    url: `https://api.github.com/users/${params.owner}`,
    html_url: `https://github.com/${params.owner}`,
    type: 'User',
    site_admin: false
  };

  const mockRepo = {
    id: '1',  // Changed to string
    name: params.repo,
    full_name: `${params.owner}/${params.repo}`,
    private: false,
    html_url: `https://github.com/${params.owner}/${params.repo}`,
    owner: mockOwner
  };

  return {
    action: params.action,
    repository: mockRepo,
    pull_request: {
      id: '1',  // Added required field
      number: params.number,
      state: 'open'  // Added required field
    },
    review: {
      id: 1,
      user: mockOwner,
      body: null,
      state: params.state,
      submitted_at: new Date().toISOString(),
      commit_id: 'mock-commit-id'
    }
  };
}

export {
  mockRequest,
  createGraphQLMock,
  createPullRequestResponse,
  createMockOctokit,
  mockRateLimitResponse,
  mockGithubRepoResponse,
  mockPullRequestResponse,
  mockPullRequestReviewsResponse,
  type PullRequestParams,
  type PullRequestResponse
};