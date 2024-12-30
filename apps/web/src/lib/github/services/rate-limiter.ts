import { Octokit } from '@octokit/rest';

export class RateLimiter {
  private octokit: Octokit;
  private lastCheck: Date;
  private remaining: number;
  private resetTime: Date;
  private closed: boolean;
  private timeoutHandle?: NodeJS.Timeout;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
    this.lastCheck = new Date(0);
    this.remaining = 5000; // GitHub's default rate limit
    this.resetTime = new Date(0);
    this.closed = false;
  }

  async checkRateLimit(): Promise<void> {
    if (this.closed) {
      throw new Error('RateLimiter has been closed');
    }

    const now = new Date();
    
    // Only check rate limit if it's been more than 5 minutes since last check
    if (now.getTime() - this.lastCheck.getTime() > 5 * 60 * 1000) {
      await this.updateRateLimit();
    }

    if (this.remaining <= 0) {
      const waitTime = this.resetTime.getTime() - now.getTime();
      if (waitTime > 0) {
        throw new Error(`Rate limit exceeded. Reset in ${Math.ceil(waitTime / 1000)} seconds`);
      }
      // If we're past reset time, update rate limit
      await this.updateRateLimit();
    } else {
      this.remaining--;
    }
  }

  async executeWithRateLimit<T>(
    operation: () => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    if (this.closed) {
      throw new Error('RateLimiter has been closed');
    }

    if (retries < 0) {
      throw new Error('Rate limit exceeded after max retries');
    }

    try {
      await this.checkRateLimit();
      
      if (this.remaining <= 0) {
        if (retries === 0) {
          throw new Error('Rate limit exceeded after max retries');
        }

        // Update rate limit and retry
        await this.updateRateLimit();
        if (this.remaining <= 0) {
          return this.executeWithRateLimit(operation, retries - 1);
        }
      }

      return await operation();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        if (retries === 0) {
          throw new Error('Rate limit exceeded after max retries');
        }
        return this.executeWithRateLimit(operation, retries - 1);
      }
      throw error;
    }
  }

  async updateRateLimit(): Promise<void> {
    if (this.closed) {
      throw new Error('RateLimiter has been closed');
    }

    const { data: rateLimit } = await this.octokit.rateLimit.get();
    this.remaining = rateLimit.resources.core.remaining;
    this.resetTime = new Date(rateLimit.resources.core.reset * 1000);
    this.lastCheck = new Date();
  }

  getRemainingRequests(): number {
    if (this.closed) {
      throw new Error('RateLimiter has been closed');
    }
    return this.remaining;
  }

  getResetTime(): Date {
    if (this.closed) {
      throw new Error('RateLimiter has been closed');
    }
    return new Date(this.resetTime);
  }

  close(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    this.closed = true;
  }

  isClosed(): boolean {
    return this.closed;
  }
}
