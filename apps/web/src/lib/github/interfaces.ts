import { PrismaClient, ReviewStatus } from '@prisma/client';
import type { Octokit } from '@octokit/rest';
import type { 
  WebhookEventName, 
  WebhookEventPayload, 
  PullRequestWebhookPayload, 
  ReviewWebhookPayload,
  RepositoryWebhookPayload
} from './types';
import type { Repository, PullRequest, PullRequestReview } from './types';
import { 
  GitHubError, 
  NotFoundError, 
  AuthenticationError, 
  RateLimitError, 
  NetworkError, 
  ServerError,
  ValidationError,
  ResourceConflictError,
} from './errors';

type GitHubErrorType = Error | OctokitErrorResponse;

interface OctokitErrorResponse {
  status: number;
  message: string;
  response?: {
    status: number;
    data?: {
      message?: string;
      errors?: unknown[];
      documentation_url?: string;
    };
    headers?: Record<string, string>;
  };
  request?: {
    id?: string;
    url?: string;
    method?: string;
  };
}

interface RepositoryPayload {
  id: string | number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
    id?: string | number;
  };
}

export interface GitHubAuthConfig {
  type: 'token';
  credentials: {
    token: string;
  };
}

export interface GitHubServiceConfig {
  auth: GitHubAuthConfig;
}

export interface IGitHubService {
  handleWebhookEvent(eventName: WebhookEventName, payload: WebhookEventPayload): Promise<void>;
  getRepository(owner: string, repo: string): Promise<Repository>;
  getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest>;
  getPullRequestReviews(owner: string, repo: string, number: number): Promise<PullRequestReview[]>;
  destroy(): Promise<void>;
}

const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff delays in ms

type CacheValue = Repository | PullRequest | PullRequestReview[];
type CacheKey = string;


export class GitHubService implements IGitHubService {
  private retryCount = 0;
  private rateLimitRemaining?: number;
  private rateLimitReset?: number;
  private cache: Map<CacheKey, CacheValue>;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly octokit: Octokit,
    private readonly config: GitHubAuthConfig,
  ) {
    this.cache = new Map<CacheKey, CacheValue>();
  }

  
async getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest> {
    const context = { owner, repo, number, action: 'get_pull_request' };
  
    try {
      if (!this.octokit?.rest?.pulls) {
        throw new GitHubError('GitHub API client not properly initialized', 500, null, context);
      }
      return await this.getCached<PullRequest>('pull_request', { owner, repo, number }, async () => {
        const { data } = await this.retryWithBackoff(async () => {
          return await this.octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: number,
          });
        });
  
        if (!data) {
          throw new ValidationError('Invalid response from GitHub API', null, context);
        }
  
        await this.prisma.pullRequest.upsert({
          where: {
            repositoryId_number: {
              repositoryId: data.base.repo.id.toString(),
              number: data.number,
            },
          },
          create: {
            number: data.number,
            title: data.title,
            status: data.merged ? 'MERGED' : data.state === 'closed' ? 'CLOSED' : 'OPEN',
            repositoryId: data.base.repo.id.toString(),
            authorId: data.user?.login ?? '',
            baseBranch: data.base.ref,
            headBranch: data.head.ref,
            isDraft: data.draft ?? false,
            isReady: !(data.draft ?? false),
          },
          update: {
            title: data.title,
            status: data.merged ? 'MERGED' : data.state === 'closed' ? 'CLOSED' : 'OPEN',
            isDraft: data.draft ?? false,
            isReady: !(data.draft ?? false),
          },
        });
        const mappedMergeableState = this.mapMergeableState(data.mergeable_state);
        return {
          number: data.number,
          title: data.title,
          body: data.body ?? '',
          state: data.state,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          mergedAt: data.merged_at,
          changedFiles: data.changed_files,
          additions: data.additions,
          deletions: data.deletions,
          draft: data.draft ?? false,
          mergeable: data.mergeable ?? null,
          rebaseable: data.rebaseable ?? null,
          labels: data.labels?.map(label => label.name) ?? [],
          mergeableState: mappedMergeableState,
          mergeable_state: 'clean' as const
        };
      });
    } catch (error) {
      throw this.handleGitHubError(error as GitHubErrorType, context);
    }
  }

  private getCacheKey(type: string, params: Record<string, string | number>): string {
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const stringValue = value === undefined || value === null ? '' : String(value);
        return `${key}:${stringValue}`;
      })
      .join(',');
    const token = String(this.config?.credentials?.token || '');
    return `${type}:${sortedParams}:${token}`;
  }
  
  private async getCached<T extends CacheValue>(
    type: 'repository' | 'pull_request' | 'pull_request_reviews',
    params: Record<string, string | number>,
    operation: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.getCacheKey(type, params);
    const cached = this.cache.get(cacheKey);
    
    if (cached !== undefined) {
      // Type checking based on the cache type
      switch (type) {
        case 'repository':
          if (this.isRepository(cached)) return cached as T;
          break;
        case 'pull_request':
          if (this.isPullRequest(cached)) return cached as T;
          break;
        case 'pull_request_reviews':
          if (this.isPullRequestReviews(cached)) return cached as T;
          break;
      }
      // If type checking fails, delete the invalid cache entry
      this.cache.delete(cacheKey);
    }
  
    try {
      const result = await operation();
      // Verify the type before caching
      if (
        (type === 'repository' && this.isRepository(result)) ||
        (type === 'pull_request' && this.isPullRequest(result)) ||
        (type === 'pull_request_reviews' && this.isPullRequestReviews(result))
      ) {
        this.cache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      if (error instanceof RateLimitError) {
        this.cache.clear();
      }
      throw error;
    }
  }



  private isRepository(value: unknown): value is Repository {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'fullName' in value &&
    'settings' in value
  );
}

