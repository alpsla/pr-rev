import { LLMError, LLMErrorCode } from '../types/error';
import { PRReport, RepositoryReport } from '../types/analysis';

export class ResponseValidator {
  static sanitizeResponse(response: string): string {
    try {
      // Remove any potential markdown code block markers
      response = response.replace(/```json\n?|\n?```/g, '');
      
      // Remove any leading/trailing whitespace
      response = response.trim();
      
      // Validate it's a valid JSON string
      JSON.parse(response);
      
      return response;
    } catch (error) {
      throw new LLMError(
        'Failed to sanitize LLM response',
        LLMErrorCode.InvalidResponse,
        error
      );
    }
  }

  static validatePRReport(data: unknown): PRReport {
    if (!this.isObject(data)) {
      throw new LLMError(
        'Invalid PR report format: expected an object',
        LLMErrorCode.InvalidResponse
      );
    }

    const report = data as Partial<PRReport>;

    if (typeof report.summary !== 'string') {
      throw new LLMError(
        'Invalid PR report: missing or invalid summary',
        LLMErrorCode.InvalidResponse
      );
    }

    if (!Array.isArray(report.suggestions)) {
      throw new LLMError(
        'Invalid PR report: missing or invalid suggestions array',
        LLMErrorCode.InvalidResponse
      );
    }

    if (!this.isObject(report.impact)) {
      throw new LLMError(
        'Invalid PR report: missing or invalid impact object',
        LLMErrorCode.InvalidResponse
      );
    }

    if (typeof report.reviewConfidence !== 'number') {
      throw new LLMError(
        'Invalid PR report: missing or invalid reviewConfidence',
        LLMErrorCode.InvalidResponse
      );
    }

    return report as PRReport;
  }

  static validateRepositoryReport(data: unknown): RepositoryReport {
    if (!this.isObject(data)) {
      throw new LLMError(
        'Invalid repository report format: expected an object',
        LLMErrorCode.InvalidResponse
      );
    }

    const report = data as Partial<RepositoryReport>;

    if (typeof report.summary !== 'string') {
      throw new LLMError(
        'Invalid repository report: missing or invalid summary',
        LLMErrorCode.InvalidResponse
      );
    }

    if (!this.isObject(report.codeQuality)) {
      throw new LLMError(
        'Invalid repository report: missing or invalid codeQuality object',
        LLMErrorCode.InvalidResponse
      );
    }

    if (!this.isObject(report.architecture)) {
      throw new LLMError(
        'Invalid repository report: missing or invalid architecture object',
        LLMErrorCode.InvalidResponse
      );
    }

    if (!Array.isArray(report.suggestions)) {
      throw new LLMError(
        'Invalid repository report: missing or invalid suggestions array',
        LLMErrorCode.InvalidResponse
      );
    }

    if (!this.isObject(report.dependencies)) {
      throw new LLMError(
        'Invalid repository report: missing or invalid dependencies object',
        LLMErrorCode.InvalidResponse
      );
    }

    if (typeof report.reviewConfidence !== 'number') {
      throw new LLMError(
        'Invalid repository report: missing or invalid reviewConfidence',
        LLMErrorCode.InvalidResponse
      );
    }

    return report as RepositoryReport;
  }

  private static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
