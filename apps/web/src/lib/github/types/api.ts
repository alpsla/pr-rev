import type { Repository } from './repository';
import type { PullRequest } from './pullRequest';
import type { RateLimitInfo } from './common';

export interface GitHubResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface GitHubError {
  message: string;
  documentation_url?: string;
  status: number;
}

export interface GitHubServiceConfig {
  token: string;
  baseUrl?: string;
  userAgent?: string;
}

export interface GitHubRateLimit {
  resources: {
    core: RateLimitInfo;
    search: RateLimitInfo;
    graphql: RateLimitInfo;
    integration_manifest: RateLimitInfo;
    code_scanning_upload: RateLimitInfo;
  };
  rate: RateLimitInfo;
}

export type { Repository, PullRequest };
