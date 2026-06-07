/**
 * Utility to concatenate CSS class names, filtering out falsy values.
 *
 * Accepts a mix of strings, null, undefined, and false values,
 * and returns a single space-separated string of truthy class names.
 *
 * @param classes - CSS class names or falsy values to filter
 * @returns A space-separated string of truthy class names
 *
 * @example
 * cn('foo', false && 'bar', 'baz') // 'foo baz'
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
