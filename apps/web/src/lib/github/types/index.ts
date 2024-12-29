import type { 
  PullRequestEvent,
  PullRequestReviewEvent,
  RepositoryEvent,
  WebhookEventMap 
} from "@octokit/webhooks-types";

export type WebhookEventName = keyof WebhookEventMap;
export type WebhookEventPayload = WebhookEventMap[WebhookEventName];
export type PullRequestWebhookPayload = PullRequestEvent;
export type ReviewWebhookPayload = PullRequestReviewEvent;
export type RepositoryWebhookPayload = RepositoryEvent;

export interface PullRequestReview {
  id: number;
  user: {
    login: string;
    avatarUrl: string;
    type: string;
    role: 'REVIEWER';
  };
  body: string | null;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  commitId: string;
  submittedAt: string;
}

export * from "./api";
export * from "./auth";
export * from "./app";
export * from "./common";
export * from "./repository";
export * from "./pullRequest";
export * from "./github-api-types";
