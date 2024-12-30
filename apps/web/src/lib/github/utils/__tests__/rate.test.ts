import { RateLimit } from '../rate';

describe('RateLimit', () => {
  let mockTime: number;
  let timeProvider: () => number;
  let rateLimit: RateLimit;

  beforeEach(() => {
    mockTime = 0;
    timeProvider = () => mockTime;
  });

  describe('Basic request counting', () => {
    beforeEach(() => {
      rateLimit = new RateLimit({
        maxRequests: 3,
        windowMs: 1000,
        timeProvider
      });
    });

    it('should allow requests up to the limit', async () => {
      // First request at t=0
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Second request at t=0
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Third request at t=0
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Fourth request at t=0 should be denied
      expect(await rateLimit.checkLimit()).toBe(false);
    });

    it('should deny requests when limit is 0', async () => {
      const zeroLimit = new RateLimit({
        maxRequests: 0,
        windowMs: 1000,
        timeProvider
      });
      expect(await zeroLimit.checkLimit()).toBe(false);
    });
  });

  describe('Window expiration', () => {
    beforeEach(() => {
      rateLimit = new RateLimit({
        maxRequests: 1,
        windowMs: 1000,
        timeProvider
      });
    });

    it('should reset counter after window expires', async () => {
      // First request at t=0
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Second request at t=0 should be denied
      expect(await rateLimit.checkLimit()).toBe(false);
      
      // Advance time past window
      mockTime = 1000;
      
      // Request should now be allowed (new window)
      expect(await rateLimit.checkLimit()).toBe(true);
    });

    it('should not reset counter before window expires', async () => {
      // First request at t=0
      expect(await rateLimit.checkLimit()).toBe(true);
      
      // Advance time to just before window expiration
      mockTime = 999;
      
      // Request should still be denied
      expect(await rateLimit.checkLimit()).toBe(false);
    });
  });

  describe('Multiple windows', () => {
    beforeEach(() => {
      rateLimit = new RateLimit({
        maxRequests: 2,
        windowMs: 1000,
        timeProvider
      });
    });

    it('should handle multiple window transitions', async () => {
      // First window: Use up limit
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(false);
      
      // Second window
      mockTime = 1000;
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(false);
      
      // Third window
      mockTime = 2000;
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(false);
    });
  });
});
