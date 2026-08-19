/* eslint-disable @typescript-eslint/no-redeclare */

/* --------
 * Value Primitives
 * -------- */

/**
 * Every type a value can be without being an object.
 *
 * Useful as the terminal branch of a recursive mapped type: once a property is a `Primitive`
 * there is nothing left to walk into.
 *
 * @example
 * type Flattened<T> = { [K in keyof T]: T[K] extends Primitive ? T[K] : never };
 */
export type Primitive = string | number | bigint | boolean | symbol | null | undefined;
export const Primitive = Object;


/**
 * A value that is either present, or explicitly absent.
 *
 * Prefer this over `T | null` in a public signature: it states that `null` is a meaningful,
 * expected outcome rather than an oversight.
 *
 * @example
 * function findUser(id: string): Nullable<User> {
 *   return users.get(id) ?? null;
 * }
 */
export type Nullable<T> = T | null;
export const Nullable = Object;


/**
 * A value that may be `null` **or** `undefined` — "nil", the union both `== null` and the
 * optional chaining operator treat as one thing.
 *
 * Reach for it when the two flavours of absence are genuinely interchangeable, which is most
 * of the time. When they are not, spell out the union you actually mean.
 *
 * @example
 * function assertPresent<T>(value: Nillable<T>): T {
 *   if (value == null) {
 *     throw new Error('value is nil');
 *   }
 *
 *   return value;
 * }
 */
export type Nillable<T> = Nullable<T> | undefined;
export const Nillable = Object;


/**
 * A value that may or may not arrive asynchronously.
 *
 * The right parameter type for a user supplied callback whose result you always `await`:
 * it lets the caller stay synchronous when there is nothing to wait for.
 *
 * @example
 * type Interceptor = (request: Request) => Awaitable<Request>;
 *
 * const applied = await interceptor(request);
 */
export type Awaitable<T> = T | Promise<T>;
export const Awaitable = Object;


/* --------
 * Runtime Environment
 * -------- */

/**
 * The environments a Proedis application is built and configured for, matching the values
 * `process.env.NODE_ENV` is expected to carry.
 *
 * Configuration objects across the suite accept `Partial<Record<Environment, T>>` wherever a
 * setting is allowed to differ per environment.
 *
 * @example
 * const baseUrl: Partial<Record<Environment, string>> = {
 *   development: 'https://localhost:5001',
 *   production : 'https://api.proedis.net'
 * };
 */
export type Environment = 'development' | 'production' | 'test' | 'staging';
export const Environment = String;
