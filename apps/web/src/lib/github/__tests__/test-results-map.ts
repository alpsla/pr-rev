import type { TestResult, TestStats } from './types';
import { 
  RateLimitError, 
  NotFoundError, 
  AuthenticationError, 
  NetworkError, 
  ServerError 
} from '../errors';

export const previouslyPassingTests: TestResult[] = [
  // Caching Tests
  { name: 'should cache repository data', status: 'passed' },
  { name: 'should clear cache on destroy', status: 'passed' },
  
  // Basic Rate Limit Tests
  { name: 'should respect rate limits', status: 'passed' },
  { name: 'should handle network errors', status: 'passed' },
  
  // Data Transformation Tests
  { name: 'should transform repository data correctly', status: 'passed' },
  { name: 'should transform pull request data correctly', status: 'passed' },
  
  // Basic Operations
  { name: 'can fetch repository details', status: 'passed' },
  { name: 'can get pull request details', status: 'passed' },
  
  // Contract Tests
  { name: 'should match expected repository structure', status: 'passed' },
  { name: 'should match expected pull request structure', status: 'passed' }
];

export const errorScenarios: TestResult[] = [
  {
    name: 'should handle repository not found',
    status: 'failed',
    errorType: 'NotFoundError',
    expectedStatus: 404,
    expectedMessage: new NotFoundError().message
  },
  {
    name: 'should handle authentication errors',
    status: 'failed',
    errorType: 'AuthenticationError',
    expectedStatus: 401,
    expectedMessage: new AuthenticationError().message
  },
  {
    name: 'should handle rate limit errors',
    status: 'failed',
    errorType: 'RateLimitError',
    expectedStatus: 403,
    expectedMessage: new RateLimitError().message
  },
  {
    name: 'should handle network errors',
    status: 'failed',
    errorType: 'NetworkError',
    expectedStatus: 500,
    expectedMessage: new NetworkError().message
  },
  {
    name: 'should handle server errors',
    status: 'failed',
    errorType: 'ServerError',
    expectedStatus: 500,
    expectedMessage: new ServerError().message
  }
];

// Helper function to track test results
export function trackTestResult(testName: string, passed: boolean): void {
  const allTests = [...previouslyPassingTests, ...errorScenarios];
  const test = allTests.find(t => t.name === testName);
  
  if (test) {
    test.status = passed ? 'passed' : 'failed';
    console.log(`Test "${testName}": ${passed ? 'PASSED' : 'FAILED'}`);
    
    if (!passed) {
      const scenario = errorScenarios.find(s => s.name === testName);
      if (scenario) {
        console.log(`Expected: status=${scenario.expectedStatus}, message="${scenario.expectedMessage}"`);
      }
    }
  }
}

// Helper function to get test statistics
export function getTestStats(): TestStats {
  const allTests = [...previouslyPassingTests, ...errorScenarios];
  const passed = allTests.filter(t => t.status === 'passed').length;
  const total = allTests.length;
  
  return {
    passed,
    failed: total - passed,
    total
  };
}

// Helper function to check if an error matches expected error type
export function isExpectedError(error: unknown, errorType: string): boolean {
  switch (errorType) {
    case 'NotFoundError':
      return error instanceof NotFoundError;
    case 'AuthenticationError':
      return error instanceof AuthenticationError;
    case 'RateLimitError':
      return error instanceof RateLimitError;
    case 'NetworkError':
      return error instanceof NetworkError;
    case 'ServerError':
      return error instanceof ServerError;
    default:
      return false;
  }
}
