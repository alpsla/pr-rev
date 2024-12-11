import { PrismaClient, ReviewStatus } from '@prisma/client';
import type { Octokit } from '@octokit/rest';
import type { WebhookEventName, WebhookEventPayload, PullRequestWebhookPayload, PullRequestReviewWebhookPayload } from './__tests__/utils/mock-types';
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
  ApiQuotaExceededError 
} from './errors';

// ... (keep all existing type definitions and imports unchanged)

export class GitHubService implements IGitHubService {
  // ... (keep all existing properties and methods before retryWithBackoff unchanged)

  private async retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
    await this.checkRateLimit();

    try {
      const result = await operation();
      this.retryCount = 0; // Reset count on success
      return result;
    } catch (error) {
      const isRateLimitError = 
        error instanceof RateLimitError ||
        (error as OctokitErrorResponse)?.response?.status === 403 &&
        ((error as OctokitErrorResponse)?.response?.data?.message?.toLowerCase().includes('rate limit') ||
         (error as OctokitErrorResponse)?.response?.headers?.['x-ratelimit-remaining'] === '0');

      const isNetworkError = 
        'code' in error && 
        ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'].includes(error.code as string);

      const isServerError = 
        (error as OctokitErrorResponse)?.response?.status >= 500;

      const isRetryableError = isRateLimitError || isNetworkError || isServerError;

      if (isRetryableError && this.retryCount < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[this.retryCount++];
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(operation);
      }

      this.retryCount = 0; // Reset count on non-retryable errors
      throw this.handleGitHubError(error as GitHubErrorType);
    }
  }

  private handleGitHubError(error: GitHubErrorType, context?: Record<string, unknown>): never {
    const errorContext = {
      ...context,
      timestamp: new Date().toISOString(),
      requestId: (error as OctokitErrorResponse).request?.id,
      endpoint: (error as OctokitErrorResponse).request?.url,
      method: (error as OctokitErrorResponse).request?.method,
      headers: (error as OctokitErrorResponse).response?.headers,
    };

    // Handle network errors first
    if ('code' in error && error.code) {
      const networkErrorCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'];
      if (networkErrorCodes.includes(error.code)) {
        throw new NetworkError(error.message || 'Network error occurred', error, {
          ...errorContext,
          code: error.code
        });
      }
    }

    // Handle errors with response
    if ('response' in error && error.response) {
      const { status, data, headers } = error.response;
      const message = data?.message || error.message;

      // Handle rate limit errors
      if (status === 403 && (
        message.toLowerCase().includes('rate limit') ||
        headers?.['x-ratelimit-remaining'] === '0'
      )) {
        const rateLimitHeaders = {
          limit: headers?.['x-ratelimit-limit'],
          remaining: headers?.['x-ratelimit-remaining'],
          reset: headers?.['x-ratelimit-reset'],
          retryAfter: headers?.['retry-after']
        };

        if (message.toLowerCase().includes('secondary rate limit')) {
          throw new ApiQuotaExceededError(message, error, {
            ...errorContext,
            ...rateLimitHeaders
          });
        }
        throw new RateLimitError(message, error, {
          ...errorContext,
          ...rateLimitHeaders
        });
      }

      // Map status codes to specific errors
      switch (status) {
        case 400:
          throw new ValidationError(message, error, {
            ...errorContext,
            data: data
          });
        case 401:
          throw new AuthenticationError(message, error, errorContext);
        case 403:
          // Only handle non-rate-limit 403s as auth errors
          if (!message.toLowerCase().includes('rate limit')) {
            throw new AuthenticationError(message, error, errorContext);
          }
          // Let rate limit errors fall through to default case
          break;
        case 404:
          throw new NotFoundError(message, error, errorContext);
        case 409:
          throw new ResourceConflictError(message, error, {
            ...errorContext,
            data: data
          });
        case 422:
          throw new ValidationError(message, error, {
            ...errorContext,
            validationErrors: data?.errors,
            data: data
          });
        case 500:
        case 502:
        case 503:
        case 504:
          throw new ServerError(message, error, {
            ...errorContext,
            statusCode: status
          });
      }

      // For any other status codes, preserve the original status
      throw new GitHubError(
        message,
        status,
        error,
        errorContext,
        data
      );
    }

    // For network errors without response
    if (error instanceof Error && error.message.toLowerCase().includes('network')) {
      throw new NetworkError(error.message, error, errorContext);
    }

    // For unknown errors or errors without response
    throw new ServerError(
      error.message || 'Unknown error occurred',
      error,
      errorContext
    );
  }

  // ... (keep all existing methods after handleGitHubError unchanged)
}
