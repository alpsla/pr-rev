// src/lib/github/utils/cache.ts
interface CacheOptions {
  ttl: number;
  maxSize?: number;
  timeProvider?: () => number;
}

export class Cache<T> {
  private cache: Map<string, { data: T; timestamp: number }>;
  private ttl: number;
  private maxSize: number;
  private timeProvider: () => number;

  constructor(options: CacheOptions) {
    this.cache = new Map();
    this.ttl = options.ttl;
    this.maxSize = options.maxSize === undefined ? 1000 : options.maxSize;
    this.timeProvider = options.timeProvider || (() => Date.now());
  }

  set(key: string, value: T): void {
    // Don't store if maxSize is 0
    if (this.maxSize === 0) {
      return;
    }
    
    // Evict oldest if we're at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data: value,
      timestamp: this.timeProvider()
    });
  }

  private cleanExpired(): void {
    const expiredKeys = Array.from(this.cache.entries())
      .filter(([, item]) => this.isExpired(item.timestamp))
      .map(([key]) => key);
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  get(key: string): T | null {
    // If maxSize is 0, cache is disabled
    if (this.maxSize === 0) {
      return null;
    }

    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (this.isExpired(item.timestamp)) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  private isExpired(timestamp: number): boolean {
    // TTL=0 means cache is disabled, so items expire immediately
    if (this.ttl === 0) {
      return true;
    }
    
    const now = this.timeProvider();
    const age = now - timestamp;
    // Item expires when its age reaches TTL (inclusive)
    return age >= this.ttl;
  }

  private evictOldest(): void {
    const oldest = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }
}