private isPullRequest(value: unknown): value is PullRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    'number' in value &&
    'title' in value &&
    'state' in value &&
    'mergeable_state' in value
  );
}

private isPullRequestReviews(value: unknown): value is PullRequestReview[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item): item is PullRequestReview =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'user' in item &&
        'state' in item
    )
  );
}

private async checkRateLimit(): Promise<void> {
  try {
    if (!this.octokit?.rest?.rateLimit) {
      throw new GitHubError('GitHub API client not properly initialized', 500);
    }
    const response = await this.octokit.rest.rateLimit.get();
      
    // Safe access to nested properties
    const coreLimit = response?.data?.resources?.core;
    if (!coreLimit) {
      console.warn('Invalid rate limit response structure', response);
      return; // Don't throw, just return and let the operation proceed
    }
      
    const { remaining, reset } = coreLimit;
    this.rateLimitRemaining = remaining;
    this.rateLimitReset = reset;

    if (this.rateLimitRemaining === 0) {
      const now = Math.floor(Date.now() / 1000);
      const waitTime = Math.max(0, (this.rateLimitReset - now) * 1000);
      
      throw new RateLimitError(
        'Rate limit exceeded, waiting for reset',
        null,
        {
          waitTime,
          reset: this.rateLimitReset,
          remaining: this.rateLimitRemaining
        }
      );
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    // Log warning but don't throw
    console.warn('Failed to check rate limit:', error);
  }
}

  private async retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.checkRateLimit();
      const result = await operation();
      this.retryCount = 0; // Reset count on success
      return result;
    } catch (error) {
      // Handle rate limit errors
      if (
        error instanceof RateLimitError || 
        (error instanceof GitHubError && error.status === 403 && 
         error.message.toLowerCase().includes('rate limit'))
      ) {
        if (this.retryCount < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[this.retryCount++];
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.retryWithBackoff(operation);
        }
        
        this.cache.clear(); // Clear cache on rate limit exhaustion
        throw error; // Preserve the original error
      }
      
      this.retryCount = 0; // Reset count on non-rate-limit errors
      throw this.handleGitHubError(error as GitHubErrorType);
    }
  }
  
  private isOctokitError(error: unknown): error is OctokitErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('message' in error || 'status' in error || 'response' in error)
    );
  }

  private handleGitHubError(error: GitHubErrorType, context?: Record<string, unknown>): never {
    const errorContext = {
      ...context,
      timestamp: new Date().toISOString(),
      requestId: this.isOctokitError(error) ? error.request?.id : undefined,
      endpoint: this.isOctokitError(error) ? error.request?.url : undefined,
      method: this.isOctokitError(error) ? error.request?.method : undefined,
      headers: this.isOctokitError(error) ? error.response?.headers : undefined,
    };
  
    // Handle network errors first
    if (error instanceof Error && (
      ('code' in error && ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'].includes(error.code as string)) ||
      error.message.toLowerCase().includes('network')
    )) {
      throw new NetworkError('Network error occurred', error, errorContext);
    }
  
    // Handle Octokit errors with response
    if (this.isOctokitError(error) && error.response) {
      const { status } = error.response;
      const message = error.response.data?.message || error.message;
  
      // Map status codes to specific errors
      switch (status) {
        case 401:
          throw new AuthenticationError(message, error, errorContext);
  
        case 403:
          if (message.toLowerCase().includes('rate limit')) {
            throw new RateLimitError(
              message || 'API rate limit exceeded', 
              error,
              errorContext
            );
          }
          throw new AuthenticationError(message, error, errorContext);
  
        case 404:
          throw new NotFoundError(message, error, errorContext);
  
        case 422:
          throw new ValidationError(message, error, {
            ...errorContext,
            validationErrors: error.response.data?.errors
          });
  
        case 409:
          throw new ResourceConflictError(message, error, errorContext);
  
        case 500:
        case 502:
        case 503:
        case 504:
          throw new ServerError(message, error, {
            ...errorContext,
            statusCode: status
          });
  
        default:
          throw new GitHubError(
            message || 'Unknown error',
            status,
            error,
            errorContext
          );
      }
    }
  
    // Handle Octokit errors without response but with status
    if (this.isOctokitError(error) && error.status) {
      if (error.status === 403 && error.message.toLowerCase().includes('rate limit')) {
        throw new RateLimitError(error.message, error, errorContext);
      }
      if (error.status === 401) {
        throw new AuthenticationError(error.message, error, errorContext);
      }
      throw new GitHubError(
        error.message,
        error.status,
        error,
        {
          ...errorContext,
          statusCode: error.status // Add status code here
        }
      );
    }
  
    // For remaining error types
    throw new ServerError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      error,
      {
        ...errorContext,
        statusCode: 500, // Add default status code here
        ...(typeof errorContext === 'object' && errorContext !== null ? errorContext : {})
      }
    );
  }

  async handleWebhookEvent(eventName: WebhookEventName, payload: WebhookEventPayload): Promise<void> {
    const context = { eventName, action: payload.action };
    
    try {
      switch (eventName) {
        case 'pull_request':
          if ('pull_request' in payload && !('review' in payload)) {
            await this.handlePullRequestEvent(payload as PullRequestWebhookPayload);
          } else {
            throw new ValidationError('Invalid pull request payload', null, context);
          }
          break;

        case 'pull_request_review':
          if ('review' in payload && 'pull_request' in payload) {
            await this.handlePullRequestReviewEvent(payload as ReviewWebhookPayload);
          } else {
            throw new ValidationError('Invalid pull request review payload', null, context);
          }
          break;

        case 'repository':
          if ('repository' in payload) {
            await this.handleRepositoryEvent(payload as RepositoryWebhookPayload);
          } else {
            throw new ValidationError('Invalid repository payload', null, context);
          }
          break;

        default:
          throw new ValidationError(`Unsupported event type: ${eventName}`, null, context);
      }
    } catch (error) {
      throw this.handleGitHubError(error as GitHubErrorType, context);
    }
  }

  private async handleRepositoryEvent(payload: RepositoryWebhookPayload): Promise<void> {
    const context = { 
      action: payload.action,
      repository: payload.repository?.full_name 
    };
  
    if (!payload.repository) {
      throw new ValidationError('Invalid repository data', null, context);
    }
  
    switch (payload.action) {
      case 'created':
        await this.handleRepositoryCreation(payload.repository);
        break;
  
      case 'deleted':
        await this.handleRepositoryDeletion(payload.repository.full_name);
        break;
  
      case 'publicized':
      case 'privatized':
        await this.handleVisibilityChange(payload.repository);
        break;
  
      default:
        throw new ValidationError(`Unsupported repository action: ${payload.action}`, null, context);
    }
  }

  private async handleRepositoryCreation(repository: RepositoryPayload): Promise<void> {
    const platform = await this.prisma.platform.findFirstOrThrow({
      where: { type: 'GITHUB' },
    });

    await this.prisma.repository.create({
      data: {
        name: repository.name,
        fullName: repository.full_name,
        private: repository.private,
        url: repository.html_url,
        platformId: platform.id,
      },
    });
  }

  private async handleRepositoryDeletion(fullName: string): Promise<void> {
    await this.prisma.repository.delete({
      where: {
        fullName,
      },
    });
  }

  private async handleVisibilityChange(repository: RepositoryPayload): Promise<void> {
    await this.prisma.repository.update({
      where: {
        fullName: repository.full_name,
      },
      data: {
        private: repository.private,
      },
    });
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const context = { owner, repo, action: 'get_repository' };

    try {
      if (!this.octokit?.rest?.repos) {
        throw new GitHubError('GitHub API client not properly initialized', 500, null, context);
      }
      return await this.getCached<Repository>('repository', { owner, repo }, async () => {
        const { data } = await this.retryWithBackoff(async () => {
          return await this.octokit.rest.repos.get({ owner, repo });
        });

        if (!data) {
          throw new ValidationError('Invalid response from GitHub API', null, context);
        }

        const platform = await this.prisma.platform.findFirstOrThrow({
          where: { type: 'GITHUB' },
        });

        await this.prisma.repository.upsert({
          where: {
            fullName: data.full_name,
          },
          create: {
            name: data.name,
            fullName: data.full_name,
            private: data.private,
            url: data.html_url,
            platformId: platform.id,
          },
          update: {
            name: data.name,
            private: data.private,
          },
        });

        return {
          id: data.id,
          name: data.name,
          fullName: data.full_name,
          description: data.description ?? '',
          private: data.private ?? false,
          defaultBranch: data.default_branch,
          language: data.language ?? '',
          stargazersCount: data.stargazers_count,
          forksCount: data.forks_count,
          settings: {
            id: `${data.id}-settings`,
            repositoryId: `${data.id}`,
            autoMergeEnabled: data.allow_auto_merge ?? false,
            requireApprovals: 1,
            protectedBranches: [data.default_branch],
            allowedMergeTypes: [
              ...(data.allow_merge_commit ? ['merge'] : []),
              ...(data.allow_squash_merge ? ['squash'] : []),
              ...(data.allow_rebase_merge ? ['rebase'] : []),
            ] as ('merge' | 'squash' | 'rebase')[], // Explicitly cast the array
            branchProtection: {},
          },
        };
      });
    } catch (error) {
      throw this.handleGitHubError(error as GitHubErrorType, context);
    }
  }


  async getPullRequestReviews(owner: string, repo: string, number: number): Promise<PullRequestReview[]> {
    const context = { owner, repo, number, action: 'get_pull_request_reviews' };

    try {
      return await this.getCached('pull_request_reviews', { owner, repo, number }, async () => {
        const { data } = await this.retryWithBackoff(async () => {
          return await this.octokit.rest.pulls.listReviews({
            owner,
            repo,
            pull_number: number,
          });
        });

        if (!data) {
          throw new ValidationError('Invalid response from GitHub API', null, context);
        }

        return data
          .filter(review => Boolean(
            review &&
            review.user?.login &&
            review.user?.avatar_url &&
            review.user?.type &&
            review.commit_id &&
            review.submitted_at &&
            review.state
          ))
          .map(review => {
            if (!review.user || !review.commit_id || !review.submitted_at) {
              throw new ValidationError(
                'Invalid review data structure', 
                { review }, 
                context
              );
            }

            return {
              id: review.id,
              user: {
                login: review.user.login,
                avatarUrl: review.user.avatar_url,
                type: review.user.type,
                role: 'REVIEWER',
              },
              body: review.body ?? null,
              state: review.state as PullRequestReview['state'],
              commitId: review.commit_id,
              submittedAt: review.submitted_at,
            };
          });
      });
    } catch (error) {
      throw this.handleGitHubError(error as GitHubErrorType, context);
    }
  }

  private mapMergeableState(state: string | undefined): 'mergeable' | 'conflicting' | 'unknown' {
    switch (state) {
      case 'clean':
        return 'mergeable';
      case 'dirty':
      case 'blocked':
      case 'unstable':
        return 'conflicting';
      default:
        return 'unknown';
    }
  }

  private async handlePullRequestEvent(payload: PullRequestWebhookPayload): Promise<void> {
    const pr = payload.pull_request;
    const repository = payload.repository;
    const action = payload.action;

    const context = { 
      action,
      pullRequestNumber: pr.number,
      repository: repository.full_name
    };

    try {
      switch (action) {
        case 'opened':
        case 'reopened':
        case 'edited':
        case 'synchronize':
          await this.prisma.pullRequest.upsert({
            where: {
              repositoryId_number: {
                repositoryId: repository.id.toString(),
                number: pr.number,
              },
            },
            create: {
              number: pr.number,
              title: pr.title,
              status: 'OPEN',
              repositoryId: repository.id.toString(),
              authorId: pr.user.login,
              baseBranch: pr.base?.ref ?? 'main',
              headBranch: pr.head?.ref ?? 'feature',
              isDraft: pr.draft,
              isReady: !pr.draft,
            },
            update: {
              title: pr.title,
              status: 'OPEN',
              isDraft: pr.draft,
              isReady: !pr.draft,
            },
          });
          break;

        case 'closed':
          await this.prisma.pullRequest.update({
            where: {
              repositoryId_number: {
                repositoryId: repository.id.toString(),
                number: pr.number,
              },
            },
            data: {
              status: pr.merged ? 'MERGED' : 'CLOSED',
              metadata: {
                mergedAt: pr.merged_at,
                merged: pr.merged,
              },
            },
          });
          break;

        default:
          throw new ValidationError(`Unsupported pull request action: ${action}`, null, context);
      }
    } catch (error) {
      throw this.handleGitHubError(error as GitHubErrorType, context);
    }
  }

  private async handlePullRequestReviewEvent(payload: ReviewWebhookPayload): Promise<void> {
    const { action, review, pull_request: pr } = payload;
    const context = {
      action,
      pullRequestNumber: pr.number,
      repository: payload.repository.full_name,
      reviewer: review.user?.login
    };
  
    try {
      switch (action) {
        case 'submitted':
          await this.prisma.review.create({
            data: {
              pullRequestId: pr.id.toString(),
              reviewerId: review.user.login,
              status: this.mapReviewState(review.state),
              body: review.body ?? '',
              submittedAt: review.submitted_at ? new Date(review.submitted_at) : new Date(),
            },
          });
          break;
  
        case 'dismissed':
          await this.prisma.review.updateMany({
            where: {
              pullRequestId: pr.id.toString(),
              reviewerId: review.user.login,
            },
            data: {
              status: ReviewStatus.DISMISSED,
            },
          });
          break;
  
        default:
          throw new ValidationError(`Unsupported review action: ${action}`, null, context);
      }
    } catch (error) {
      throw this.handleGitHubError(error as GitHubErrorType, context);
    }
  }

  private mapReviewState(state: string | null | undefined): ReviewStatus {
    const normalizedState = state?.toUpperCase();
    if (!state) {
      return ReviewStatus.PENDING;
    }
    switch (normalizedState) {
      case 'APPROVED':
        return ReviewStatus.APPROVED;
      case 'CHANGES_REQUESTED':
        return ReviewStatus.CHANGES_REQUESTED;
      case 'COMMENTED':
        return ReviewStatus.COMMENTED;
      case 'DISMISSED':
        return ReviewStatus.DISMISSED;
      case 'PENDING':
      default:
        return ReviewStatus.PENDING;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.cache.clear();
      await this.prisma.$disconnect();
    } catch (error) {
      throw this.handleGitHubError(error as GitHubErrorType, { action: 'destroy' });
    }
  }
}
