export const errorTypeToStatusMap = {
  NotFoundError: 404,
  AuthenticationError: 401,
  RateLimitError: 403,
  NetworkError: 500,
  ServerError: 500
} as const;

export const errorTypeToMessageMap = {
  NotFoundError: 'Not Found',
  AuthenticationError: 'Bad credentials',
  RateLimitError: 'API rate limit exceeded',
  NetworkError: 'Network error',
  ServerError: 'Internal Server Error'
} as const;

export type ErrorType = keyof typeof errorTypeToStatusMap;

export const TEST_CONSTANTS = {
  OWNER: 'test-owner',
  REPO: 'test-repo',
  PR_NUMBER: 1,
  TOKEN: 'test-token',
  APP_ID: 'test-app-id',
  PRIVATE_KEY: 'test-private-key',
  INSTALLATION_ID: 'test-installation-id'
} as const;
