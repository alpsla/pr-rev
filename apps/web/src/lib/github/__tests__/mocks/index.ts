import { createRequestMock } from './request';
import { createGraphQLMock } from './graphql';
import { createPullRequestResponse } from './pullRequest';
import type { PullRequestParams, PullRequestResponse } from './pullRequest';
import type { PullRequestWebhookPayload, ReviewWebhookPayload } from '../../types';

// Create mock webhook payloads
export function createPullRequestWebhookPayload(params: {
  action: string;
  number: number;
  title: string;
  owner: string;
  repo: string;
}): PullRequestWebhookPayload {
  return {
    action: params.action,
    repository: {
      full_name: `${params.owner}/${params.repo}`
    },
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
      user: {
        login: params.owner,
        avatar_url: ''
      }
    }
  };
}

export function createReviewWebhookPayload(params: {
  action: string;
  state: string;
  number: number;
  owner: string;
  repo: string;
}): ReviewWebhookPayload {
  return {
    action: params.action,
    repository: {
      full_name: `${params.owner}/${params.repo}`
    },
    pull_request: {
      number: params.number
    },
    review: {
      id: 1,
      user: {
        login: params.owner,
        avatar_url: ''
      },
      body: null,
      state: params.state as 'PENDING' | 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED',
      submitted_at: new Date().toISOString(),
      commit_id: 'mock-commit-id'
    }
  };
}

export {
  createRequestMock,
  createGraphQLMock,
  createPullRequestResponse,
  type PullRequestParams,
  type PullRequestResponse
};
