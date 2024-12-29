import { Cache } from '../cache';

describe('Cache', () => {
  let cache: Cache<string>;
  const ttl = 1000; // 1 second
  const maxSize = 3;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new Cache<string>({ ttl, maxSize });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic operations', () => {
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

  describe('TTL expiration', () => {
    it('should expire items after TTL', () => {
      cache.set('key1', 'value1');
      
      // Advance time just before TTL
      jest.advanceTimersByTime(ttl - 1);
      expect(cache.get('key1')).toBe('value1');
      
      // Advance time past TTL
      jest.advanceTimersByTime(1);
      expect(cache.get('key1')).toBeNull();
    });

    it('should remove expired items when accessed', () => {
      cache.set('key1', 'value1');
      
      // Advance time past TTL
      jest.advanceTimersByTime(ttl + 1);
      
      // Access should return null and remove the item
      expect(cache.get('key1')).toBeNull();
      
      // Set a new value to verify the old one was removed
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('max size handling', () => {
    it('should evict oldest item when max size is reached', () => {
      // Fill cache to max size
      cache.set('key1', 'value1');
      jest.advanceTimersByTime(1); // Ensure different timestamps
      cache.set('key2', 'value2');
      jest.advanceTimersByTime(1);
      cache.set('key3', 'value3');

      // All items should be present
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');

      // Add one more item
      cache.set('key4', 'value4');

      // Oldest item (key1) should be evicted
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should handle default max size', () => {
      const defaultCache = new Cache<string>({ ttl });
      
      // Add more than default max size (1000) items
      for (let i = 0; i < 1001; i++) {
        defaultCache.set(`key${i}`, `value${i}`);
      }

      // First item should be evicted
      expect(defaultCache.get('key0')).toBeNull();
      expect(defaultCache.get('key1')).toBe('value1');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined max size', () => {
      const cacheWithoutMaxSize = new Cache<string>({ ttl });
      expect(() => {
        cacheWithoutMaxSize.set('key1', 'value1');
      }).not.toThrow();
    });

    it('should handle rapid set/get operations', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`);
        expect(cache.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    it('should handle different value types', () => {
      const mixedCache = new Cache<string | number | boolean | object | unknown[]>({ ttl });
      
      mixedCache.set('string', 'value');
      mixedCache.set('number', 123);
      mixedCache.set('boolean', true);
      mixedCache.set('object', { foo: 'bar' });
      mixedCache.set('array', [1, 2, 3]);
      
      expect(mixedCache.get('string')).toBe('value');
      expect(mixedCache.get('number')).toBe(123);
      expect(mixedCache.get('boolean')).toBe(true);
      expect(mixedCache.get('object')).toEqual({ foo: 'bar' });
      expect(mixedCache.get('array')).toEqual([1, 2, 3]);
    });
  });
});
