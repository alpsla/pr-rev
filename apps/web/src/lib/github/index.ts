// Re-export service implementation
export {
  GitHubService,
  type IGitHubService,
  type GitHubServiceConfig,
  type GitHubAuthConfig,
} from './github-service';

// Re-export types
export type {
  WebhookEventName,
  WebhookEventPayload,
  PullRequestWebhookPayload,
  ReviewWebhookPayload,
  RepositoryWebhookPayload,
  Repository,
  PullRequest,
  PullRequestReview,
} from './types';

// Re-export API types
export type {
  GitHubApiResponse,
  GitHubApiError,
  GitHubAuthParams,
  GitHubRepoIdentifier,
  GitHubApiOptions,
  GitHubUserIdentifier,
} from './types/github-api-types';

// Re-export errors
export {
  GitHubError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  ServerError,
  ValidationError,
  ResourceConflictError,
} from './errors';
