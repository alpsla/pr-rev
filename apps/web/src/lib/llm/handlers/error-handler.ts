import { LLMError, LLMErrorCode, ErrorMetadata } from '../types/error';

interface APIError extends Error {
  status?: number;
  statusText?: string;
  ok?: boolean;
}

export class ErrorHandler {
  static logError(error: Error, metadata: ErrorMetadata = {}) {
    const errorLog = {
      name: error.name,
      code: error instanceof LLMError ? error.code : LLMErrorCode.UnexpectedError,
      message: error.message,
      metadata,
      cause: error.cause || {}
    };

    console.error('LLM Error:', JSON.stringify(errorLog, null, 2));
  }

  static handleAPIError(error: APIError | Error, metadata: ErrorMetadata = {}) {
    let llmError: LLMError;

    if (error instanceof LLMError) {
      this.logError(error, metadata);
      throw error;
    }

    // Handle rate limit errors
    if (
      (error as APIError).status === 429 ||
      error.message?.toLowerCase().includes('rate limit')
    ) {
      llmError = new LLMError(
        'API rate limit exceeded',
        LLMErrorCode.RateLimitExceeded,
        error,
        metadata
      );
    }
    // Handle non-200 responses
    else if ((error as APIError).status && (error as APIError).status !== 200) {
      const apiError = error as APIError;
      llmError = new LLMError(
        `LLM API error: ${apiError.status} ${apiError.statusText || ''}`,
        LLMErrorCode.APIError,
        error,
        metadata
      );
    }
    // Handle JSON parsing errors
    else if (error instanceof SyntaxError && error.message.includes('JSON')) {
      llmError = new LLMError(
        'Invalid JSON response from LLM API',
        LLMErrorCode.InvalidResponse,
        error,
        metadata
      );
    }
    // Handle network errors
    else if (error.message?.toLowerCase().includes('network')) {
      llmError = new LLMError(
        'Network error while calling LLM API',
        LLMErrorCode.NetworkError,
        error,
        metadata
      );
    }
    // For unknown errors
    else {
      llmError = new LLMError(
        error.message || 'An unexpected error occurred while calling LLM service',
        LLMErrorCode.UnexpectedError,
        error,
        metadata
      );
    }

    this.logError(llmError, metadata);
    throw llmError;
  }

  static isRetryable = LLMError.isRetryable;
  static getRetryDelay = LLMError.getRetryDelay;
}
