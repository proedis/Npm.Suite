/**
 * Check if a value is _nil_, the single notion of absence that covers both `null` and
 * `undefined` — exactly what the loose `== null` comparison and the optional chaining
 * operator treat as one thing.
 *
 * It is a type guard, so the compiler narrows the value in both branches: the negative one
 * hands you a `NonNullable` value with no cast required.
 *
 * @param value The value to check
 * @returns `true` when the value is `null` or `undefined`
 *
 * @example
 * function greet(name: Nillable<string>): string {
 *   if (isNil(name)) {
 *     return 'Hello, stranger';
 *   }
 *
 *   return `Hello, ${name.trim()}`;
 * }
 */
export default function isNil(value: unknown): value is null | undefined {
  return value == null;
}
