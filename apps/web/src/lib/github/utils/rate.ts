// src/lib/github/utils/rate.ts
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  timeProvider?: () => number;
}

export class RateLimit {
  private requestCount: number = 0;
  private windowStart: number = 0;
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly timeProvider: () => number;

  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
    this.timeProvider = config.timeProvider || (() => Date.now());
    this.windowStart = this.timeProvider();
  }

  async checkLimit(): Promise<boolean> {
    // Don't allow any requests if maxRequests is 0
    if (this.maxRequests === 0) {
      return false;
    }

    const now = this.timeProvider();

    // Check if we need to start a new window
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now;
      this.requestCount = 0;
    }

    // Check if we can allow another request
    if (this.requestCount < this.maxRequests) {
      this.requestCount++;
      return true;
    }

    return false;
  }
}
