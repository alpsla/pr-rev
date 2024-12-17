export class GitHubError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly originalError?: unknown,
    public readonly context?: Record<string, unknown>,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'GitHubError';
    
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, GitHubError.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      context: this.context,
      data: this.data,
      stack: this.stack
    };
  }
}

export class RateLimitError extends GitHubError {
  constructor(
    message = 'API rate limit exceeded',
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 403, originalError, {
      ...context,
      errorType: 'rate_limit'
    });
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class AuthenticationError extends GitHubError {
  constructor(
    message = 'Bad credentials',
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 401, originalError, {
      ...context,
      errorType: 'authentication'
    });
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class NotFoundError extends GitHubError {
  constructor(
    message = 'Not Found',
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 404, originalError, {
      ...context,
      errorType: 'not_found'
    });
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class NetworkError extends GitHubError {
  constructor(
    message = 'Network error',
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 500, originalError, {
      ...context,
      errorType: 'network'
    });
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ServerError extends GitHubError {
  constructor(
    message: string,
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(
      message,
      context?.statusCode as number || 500,
      originalError,
      {
        errorType: 'server',
        ...(context || {})
      }
    );
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
export class ValidationError extends GitHubError {
  constructor(
    message = 'Validation Error',
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 422, originalError, {
      ...context,
      errorType: 'validation'
    });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ResourceConflictError extends GitHubError {
  constructor(
    message = 'Resource Conflict',
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 409, originalError, {
      ...context,
      errorType: 'conflict'
    });
    this.name = 'ResourceConflictError';
    Object.setPrototypeOf(this, ResourceConflictError.prototype);
  }
}

export class ApiQuotaExceededError extends GitHubError {
  constructor(
    message = 'Secondary rate limit exceeded',
    originalError?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 403, originalError, {
      ...context,
      errorType: 'secondary_rate_limit'
    });
    this.name = 'ApiQuotaExceededError';
    Object.setPrototypeOf(this, ApiQuotaExceededError.prototype);
  }
}
