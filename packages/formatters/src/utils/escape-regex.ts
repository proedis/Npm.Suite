/**
 * Escape every character that carries a special meaning inside a regular expression.
 *
 * Needed wherever a user supplied string is interpolated into a pattern: a decimal separator of `.`
 * would otherwise match any character at all.
 *
 * @param value The string to escape
 *
 * @example
 * new RegExp(`${escapeRegex('.')}0+$`);   // matches a literal dot, not any character
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
