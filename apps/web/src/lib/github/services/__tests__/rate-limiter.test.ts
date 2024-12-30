import { Octokit } from '@octokit/rest';
import { RateLimiter } from '../rate-limiter';

jest.mock('@octokit/rest');

type RateLimitResponse = {
  data: {
    resources: {
      core: {
        limit: number;
        remaining: number;
        reset: number;
      };
    };
  };
};

describe('RateLimiter', () => {
  let octokit: jest.Mocked<Octokit>;
  let rateLimiter: RateLimiter;
  let mockGet: jest.Mock<Promise<RateLimitResponse>>;
  let currentTime: number;
  let realDateNow: () => number;

  beforeEach(() => {
    jest.useFakeTimers();
    currentTime = 1000000000000; // Fixed timestamp
    realDateNow = Date.now;
    Date.now = jest.fn(() => currentTime);
    
    const resetTime = Math.floor(currentTime / 1000) + 3600;
    
    mockGet = jest.fn().mockResolvedValue({
      data: {
        resources: {
          core: {
            limit: 5000,
            remaining: 4999,
            reset: resetTime,
          },
        },
      },
    });

    octokit = {
      rateLimit: {
        get: mockGet,
      },
    } as unknown as jest.Mocked<Octokit>;

    rateLimiter = new RateLimiter(octokit);
  });

  afterEach(() => {
    if (rateLimiter) {
      rateLimiter.close();
    }
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
    Date.now = realDateNow;
  });

  describe('basic functionality', () => {
    it('should check rate limit on first request', async () => {
      await rateLimiter.checkRateLimit();
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should not check rate limit within 5 minutes of last check', async () => {
      await rateLimiter.checkRateLimit();
      await rateLimiter.checkRateLimit();
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should execute operation with rate limit check', async () => {
      const operation = jest.fn().mockResolvedValue('result');
      const result = await rateLimiter.executeWithRateLimit(operation);
      
      expect(result).toBe('result');
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should update rate limit', async () => {
      await rateLimiter.updateRateLimit();
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should throw error when closed', async () => {
      rateLimiter.close();
      await expect(rateLimiter.checkRateLimit()).rejects.toThrow('RateLimiter has been closed');
      await expect(rateLimiter.executeWithRateLimit(() => Promise.resolve())).rejects.toThrow('RateLimiter has been closed');
      expect(() => rateLimiter.getRemainingRequests()).toThrow('RateLimiter has been closed');
      expect(() => rateLimiter.getResetTime()).toThrow('RateLimiter has been closed');
    });
  });

  describe('rate limit handling', () => {
    beforeEach(() => {
      // Force rate limit check by advancing time by 5 minutes
      currentTime += 5 * 60 * 1000 + 1;
      jest.setSystemTime(currentTime);
      // Update Date.now mock
      Date.now = jest.fn(() => currentTime);
    });

    it('should throw error when rate limit is exceeded', async () => {
      const resetTime = Math.floor(currentTime / 1000) + 60;
      mockGet.mockResolvedValueOnce({
        data: {
          resources: {
            core: {
              limit: 5000,
              remaining: 0,
              reset: resetTime,
            },
          },
        },
      });

      await expect(rateLimiter.checkRateLimit()).rejects.toThrow('Rate limit exceeded');
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should retry operation when rate limit recovers', async () => {
      const resetTime = Math.floor(currentTime / 1000) + 60;
      
      // First call: Rate limit exceeded
      mockGet.mockResolvedValueOnce({
        data: {
          resources: {
            core: {
              limit: 5000,
              remaining: 0,
              reset: resetTime,
            },
          },
        },
      });

      // Second call: Rate limit recovered
      mockGet.mockResolvedValueOnce({
        data: {
          resources: {
            core: {
              limit: 5000,
              remaining: 5000,
              reset: resetTime + 3600,
            },
          },
        },
      });

      const operation = jest.fn().mockResolvedValue('result');
      const promise = rateLimiter.executeWithRateLimit(operation);

      // Advance time past reset
      currentTime += 61 * 1000;
      Date.now = jest.fn(() => currentTime);
      jest.advanceTimersByTime(61 * 1000);

      const result = await promise;
      expect(result).toBe('result');
      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries with rate limit error', async () => {
      const resetTime = Math.floor(currentTime / 1000) + 60;
      
      // Mock to always return 0 remaining
      mockGet.mockResolvedValue({
        data: {
          resources: {
            core: {
              limit: 5000,
              remaining: 0,
              reset: resetTime,
            },
          },
        },
      });

      const operation = jest.fn().mockResolvedValue('success');
      await expect(rateLimiter.executeWithRateLimit(operation, 0))
        .rejects.toThrow('Rate limit exceeded after max retries');

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(operation).not.toHaveBeenCalled();
    });

    it('should handle gradually decreasing rate limits', async () => {
      const resetTime = Math.floor(currentTime / 1000) + 3600;
      
      // First operation: 2 remaining
      mockGet.mockResolvedValueOnce({
        data: {
          resources: {
            core: {
              limit: 5000,
              remaining: 2,
              reset: resetTime,
            },
          },
        },
      });

      const operation1 = jest.fn().mockResolvedValue('result1');
      await expect(rateLimiter.executeWithRateLimit(operation1)).resolves.toBe('result1');
      expect(operation1).toHaveBeenCalledTimes(1);

      // Force rate limit check by advancing time
      currentTime += 5 * 60 * 1000 + 1;
      jest.setSystemTime(currentTime);
      Date.now = jest.fn(() => currentTime);

      // Second operation: 1 remaining
      mockGet.mockResolvedValueOnce({
        data: {
          resources: {
            core: {
              limit: 5000,
              remaining: 1,
              reset: resetTime,
            },
          },
        },
      });

      const operation2 = jest.fn().mockResolvedValue('result2');
      await expect(rateLimiter.executeWithRateLimit(operation2)).resolves.toBe('result2');
      expect(operation2).toHaveBeenCalledTimes(1);

      // Force rate limit check by advancing time
      currentTime += 5 * 60 * 1000 + 1;
      jest.setSystemTime(currentTime);
      Date.now = jest.fn(() => currentTime);

      // Third operation: 0 remaining
      mockGet.mockResolvedValueOnce({
        data: {
          resources: {
            core: {
              limit: 5000,
              remaining: 0,
              reset: resetTime,
            },
          },
        },
      });

      const operation3 = jest.fn().mockResolvedValue('result3');
      await expect(rateLimiter.executeWithRateLimit(operation3, 0))
        .rejects.toThrow('Rate limit exceeded after max retries');
      expect(operation3).not.toHaveBeenCalled();

      expect(mockGet).toHaveBeenCalledTimes(4); // Initial check + 3 operation checks
    });
  });
});
