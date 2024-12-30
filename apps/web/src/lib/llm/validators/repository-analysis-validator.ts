import { LLMError, LLMErrorCode } from '../types/error';
import { LLMAnalysisResponse } from '../../github/types/github-api';

export function validateRepositoryAnalysisResponse(response: unknown): LLMAnalysisResponse {
  if (!isObject(response)) {
    throw new LLMError(
      'Invalid analysis response format',
      LLMErrorCode.InvalidResponse
    );
  }

  const analysis = response as Partial<LLMAnalysisResponse>;

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
    typeof analysis.codeQuality.maintainability !== 'number'
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

  // Validate dependencies
  if (!isObject(analysis.dependencies)) {
    throw new LLMError(
      'Missing or invalid dependency analysis',
      LLMErrorCode.InvalidResponse
    );
  }

  if (
    typeof analysis.dependencies.total !== 'number' ||
    !Array.isArray(analysis.dependencies.outdated) ||
    !Array.isArray(analysis.dependencies.vulnerable) ||
    typeof analysis.dependencies.direct !== 'number' ||
    typeof analysis.dependencies.dev !== 'number'
  ) {
    throw new LLMError(
      'Invalid dependency metrics',
      LLMErrorCode.InvalidResponse
    );
  }

  return analysis as LLMAnalysisResponse;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
