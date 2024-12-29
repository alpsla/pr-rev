import { cn } from '../ui';

describe('cn (class names) utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isPrimary = false;
    
    expect(cn(
      'base',
      isActive && 'active',
      isPrimary && 'primary'
    )).toBe('base active');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should handle objects of conditional classes', () => {
    expect(cn({
      'foo': true,
      'bar': false,
      'baz': true
    })).toBe('foo baz');
  });

  it('should merge Tailwind classes intelligently', () => {
    // Should merge padding
    expect(cn('p-2', 'p-4')).toBe('p-4');
    
    // Should merge colors
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    
    // Should handle responsive variants
    expect(cn('md:p-2', 'md:p-4')).toBe('md:p-4');
    
    // Should handle state variants
    expect(cn('hover:text-red-500', 'hover:text-blue-500')).toBe('hover:text-blue-500');
    
    // Should preserve unrelated classes
    expect(cn('p-2', 'text-red-500')).toBe('p-2 text-red-500');
  });

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      {
        'conditional-true': true,
        'conditional-false': false
      },
      ['array-item-1', 'array-item-2'],
      undefined,
      null,
      'p-2 md:p-4',
      'p-4 md:p-6'  // Should override previous padding
    );

    expect(result).toBe('base-class conditional-true array-item-1 array-item-2 p-4 md:p-6');
  });

  it('should handle undefined and null inputs', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn([], {})).toBe('');
  });
});
