import { createTestConfig, createMockResponse, createRateLimitResponse, TEST_OWNER, TEST_REPO } from './test-helpers';

describe('Test Helpers', () => {
  describe('createTestConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should use environment variables when available', () => {
      process.env.GITHUB_APP_ID = 'env-app-id';
      process.env.GITHUB_APP_PRIVATE_KEY = 'env-private-key';
      process.env.GITHUB_CLIENT_ID = 'env-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'env-client-secret';

      const config = createTestConfig();
      expect(config).toEqual({
        appId: 'env-app-id',
        privateKey: 'env-private-key',
        clientId: 'env-client-id',
        clientSecret: 'env-client-secret',
      });
    });

    it('should use default values when environment variables are not set', () => {
      delete process.env.GITHUB_APP_ID;
      delete process.env.GITHUB_APP_PRIVATE_KEY;
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;

      const config = createTestConfig();
      expect(config).toEqual({
        appId: 'test-app-id',
        privateKey: 'test-private-key',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      });
    });
  });

  describe('createMockResponse', () => {
    it('should create a mock response with provided data', () => {
      const testData = { foo: 'bar' };
      const response = createMockResponse(testData);

      expect(response).toEqual({
        data: testData,
        status: 200,
        headers: {},
      });
    });

    it('should handle different data types', () => {
      expect(createMockResponse('string')).toEqual({
        data: 'string',
        status: 200,
        headers: {},
      });

      expect(createMockResponse(123)).toEqual({
        data: 123,
        status: 200,
        headers: {},
      });

      expect(createMockResponse(null)).toEqual({
        data: null,
        status: 200,
        headers: {},
      });
    });
  });

  describe('createRateLimitResponse', () => {
    it('should create a rate limit response with correct structure', () => {
      const response = createRateLimitResponse();

      expect(response).toHaveProperty('data.resources.core');
      expect(response.data.resources.core).toHaveProperty('limit', 5000);
      expect(response.data.resources.core).toHaveProperty('remaining', 4999);
      expect(response.data.resources.core).toHaveProperty('reset');
      expect(response.status).toBe(200);
      expect(response.headers).toEqual({});
    });

    it('should set reset time in the future', () => {
      const response = createRateLimitResponse();
      const now = Date.now();
      expect(response.data.resources.core.reset).toBeGreaterThan(now);
    });
  });

  describe('constants', () => {
    it('should export TEST_OWNER and TEST_REPO constants', () => {
      expect(TEST_OWNER).toBe('test-owner');
      expect(TEST_REPO).toBe('test-repo');
    });
  });
});
