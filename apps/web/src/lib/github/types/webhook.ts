// src/lib/github/types/webhook.ts
import type { PullRequest } from './pullRequest';
import type { Repository } from './repository';

export type WebhookEventName = 
 | 'pull_request'
 | 'pull_request_review'
 | 'repository'
 | 'push'
 | 'workflow_job';

export interface BaseWebhookPayload {
 action?: string;
 repository: Repository;
 sender: {
   id: number;
   login: string;
   type: string;
 };
 organization?: {
   id: number;
   login: string;
   node_id: string;
 };
 installation?: {
   id: number;
   node_id: string;
 };
}

export interface PullRequestWebhookPayload extends BaseWebhookPayload {
 action: 'opened' | 'closed' | 'reopened' | 'edited' | 'synchronize';
 pull_request: PullRequest;
 changes?: {
   title?: { from: string };
   body?: { from: string };
 };
}

export interface ReviewWebhookPayload extends BaseWebhookPayload {
 action: 'submitted' | 'edited' | 'dismissed';
 review: {
   id: number;
   user: {
     login: string;
     id: number;
   };
   body: string | null;
   state: ReviewState;
   commit_id: string;
   submitted_at: string;
 };
 pull_request: PullRequest;
}

export interface RepositoryWebhookPayload extends BaseWebhookPayload {
 action: 'created' | 'deleted' | 'archived' | 'unarchived' | 'publicized' | 'privatized';
}

export type ReviewState = 
 | 'approved'
 | 'changes_requested'
 | 'commented'
 | 'dismissed'
 | 'pending';

export interface WebhookDelivery {
 id: string;
 guid: string;
 delivered_at: string;
 redelivery: boolean;
 duration: number;
 status: string;
 status_code: number;
 event: string;
 action: string;
 installation_id: number;
 repository_id: number;
}