export enum LLMErrorCode {
  UnexpectedError = 'UNEXPECTED_ERROR',
  RateLimitExceeded = 'RATE_LIMIT_EXCEEDED',
  APIError = 'API_ERROR',
  InvalidResponse = 'INVALID_RESPONSE',
  NetworkError = 'NETWORK_ERROR'
}

export interface ErrorMetadata {
  timestamp: string;
  model?: string;
  retryCount?: number;
  requestId?: string;
  [key: string]: string | number | boolean | undefined;
}

export class LLMError extends Error {
  readonly code: LLMErrorCode;
  readonly metadata?: ErrorMetadata;

  constructor(
    message: string,
    code: LLMErrorCode = LLMErrorCode.UnexpectedError,
    cause?: unknown,
    metadata?: ErrorMetadata
  ) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
    this.cause = cause;
    this.metadata = metadata;
  }

  static isRetryable(error: Error): boolean {
    if (!(error instanceof LLMError)) {
      return false;
    }

    return [
      LLMErrorCode.RateLimitExceeded,
      LLMErrorCode.NetworkError,
      LLMErrorCode.APIError
    ].includes(error.code);
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter: (2^n * 1000) + random(0-1000)ms
    return Math.min(Math.pow(2, attempt) * 1000 + Math.random() * 1000, 10000);
  }
}
