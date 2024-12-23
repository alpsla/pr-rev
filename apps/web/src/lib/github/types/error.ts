// src/lib/github/types/error.ts

export interface ErrorContext {
    action?: string;
    timestamp: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    statusCode?: number;
   }
   
   export class GitHubError extends Error {
    constructor(
      message: string,
      public status: number,
      public data?: unknown,
      public context?: ErrorContext
    ) {
      super(message);
      this.name = 'GitHubError';
    }
   }
   
   export class AuthenticationError extends GitHubError {
    constructor(
      message: string,
      originalError?: unknown,
      context?: ErrorContext
    ) {
      super(message, 401, originalError, context);
      this.name = 'AuthenticationError';
    }
   }
   
   export class RateLimitError extends GitHubError {
    constructor(
      message: string, 
      originalError?: unknown,
      context?: ErrorContext & {
        limit?: number;
        remaining?: number;
        reset?: number;
      }
    ) {
      super(message, 429, originalError, context);
      this.name = 'RateLimitError';
    }
   }
   
   export class NotFoundError extends GitHubError {
    constructor(
      message: string,
      originalError?: unknown,
      context?: ErrorContext
    ) {
      super(message, 404, originalError, context);
      this.name = 'NotFoundError';
    }
   }
   
   export class ValidationError extends GitHubError {
    constructor(
      message: string,
      originalError?: unknown,
      context?: ErrorContext & {
        validationErrors?: unknown[];
      }
    ) {
      super(message, 422, originalError, context);
      this.name = 'ValidationError';
    }
   }
   
   export class ServerError extends GitHubError {
    constructor(
      message: string,
      originalError?: unknown,
      context?: ErrorContext
    ) {
      super(message, 500, originalError, context);
      this.name = 'ServerError';
    }
   }
   
   export interface OctokitErrorResponse {
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
   
   export type GitHubErrorType = Error | OctokitErrorResponse;