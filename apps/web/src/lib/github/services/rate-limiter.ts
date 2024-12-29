import { prisma } from '../../prisma';

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

export class RateLimiter {
  private userId: string;
  private readonly minDelay = 1000; // Minimum delay between requests in ms

  constructor(userId: string) {
    this.userId = userId;
  }

  async executeWithRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    await this.waitForRateLimit();
    try {
      const result = await operation();
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit exceeded')) {
        await this.handleRateLimitExceeded();
        return this.executeWithRateLimit(operation);
      }
      throw error;
    }
  }

  private async waitForRateLimit(): Promise<void> {
    const rateLimitInfo = await this.getRateLimitInfo();
    if (!rateLimitInfo) return;

    if (rateLimitInfo.remaining <= 0) {
      const waitTime = (rateLimitInfo.reset * 1000) - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } else {
      // Ensure minimum delay between requests
      const lastRequest = await this.getLastRequestTime();
      if (lastRequest) {
        const timeSinceLastRequest = Date.now() - lastRequest.getTime();
        if (timeSinceLastRequest < this.minDelay) {
          await new Promise(resolve => 
            setTimeout(resolve, this.minDelay - timeSinceLastRequest)
          );
        }
      }
    }

    await this.updateLastRequestTime();
  }

  private async handleRateLimitExceeded(): Promise<void> {
    const rateLimitInfo = await this.getRateLimitInfo();
    if (!rateLimitInfo) return;

    const waitTime = (rateLimitInfo.reset * 1000) - Date.now();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  private async getRateLimitInfo(): Promise<RateLimitInfo | null> {
    const record = await prisma.keyValueStore.findUnique({
      where: {
        key: `rate_limit:${this.userId}`
      }
    });

    if (!record) return null;

    try {
      return JSON.parse(record.value) as RateLimitInfo;
    } catch {
      return null;
    }
  }

  private async getLastRequestTime(): Promise<Date | null> {
    const record = await prisma.keyValueStore.findUnique({
      where: {
        key: `last_request:${this.userId}`
      }
    });

    return record ? new Date(record.value) : null;
  }

  private async updateLastRequestTime(): Promise<void> {
    await prisma.keyValueStore.upsert({
      where: {
        key: `last_request:${this.userId}`
      },
      update: {
        value: new Date().toISOString()
      },
      create: {
        key: `last_request:${this.userId}`,
        value: new Date().toISOString()
      }
    });
  }

  async updateRateLimit(info: RateLimitInfo): Promise<void> {
    await prisma.keyValueStore.upsert({
      where: {
        key: `rate_limit:${this.userId}`
      },
      update: {
        value: JSON.stringify(info)
      },
      create: {
        key: `rate_limit:${this.userId}`,
        value: JSON.stringify(info)
      }
    });
  }

  async close(): Promise<void> {
    await prisma.$disconnect();
  }
}
