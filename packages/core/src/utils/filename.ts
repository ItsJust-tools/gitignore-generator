/**
 * Sanitize a filename against invalid OS characters and enforce a max length.
 */
export function sanitizeFilename(filename: string, maxLength = 100): string {
  if (!filename) return 'export';

  // Replace invalid characters: /, \, ?, %, *, :, |, ", <, >, control characters
  let sanitized = filename.replace(/[/\\?%*:|"<>\u0000-\u001f\u0080-\u009f]/g, '-');

  // Trim whitespace and leading/trailing dots or hyphens
  sanitized = sanitized.trim().replace(/^[.\-_]+|[.\-_]+$/g, '');

  if (!sanitized) {
    return 'export';
  }

  if (sanitized.length > maxLength) {
    sanitized = sanitized
      .slice(0, maxLength)
      .trim()
      .replace(/[.\-_]+$/g, '');
  }

  return sanitized || 'export';
}
