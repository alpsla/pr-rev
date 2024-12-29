export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: LLMErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export enum LLMErrorCode {
  // API Errors
  RateLimit = 'RATE_LIMIT',
  InvalidAPIKey = 'INVALID_API_KEY',
  NetworkError = 'NETWORK_ERROR',
  Timeout = 'TIMEOUT',
  ServerError = 'SERVER_ERROR',

  // Validation Errors
  InvalidResponse = 'INVALID_RESPONSE',
  MalformedJSON = 'MALFORMED_JSON',
  ValidationError = 'VALIDATION_ERROR',

  // Context Errors
  InvalidContext = 'INVALID_CONTEXT',
  MissingData = 'MISSING_DATA',
  UnsupportedLanguage = 'UNSUPPORTED_LANGUAGE',

  // Runtime Errors
  PromptGenerationError = 'PROMPT_GENERATION_ERROR',
  ResponseParsingError = 'RESPONSE_PARSING_ERROR',
  UnexpectedError = 'UNEXPECTED_ERROR'
}

export interface ErrorMetadata {
  timestamp: string;
  requestId?: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  retryCount?: number;
}

export class ErrorHandler {
  static handleAPIError(error: unknown, metadata?: ErrorMetadata): never {
    let llmError: LLMError;

    if (error instanceof Response) {
      switch (error.status) {
        case 429:
          llmError = new LLMError(
            'Rate limit exceeded. Please try again later.',
            LLMErrorCode.RateLimit,
            error
          );
          break;
        case 401:
          llmError = new LLMError(
            'Invalid API key or authentication error.',
            LLMErrorCode.InvalidAPIKey,
            error
          );
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          llmError = new LLMError(
            'LLM service is currently unavailable.',
            LLMErrorCode.ServerError,
            error
          );
          break;
        default:
          llmError = new LLMError(
            `API request failed with status ${error.status}`,
            LLMErrorCode.UnexpectedError,
            error
          );
          break;
      }
    } else if (error instanceof TypeError && error.message.includes('network')) {
      llmError = new LLMError(
        'Network error occurred while calling LLM service.',
        LLMErrorCode.NetworkError,
        error
      );
    } else if (error instanceof Error && error.message.includes('timeout')) {
      llmError = new LLMError(
        'Request to LLM service timed out.',
        LLMErrorCode.Timeout,
        error
      );
    } else {
      // For unknown errors
      llmError = new LLMError(
        'An unexpected error occurred while calling LLM service.',
        LLMErrorCode.UnexpectedError,
        error
      );
    }

    // Log error with metadata before throwing
    this.logError(llmError, metadata);
    throw llmError;
  }

  static handleValidationError(error: unknown, context?: string): never {
    const baseMessage = context ? `Validation error in ${context}: ` : 'Validation error: ';

    if (error instanceof SyntaxError) {
      throw new LLMError(
        `${baseMessage}Invalid JSON response`,
        LLMErrorCode.MalformedJSON,
        error
      );
    }

    if (error instanceof Error) {
      throw new LLMError(
        `${baseMessage}${error.message}`,
        LLMErrorCode.ValidationError,
        error
      );
    }

    throw new LLMError(
      `${baseMessage}Unknown validation error`,
      LLMErrorCode.ValidationError,
      error
    );
  }

  static handlePromptError(error: unknown, language?: string): never {
    if (language) {
      throw new LLMError(
        `Failed to generate prompt for language: ${language}`,
        LLMErrorCode.UnsupportedLanguage,
        error
      );
    }

    throw new LLMError(
      'Failed to generate prompt',
      LLMErrorCode.PromptGenerationError,
      error
    );
  }

  static handleContextError(error: unknown, context?: string): never {
    const baseMessage = context ? `Context error in ${context}: ` : 'Context error: ';

    throw new LLMError(
      `${baseMessage}${error instanceof Error ? error.message : 'Invalid context'}`,
      LLMErrorCode.InvalidContext,
      error
    );
  }

  static isRetryable(error: unknown): boolean {
    if (error instanceof LLMError) {
      return [
        LLMErrorCode.NetworkError,
        LLMErrorCode.Timeout,
        LLMErrorCode.ServerError,
        LLMErrorCode.RateLimit
      ].includes(error.code);
    }
    return false;
  }

  static getRetryDelay(error: LLMError, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 32000; // 32 seconds

    switch (error.code) {
      case LLMErrorCode.RateLimit:
        // Exponential backoff with jitter for rate limits
        return Math.min(
          maxDelay,
          Math.floor(Math.random() * Math.pow(2, attempt) * baseDelay)
        );
      case LLMErrorCode.ServerError:
        // Linear backoff for server errors
        return Math.min(maxDelay, attempt * baseDelay);
      default:
        // Default exponential backoff
        return Math.min(maxDelay, Math.pow(2, attempt) * baseDelay);
    }
  }

  static logError(error: LLMError, metadata?: ErrorMetadata): void {
    const errorLog = {
      name: error.name,
      code: error.code,
      message: error.message,
      metadata: {
        ...metadata,
        timestamp: metadata?.timestamp || new Date().toISOString()
      },
      cause: error.cause
    };

    console.error('LLM Error:', JSON.stringify(errorLog, null, 2));
  }
}
