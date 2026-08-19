/* --------
 * Constants
 * -------- */

/**
 * Split a string into the word-ish chunks a kebab case conversion is built from.
 *
 * The four alternatives, in order, capture an acronym followed by a new word (`HTTPServer` →
 * `HTTP`), a regular word with an optional leading capital and trailing digits, a lone capital,
 * and a standalone run of digits.
 */
const WORDS_PATTERN = /[A-Z]{2,}(?=[A-Z][a-z]+\d*|\b)|[A-Z]?[a-z]+\d*|[A-Z]|\d+/g;


/**
 * Convert a string to `kebab-case`.
 *
 * Acronyms are kept together instead of being exploded one letter per group, which is the part
 * a naive replace of every capital gets wrong.
 *
 * @param value The string to convert
 * @returns The kebab cased string, or an empty string when there is no word to convert
 *
 * @example
 * toKebabCase('backgroundColor');  // 'background-color'
 * toKebabCase('BackgroundColor');  // 'background-color'
 * toKebabCase('HTTPServerError');  // 'http-server-error'
 * toKebabCase('parseURLFromString'); // 'parse-url-from-string'
 * toKebabCase('snake_case');       // 'snake-case'
 * toKebabCase('user2Profile');     // 'user2-profile' — digits stay glued to their word
 * toKebabCase('  ');               // '' — nothing to convert
 */
export default function toKebabCase(value: string): string {
  return value
    .match(WORDS_PATTERN)
    ?.map((word) => word.toLowerCase())
    .join('-') ?? '';
}
