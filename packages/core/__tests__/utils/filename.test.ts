import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../../src/utils/filename';

describe('sanitizeFilename', () => {
  it('returns fallback for empty input', () => {
    expect(sanitizeFilename('')).toBe('export');
  });

  it('replaces invalid OS characters with hyphens', () => {
    expect(sanitizeFilename('a/b\\c?d%e*f:g|h"i<j>k')).toBe('a-b-c-d-e-f-g-h-i-j-k');
  });

  it('trims surrounding whitespace, dots, and hyphens', () => {
    expect(sanitizeFilename('  ..my-file..--  ')).toBe('my-file');
  });

  it('falls back to "export" when nothing remains after sanitizing', () => {
    expect(sanitizeFilename('??')).toBe('export');
    expect(sanitizeFilename('.-')).toBe('export');
  });

  it('truncates to max length and strips dangling suffix separators', () => {
    const long = 'x'.repeat(120) + '...';
    const result = sanitizeFilename(long);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result.endsWith('.')).toBe(false);
    expect(result).not.toMatch(/[.\-_]+$/);
  });

  it('respects a custom max length and falls back when truncation leaves nothing', () => {
    expect(sanitizeFilename('abcdef', 3)).toBe('abc');
    expect(sanitizeFilename('abc', 0)).toBe('export');
  });

  it('keeps a plain valid filename untouched', () => {
    expect(sanitizeFilename('gitignore.json')).toBe('gitignore.json');
  });
});
