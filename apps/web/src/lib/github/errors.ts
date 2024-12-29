export class GitHubError extends Error {
  constructor(
    message: string,
    public status?: number,
    public originalError?: unknown,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

export class NotFoundError extends GitHubError {
  constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
    super(message, 404, originalError, context);
    this.name = 'NotFoundError';
  }
}

export class AuthenticationError extends GitHubError {
  constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
    super(message, 401, originalError, context);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends GitHubError {
  constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
    super(message, 429, originalError, context);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends GitHubError {
  constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
    super(message, 0, originalError, context);
    this.name = 'NetworkError';
  }
}

export class ServerError extends GitHubError {
  constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
    super(message, 500, originalError, context);
    this.name = 'ServerError';
  }
}

export class ValidationError extends GitHubError {
  constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
    super(message, 422, originalError, context);
    this.name = 'ValidationError';
  }
}

export class ResourceConflictError extends GitHubError {
  constructor(message: string, originalError?: unknown, context?: Record<string, unknown>) {
    super(message, 409, originalError, context);
    this.name = 'ResourceConflictError';
  }
}
