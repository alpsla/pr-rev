/**
 * Common interfaces used across GitHub API interactions
 */

import { GitHubAccountType } from './app';

/**
 * Base interface for GitHub API responses
 */
export interface GitHubApiResponse {
  status: number;
  headers: Record<string, string>;
  data: unknown;
}

/**
 * Base interface for GitHub API errors
 */
export interface GitHubApiError {
  message: string;
  documentation_url?: string;
  status?: number;
}

/**
 * Base interface for GitHub API pagination
 */
export interface GitHubPagination {
  page: number;
  per_page: number;
  total?: number;
}

/**
 * Base interface for GitHub API filters
 */
export interface GitHubFilters {
  state?: 'open' | 'closed' | 'all';
  sort?: string;
  direction?: 'asc' | 'desc';
  since?: string;
  before?: string;
}

/**
 * Base interface for GitHub API search parameters
 */
export interface GitHubSearchParams extends GitHubPagination, GitHubFilters {
  q: string;
}

/**
 * Base interface for GitHub API authentication
 */
export interface GitHubAuthParams {
  token?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Base interface for GitHub repository identification
 */
export interface GitHubRepoIdentifier {
  owner: string;
  repo: string;
}

/**
 * Base interface for GitHub user identification
 */
export interface GitHubUserIdentifier {
  id: number;
  login: string;
  type: GitHubAccountType;
}

/**
 * Base interface for GitHub API options
 */
export interface GitHubApiOptions {
  baseUrl?: string;
  userAgent?: string;
  previews?: string[];
  timeout?: number;
  headers?: Record<string, string>;
  retry?: {
    retries: number;
    factor: number;
    minTimeout: number;
    maxTimeout: number;
  };
}
