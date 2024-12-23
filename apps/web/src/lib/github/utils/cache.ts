// src/lib/github/utils/cache.ts
interface CacheOptions {
    ttl: number;
    maxSize?: number;
  }
  
  export class Cache<T> {
    private cache: Map<string, { data: T; timestamp: number }>;
    private ttl: number;
    private maxSize: number;
  
    constructor(options: CacheOptions) {
      this.cache = new Map();
      this.ttl = options.ttl;
      this.maxSize = options.maxSize || 1000;
    }
  
    set(key: string, value: T): void {
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }
      this.cache.set(key, {
        data: value,
        timestamp: Date.now()
      });
    }
  
    get(key: string): T | null {
      const item = this.cache.get(key);
      if (!item) return null;
  
      if (this.isExpired(item.timestamp)) {
        this.cache.delete(key);
        return null;
      }
  
      return item.data;
    }
  
    private isExpired(timestamp: number): boolean {
      return Date.now() - timestamp > this.ttl;
    }
  
    private evictOldest(): void {
      const oldest = [...this.cache.entries()]
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this.cache.delete(oldest[0]);
      }
    }
  }