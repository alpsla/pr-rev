import { PRAnalysis } from '../github/types/pr-analysis';
import { PromptManager, PromptContext } from './prompts/code-review/manager';
import { ResponseValidator } from './validators/response-validator';
import { ErrorHandler, ErrorMetadata, LLMError } from './handlers/error-handler';

export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface PRReport {
  impact: {
    score: number;
    analysis: string;
  };
  codeQuality: {
    score: number;
    analysis: string;
    suggestions: string[];
  };
  testing: {
    coverage: number;
    analysis: string;
    suggestions: string[];
  };
  documentation: {
    score: number;
    analysis: string;
    suggestions: string[];
  };
  samples: {
    improvements: Array<{
      file: string;
      code: string;
      explanation: string;
    }>;
  };
}

export interface RepositoryReport {
  codeQuality: {
    score: number;
    analysis: string;
    recommendations: string[];
  };
  security: {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  };
  performance: {
    score: number;
    analysis: string;
    recommendations: string[];
  };
}

export class LLMService {
  private baseUrl = 'https://api.anthropic.com/v1/messages';
  private config: Required<LLMConfig>;

  constructor(config: LLMConfig) {
    this.config = {
      ...config,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000
    };
  }

  async generatePRReport(
    analysis: PRAnalysis,
    context: PromptContext
  ): Promise<PRReport> {
    try {
      // Validate context before generating prompt
      PromptManager.validateContext(context);

      // Generate language-specific prompt
      const prompt = await PromptManager.generatePromptWithRetry(
        analysis,
        context,
        this.config.retryAttempts
      );

      // Call LLM with retry logic
      const response = await this.callLLMWithRetry(prompt);

      // Sanitize and validate response
      const sanitizedResponse = ResponseValidator.sanitizeResponse(response);
      return ResponseValidator.validatePRReport(JSON.parse(sanitizedResponse));
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      ErrorHandler.handleAPIError(error, this.createErrorMetadata());
    }
  }

  async generateRepositoryReport(
    analysis: {
      metrics: {
        stars: number;
        forks: number;
        issues: number;
        watchers: number;
      };
      techStack: string[];
    },
    context: PromptContext
  ): Promise<RepositoryReport> {
    try {
      // Validate context
      PromptManager.validateContext(context);

      // Generate prompt
      const prompt = await PromptManager.generatePromptWithRetry(
        { type: 'repository', ...analysis },
        context,
        this.config.retryAttempts
      );

      // Call LLM with retry logic
      const response = await this.callLLMWithRetry(prompt);

      // Sanitize and validate response
      const sanitizedResponse = ResponseValidator.sanitizeResponse(response);
      return ResponseValidator.validateRepositoryReport(JSON.parse(sanitizedResponse));
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      ErrorHandler.handleAPIError(error, this.createErrorMetadata());
    }
  }

  private async callLLMWithRetry(prompt: string, attempt: number = 1): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      const metadata = this.createErrorMetadata(attempt);

      if (attempt >= this.config.retryAttempts) {
        ErrorHandler.handleAPIError(error, metadata);
      }

      if (error instanceof Response && ErrorHandler.isRetryable(error)) {
        const delay = ErrorHandler.getRetryDelay(error as LLMError, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callLLMWithRetry(prompt, attempt + 1);
      }

      ErrorHandler.handleAPIError(error, metadata);
    }
  }

  private createErrorMetadata(attempt?: number): ErrorMetadata {
    return {
      timestamp: new Date().toISOString(),
      model: this.config.model,
      retryCount: attempt,
      requestId: crypto.randomUUID()
    };
  }

  // Backward compatibility methods
  async analyzePR(analysis: PRAnalysis, context: PromptContext): Promise<PRReport> {
    return this.generatePRReport(analysis, context);
  }

  async analyzeRepository(
    analysis: {
      metrics: {
        stars: number;
        forks: number;
        issues: number;
        watchers: number;
      };
      techStack: string[];
    },
    context: PromptContext
  ): Promise<RepositoryReport> {
    return this.generateRepositoryReport(analysis, context);
  }
}
