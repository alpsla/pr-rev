import { RateLimit } from '../../utils/rate';

describe('RateLimit', () => {
  // Mock Date.now() to control time
  const mockNow = jest.spyOn(Date, 'now');
  const baseTime = 1000000000000; // Some fixed timestamp

  beforeEach(() => {
    // Reset Date.now mock before each test
    mockNow.mockReset();
    mockNow.mockImplementation(() => baseTime);
  });

  afterAll(() => {
    mockNow.mockRestore();
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', async () => {
      const rateLimit = new RateLimit({
        maxRequests: 3,
        windowMs: 1000 // 1 second window
      });

      // First request
      expect(await rateLimit.checkLimit()).toBe(true);

      // Second request
      expect(await rateLimit.checkLimit()).toBe(true);

      // Third request (at limit)
      expect(await rateLimit.checkLimit()).toBe(true);

      // Fourth request (exceeds limit)
      expect(await rateLimit.checkLimit()).toBe(false);
    });

    it('should reset after window expires', async () => {
      const rateLimit = new RateLimit({
        maxRequests: 2,
        windowMs: 1000 // 1 second window
      });

      // Use up the limit
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(false);

      // Move time forward past the window
      mockNow.mockImplementation(() => baseTime + 1001);

      // Should be allowed again
      expect(await rateLimit.checkLimit()).toBe(true);
    });

    it('should handle sliding window correctly', async () => {
      const rateLimit = new RateLimit({
        maxRequests: 2,
        windowMs: 1000
      });

      // First request at t=0
      mockNow.mockImplementation(() => baseTime);
      expect(await rateLimit.checkLimit()).toBe(true);

      // Second request at t=500ms
      mockNow.mockImplementation(() => baseTime + 500);
      expect(await rateLimit.checkLimit()).toBe(true);

      // Third request at t=800ms (should fail, window still includes both previous requests)
      mockNow.mockImplementation(() => baseTime + 800);
      expect(await rateLimit.checkLimit()).toBe(false);

      // Fourth request at t=1100ms (should succeed, first request has expired)
      mockNow.mockImplementation(() => baseTime + 1100);
      expect(await rateLimit.checkLimit()).toBe(true);
    });

    it('should clear old timestamps', async () => {
      const rateLimit = new RateLimit({
        maxRequests: 2,
        windowMs: 1000
      });

      // Make initial requests
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);

      // Move time forward
      mockNow.mockImplementation(() => baseTime + 1500);

      // Should have cleared old timestamps
      expect(await rateLimit.checkLimit()).toBe(true);
      expect(await rateLimit.checkLimit()).toBe(true);
    });

    it('should handle zero requests limit', async () => {
      const rateLimit = new RateLimit({
        maxRequests: 0,
        windowMs: 1000
      });

      expect(await rateLimit.checkLimit()).toBe(false);
    });

    it('should handle very short windows', async () => {
      const rateLimit = new RateLimit({
        maxRequests: 1,
        windowMs: 1 // 1ms window
      });

      // First request
      expect(await rateLimit.checkLimit()).toBe(true);

      // Second request
      mockNow.mockImplementation(() => baseTime + 2);
      expect(await rateLimit.checkLimit()).toBe(true);
    });
  });
});
