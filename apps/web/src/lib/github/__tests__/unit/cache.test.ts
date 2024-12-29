import { Cache } from '../../utils/cache';

describe('Cache', () => {
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

  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      const cache = new Cache<string>({ ttl: 1000 });
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      const cache = new Cache<string>({ ttl: 1000 });
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should handle different value types', () => {
      interface TestTypes {
        string: string;
        number: number;
        boolean: boolean;
        object: { foo: string };
        array: number[];
      }
      const cache = new Cache<TestTypes[keyof TestTypes]>({ ttl: 1000 });
      
      // Test various types
      cache.set('string', 'test');
      cache.set('number', 123);
      cache.set('boolean', true);
      cache.set('object', { foo: 'bar' });
      cache.set('array', [1, 2, 3]);

      expect(cache.get('string')).toBe('test');
      expect(cache.get('number')).toBe(123);
      expect(cache.get('boolean')).toBe(true);
      expect(cache.get('object')).toEqual({ foo: 'bar' });
      expect(cache.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('TTL behavior', () => {
    it('should expire items after TTL', () => {
      const cache = new Cache<string>({ ttl: 1000 }); // 1 second TTL
      cache.set('key1', 'value1');

      // Before expiration
      expect(cache.get('key1')).toBe('value1');

      // After expiration
      mockNow.mockImplementation(() => baseTime + 1001);
      expect(cache.get('key1')).toBeNull();
    });

    it('should not expire items before TTL', () => {
      const cache = new Cache<string>({ ttl: 1000 });
      cache.set('key1', 'value1');

      // Just before expiration
      mockNow.mockImplementation(() => baseTime + 999);
      expect(cache.get('key1')).toBe('value1');
    });

    it('should handle zero TTL', () => {
      const cache = new Cache<string>({ ttl: 0 });
      cache.set('key1', 'value1');

      // Should expire immediately
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('size limits', () => {
    it('should respect maxSize limit', () => {
      const cache = new Cache<string>({ ttl: 1000, maxSize: 2 });
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3'); // Should evict oldest item

      expect(cache.get('key1')).toBeNull(); // Should be evicted
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should evict oldest items first', () => {
      const cache = new Cache<string>({ ttl: 1000, maxSize: 2 });

      // Add items at different times
      mockNow.mockImplementation(() => baseTime);
      cache.set('key1', 'value1');

      mockNow.mockImplementation(() => baseTime + 100);
      cache.set('key2', 'value2');

      mockNow.mockImplementation(() => baseTime + 200);
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBeNull(); // Should be evicted (oldest)
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should handle maxSize of 1', () => {
      const cache = new Cache<string>({ ttl: 1000, maxSize: 1 });
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should use default maxSize if not specified', () => {
      const cache = new Cache<string>({ ttl: 1000 });
      
      // Add many items (but less than default maxSize)
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // All items should still be present
      for (let i = 0; i < 100; i++) {
        expect(cache.get(`key${i}`)).toBe(`value${i}`);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle updating existing keys', () => {
      const cache = new Cache<string>({ ttl: 1000 });
      
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
    });

    it('should handle undefined and null values', () => {
      interface NullableTypes {
        undefined: undefined;
        null: null;
      }
      const cache = new Cache<NullableTypes[keyof NullableTypes]>({ ttl: 1000 });
      
      cache.set('undefined', undefined);
      cache.set('null', null);

      expect(cache.get('undefined')).toBe(undefined);
      expect(cache.get('null')).toBe(null);
    });

    it('should handle empty string keys', () => {
      const cache = new Cache<string>({ ttl: 1000 });
      
      cache.set('', 'empty');
      expect(cache.get('')).toBe('empty');
    });
  });
});
