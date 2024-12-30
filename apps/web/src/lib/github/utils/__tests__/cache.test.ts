import { Cache } from '../cache';

describe('Cache', () => {
  let mockTime: number;
  let timeProvider: () => number;
  let cache: Cache<string>;

  beforeEach(() => {
    mockTime = 0;
    timeProvider = () => mockTime;
  });

  describe('Basic operations', () => {
    beforeEach(() => {
      cache = new Cache<string>({
        ttl: 1000,
        maxSize: 3,
        timeProvider
      });
    });

    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should overwrite existing values', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('TTL behavior', () => {
    describe('when TTL is 0 (disabled caching)', () => {
      beforeEach(() => {
        cache = new Cache<string>({
          ttl: 0,
          maxSize: 3,
          timeProvider
        });
      });

      it('should not store any items', () => {
        cache.set('key1', 'value1');
        expect(cache.get('key1')).toBeNull();
      });

      it('should immediately expire any existing items', () => {
        // Set and get in same timestamp
        cache.set('key1', 'value1');
        expect(cache.get('key1')).toBeNull();
        
        // Set and get in different timestamps
        mockTime = 100;
        cache.set('key2', 'value2');
        expect(cache.get('key2')).toBeNull();
      });
    });

    describe('when TTL is positive', () => {
      const TTL = 1000;
      
      beforeEach(() => {
        cache = new Cache<string>({
          ttl: TTL,
          maxSize: 3,
          timeProvider
        });
      });

      it('should keep items before TTL expiration', () => {
        // Set at t=0
        cache.set('key1', 'value1');
        
        // Check at start
        expect(cache.get('key1')).toBe('value1');
        
        // Check just before expiration
        mockTime = TTL - 1;
        expect(cache.get('key1')).toBe('value1');
      });

      it('should expire items exactly at TTL', () => {
        // Set at t=0
        cache.set('key1', 'value1');
        
        // Check exactly at TTL
        mockTime = TTL;
        expect(cache.get('key1')).toBeNull();
      });

      it('should expire items after TTL', () => {
        // Set at t=0
        cache.set('key1', 'value1');
        
        // Check well after TTL
        mockTime = TTL + 100;
        expect(cache.get('key1')).toBeNull();
      });

      it('should reset TTL when item is updated', () => {
        // Set initial value at t=0
        cache.set('key1', 'value1');
        
        // Update near expiration
        mockTime = TTL - 1;
        cache.set('key1', 'value2');
        
        // Should not expire at original TTL
        mockTime = TTL + 1;
        expect(cache.get('key1')).toBe('value2');
        
        // Should expire at new TTL
        mockTime = TTL + TTL + 1;
        expect(cache.get('key1')).toBeNull();
      });
    });
  });

  describe('Size limits', () => {
    beforeEach(() => {
      cache = new Cache<string>({
        ttl: 1000,
        maxSize: 2,
        timeProvider
      });
    });

    it('should maintain size limit', () => {
      // Add first item at t=0
      cache.set('key1', 'value1');
      
      // Add second item at t=1
      mockTime = 1;
      cache.set('key2', 'value2');
      
      // Verify both items present
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      
      // Add third item at t=2
      mockTime = 2;
      cache.set('key3', 'value3');
      
      // Verify oldest item was evicted
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should handle zero size limit', () => {
      const zeroCache = new Cache<string>({
        ttl: 1000,
        maxSize: 0,
        timeProvider
      });
      
      zeroCache.set('key1', 'value1');
      expect(zeroCache.get('key1')).toBeNull();
    });
  });
});
