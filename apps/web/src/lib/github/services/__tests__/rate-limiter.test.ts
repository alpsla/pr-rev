import { RateLimiter } from '../rate-limiter';
import { prisma } from '../../../prisma';

// Create a type for our mocked Prisma client
type MockPrismaClient = {
  keyValueStore: {
    findUnique: jest.Mock;
    upsert: jest.Mock;
  };
  $disconnect: jest.Mock;
};

// Mock the Prisma client
jest.mock('../../../prisma', () => ({
  prisma: {
    keyValueStore: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    $disconnect: jest.fn()
  } as MockPrismaClient
}));

// Cast the mocked prisma client to our mock type
const mockPrisma = prisma as unknown as MockPrismaClient;

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  const userId = 'test-user';

  beforeEach(() => {
    jest.clearAllMocks();
    rateLimiter = new RateLimiter(userId);
  });

  afterEach(async () => {
    await rateLimiter.close();
  });

  describe('Rate Limiting', () => {
    it('should execute operation when rate limit is not exceeded', async () => {
      mockPrisma.keyValueStore.findUnique
        .mockResolvedValueOnce({ key: 'rate_limit:test-user', value: JSON.stringify({ remaining: 100, reset: Date.now() / 1000 + 3600, limit: 1000 }) })
        .mockResolvedValueOnce({ key: 'last_request:test-user', value: new Date(Date.now() - 2000).toISOString() });

      const operation = jest.fn().mockResolvedValue('success');
      const result = await rateLimiter.executeWithRateLimit(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should wait when rate limit is exceeded', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 1;
      mockPrisma.keyValueStore.findUnique
        .mockResolvedValueOnce({ key: 'rate_limit:test-user', value: JSON.stringify({ remaining: 0, reset: resetTime, limit: 1000 }) })
        .mockResolvedValueOnce({ key: 'last_request:test-user', value: new Date().toISOString() });

      const operation = jest.fn().mockResolvedValue('success');
      const startTime = Date.now();
      
      const result = await rateLimiter.executeWithRateLimit(operation);
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should enforce minimum delay between requests', async () => {
      mockPrisma.keyValueStore.findUnique
        .mockResolvedValueOnce({ key: 'rate_limit:test-user', value: JSON.stringify({ remaining: 100, reset: Date.now() / 1000 + 3600, limit: 1000 }) })
        .mockResolvedValueOnce({ key: 'last_request:test-user', value: new Date().toISOString() });

      const operation = jest.fn().mockResolvedValue('success');
      const startTime = Date.now();
      
      const result = await rateLimiter.executeWithRateLimit(operation);
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry operation on rate limit error', async () => {
      mockPrisma.keyValueStore.findUnique
        .mockResolvedValue({ key: 'rate_limit:test-user', value: JSON.stringify({ remaining: 100, reset: Date.now() / 1000 + 3600, limit: 1000 }) });

      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('rate limit exceeded'))
        .mockResolvedValueOnce('success');

      const result = await rateLimiter.executeWithRateLimit(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rate Limit Info', () => {
    it('should update rate limit info', async () => {
      const info = {
        remaining: 100,
        reset: Math.floor(Date.now() / 1000) + 3600,
        limit: 1000
      };

      await rateLimiter.updateRateLimit(info);

      expect(mockPrisma.keyValueStore.upsert).toHaveBeenCalledWith({
        where: { key: `rate_limit:${userId}` },
        update: { value: JSON.stringify(info) },
        create: { key: `rate_limit:${userId}`, value: JSON.stringify(info) }
      });
    });

    it('should handle missing rate limit info', async () => {
      mockPrisma.keyValueStore.findUnique.mockResolvedValue(null);

      const operation = jest.fn().mockResolvedValue('success');
      const result = await rateLimiter.executeWithRateLimit(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('should disconnect from database on close', async () => {
      await rateLimiter.close();
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});
