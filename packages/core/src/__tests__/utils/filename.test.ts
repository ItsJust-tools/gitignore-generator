import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../../utils/filename';

describe('sanitizeFilename', () => {
  it('should remove invalid OS characters', () => {
    expect(sanitizeFilename('test/file:name*with?chars.json')).toBe(
      'test-file-name-with-chars.json'
    );
    expect(sanitizeFilename('foo\bar|baz<qux>"quote".txt')).toBe('foo-bar-baz-qux-quote-.txt');
  });

  it('should respect max length', () => {
    const longName = 'a'.repeat(150) + '.json';
    const result = sanitizeFilename(longName, 50);
    expect(result.length).toBeLessThanOrEqual(50);
  });

  it('should handle empty or whitespace input', () => {
    expect(sanitizeFilename('')).toBe('export');
    expect(sanitizeFilename('   ')).toBe('export');
  });
});
