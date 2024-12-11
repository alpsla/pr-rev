export class GitHubError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'GitHubError';
    
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, GitHubError.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      data: this.data
    };
  }
}

export class RateLimitError extends GitHubError {
  constructor(message = 'API rate limit exceeded', data?: unknown) {
    super(message, 403, data);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends GitHubError {
  constructor(message = 'Bad credentials', data?: unknown) {
    super(message, 401, data);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends GitHubError {
  constructor(message = 'Not Found', data?: unknown) {
    super(message, 404, data);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends GitHubError {
  constructor(message = 'Network error', data?: unknown) {
    super(message, 500, data);
    this.name = 'NetworkError';
  }
}

export class ServerError extends GitHubError {
  constructor(message = 'Internal Server Error', data?: unknown) {
    super(message, 500, data);
    this.name = 'ServerError';
  }
}
