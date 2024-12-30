import { LLMError, LLMErrorCode } from '../types/error';
import { PRReport } from '../types/analysis';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validatePRAnalysisResponse(response: unknown): PRReport {
  if (!isObject(response)) {
    throw new LLMError(
      'Invalid PR analysis response format',
      LLMErrorCode.InvalidResponse
    );
  }

  const analysis = response as Partial<PRReport>;

  // Validate summary
  if (typeof analysis.summary !== 'string' || !analysis.summary) {
    throw new LLMError(
      'Missing or invalid summary',
      LLMErrorCode.InvalidResponse
    );
  }

  // Validate code quality
  if (!isObject(analysis.codeQuality)) {
    throw new LLMError(
      'Missing or invalid code quality analysis',
      LLMErrorCode.InvalidResponse
    );
  }

  if (
    typeof analysis.codeQuality.score !== 'number' ||
    typeof analysis.codeQuality.testCoverage !== 'number' ||
    typeof analysis.codeQuality.documentation !== 'number' ||
    typeof analysis.codeQuality.maintainability !== 'number' ||
    !Array.isArray(analysis.codeQuality.organization)
  ) {
    throw new LLMError(
      'Invalid code quality metrics',
      LLMErrorCode.InvalidResponse
    );
  }

  // Validate security
  if (!isObject(analysis.security)) {
    throw new LLMError(
      'Missing or invalid security analysis',
      LLMErrorCode.InvalidResponse
    );
  }

  if (
    !Array.isArray(analysis.security.vulnerabilities) ||
    typeof analysis.security.score !== 'number'
  ) {
    throw new LLMError(
      'Invalid security metrics',
      LLMErrorCode.InvalidResponse
    );
  }

  // Validate workflow
  if (!isObject(analysis.workflow)) {
    throw new LLMError(
      'Missing or invalid workflow analysis',
      LLMErrorCode.InvalidResponse
    );
  }

  if (!Array.isArray(analysis.workflow.commitPatterns)) {
    throw new LLMError(
      'Invalid workflow metrics',
      LLMErrorCode.InvalidResponse
    );
  }

  // Validate suggestions
  if (!Array.isArray(analysis.suggestions)) {
    throw new LLMError(
      'Missing or invalid suggestions',
      LLMErrorCode.InvalidResponse
    );
  }

  // Validate impact
  if (!isObject(analysis.impact)) {
    throw new LLMError(
      'Missing or invalid impact analysis',
      LLMErrorCode.InvalidResponse
    );
  }

  if (
    typeof analysis.impact.complexity !== 'number' ||
    typeof analysis.impact.coverage !== 'number' ||
    typeof analysis.impact.security !== 'number'
  ) {
    throw new LLMError(
      'Invalid impact metrics',
      LLMErrorCode.InvalidResponse
    );
  }

  // Validate review confidence
  if (typeof analysis.reviewConfidence !== 'number') {
    throw new LLMError(
      'Missing or invalid review confidence',
      LLMErrorCode.InvalidResponse
    );
  }

  return analysis as PRReport;
}
