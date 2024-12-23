// src/lib/github/utils/rate.ts
interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
  }
  
  export class RateLimit {
    private timestamps: number[] = [];
    private readonly maxRequests: number;
    private readonly windowMs: number;
  
    constructor(config: RateLimitConfig) {
      this.maxRequests = config.maxRequests;
      this.windowMs = config.windowMs;
    }
  
    async checkLimit(): Promise<boolean> {
      this.clearOldTimestamps();
      if (this.timestamps.length >= this.maxRequests) {
        return false;
      }
      this.timestamps.push(Date.now());
      return true;
    }
  
    private clearOldTimestamps(): void {
      const now = Date.now();
      this.timestamps = this.timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );
    }
  }