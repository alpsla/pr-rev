// src/lib/github/types/api.ts
import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { Repository } from './repository';
import type { PullRequest } from './pullRequest';
import type { RateLimitInfo } from './common';

// API Response Types
export type ReposGetResponse = RestEndpointMethodTypes['repos']['get']['response'];
export type PullsGetResponse = RestEndpointMethodTypes['pulls']['get']['response'];
export type RateLimitGetResponse = RestEndpointMethodTypes['rateLimit']['get']['response'];

// API Parameters Types
export type ReposGetParams = RestEndpointMethodTypes['repos']['get']['parameters'];
export type PullsGetParams = RestEndpointMethodTypes['pulls']['get']['parameters'];
export type PullsListParams = RestEndpointMethodTypes['pulls']['list']['parameters'];

// Cache Types
export interface CacheEntry<T> {
 data: T;
 timestamp: number;
 ttl: number;
}

// API Service Response Types
export interface ServiceResponse<T> {
 data: T;
 cached?: boolean;
 rateLimit?: RateLimitInfo;
 metadata?: {
   requestId?: string;
   timestamp: string;
 };
}

export interface RepositoryResponse extends ServiceResponse<Repository> {
 permissions?: {
   admin: boolean;
   maintain: boolean;
   push: boolean;
 };
}

export interface PullRequestResponse extends ServiceResponse<PullRequest> {
 reviewers?: {
   users: string[];
   teams: string[];
 };
}

// API Client Configuration
export interface ApiClientConfig {
 baseUrl?: string;
 timeout?: number;
 retries?: number;
 cache?: {
   ttl: number;
   maxSize: number;
 };
}