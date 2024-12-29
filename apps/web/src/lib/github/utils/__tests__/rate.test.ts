import { RateLimit } from '../rate';

describe('RateLimit', () => {
  let rateLimit: RateLimit;
  const maxRequests = 3;
  const windowMs = 1000; // 1 second

  beforeEach(() => {
    jest.useFakeTimers();
    rateLimit = new RateLimit({ maxRequests, windowMs });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic rate limiting', () => {
    it('should allow requests within limit', async () => {
      // First request should be allowed
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Second request should be allowed
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Third request should be allowed (at max)
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Fourth request should be denied (exceeds max)
      expect(await rateLimit.checkLimit()).toBe(false);
    });

    it('should reset after window period', async () => {
      // Fill up the limit
      await rateLimit.checkLimit();
      await rateLimit.checkLimit();
      await rateLimit.checkLimit();
      
      // Verify we're at the limit
      expect(await rateLimit.checkLimit()).toBe(false);
      
      // Advance time past window
      jest.advanceTimersByTime(windowMs);
      
      // Should allow requests again
      expect(await rateLimit.checkLimit()).toBe(true);
    });
  });

  describe('window behavior', () => {
    it('should clear old timestamps', async () => {
      // Make some requests
      await rateLimit.checkLimit();
      
      // Advance time partially through window
      jest.advanceTimersByTime(windowMs / 2);
      
      await rateLimit.checkLimit();
      
      // Advance time past window for first request
      jest.advanceTimersByTime(windowMs / 2 + 1);
      
      // Should have cleared first timestamp, allowing another request
      expect(await rateLimit.checkLimit()).toBe(true);
    });

    it('should maintain rolling window', async () => {
      // Fill up the limit
      await rateLimit.checkLimit(); // t=0
      await rateLimit.checkLimit(); // t=0
      await rateLimit.checkLimit(); // t=0
      
      // Advance halfway through window
      jest.advanceTimersByTime(windowMs / 2);
      
      // Should still be limited
      expect(await rateLimit.checkLimit()).toBe(false);
      
      // Advance past window for first requests
      jest.advanceTimersByTime(windowMs / 2 + 1);
      
      // Should allow new requests
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Should be limited again
      expect(await rateLimit.checkLimit()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid requests', async () => {
      const results = await Promise.all([
        rateLimit.checkLimit(),
        rateLimit.checkLimit(),
        rateLimit.checkLimit(),
        rateLimit.checkLimit()
      ]);

      // First three should be allowed, fourth denied
      expect(results).toEqual([true, true, true, false]);
    });

    it('should handle zero requests in window', () => {
      const zeroLimit = new RateLimit({ maxRequests: 0, windowMs });
      expect(zeroLimit.checkLimit()).resolves.toBe(false);
    });

    it('should handle very large request limits', async () => {
      const largeLimit = new RateLimit({ maxRequests: 1000000, windowMs });
      for (let i = 0; i < 1000; i++) {
        expect(await largeLimit.checkLimit()).toBe(true);
      }
    });

    it('should handle very small windows', async () => {
      const smallWindow = new RateLimit({ maxRequests: 1, windowMs: 1 });
      expect(await smallWindow.checkLimit()).toBe(true);
      expect(await smallWindow.checkLimit()).toBe(false);
      
      jest.advanceTimersByTime(1);
      expect(await smallWindow.checkLimit()).toBe(true);
    });

    it('should handle large windows', async () => {
      // Use a large but safe window size (1 day in milliseconds)
      const oneDayMs = 24 * 60 * 60 * 1000;
      const largeWindow = new RateLimit({ maxRequests: 1, windowMs: oneDayMs });
      
      expect(await largeWindow.checkLimit()).toBe(true);
      expect(await largeWindow.checkLimit()).toBe(false);
      
      jest.advanceTimersByTime(oneDayMs);
      expect(await largeWindow.checkLimit()).toBe(true);
    });
  });
});
