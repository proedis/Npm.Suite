import type { Awaitable } from '@proedis/types';


/* --------
 * Exported Types
 * -------- */

/**
 * The outcome of an awaited operation, as a two element tuple.
 *
 * It is a discriminated union, not a pair of independently nullable slots: exactly one of the two
 * positions is ever filled. Checking either position therefore narrows the other one, which is the
 * whole reason for the shape.
 *
 * `TError` defaults to `Error` rather than to `unknown`, and that is a deliberate trade-off. A
 * rejected promise can technically carry any value, so `unknown` would be the pedantically correct
 * default — but TypeScript can only discriminate a tuple union on a position whose types are
 * disjoint, and neither `unknown` nor `any` is disjoint from `null`. Both defaults silently give up
 * the narrowing, which is the one thing this type exists for. Pass the type explicitly when a
 * rejection really does carry something else: `will<User, ApiError>(…)`.
 */
export type WillResult<TData, TError = Error> =
  | [ error: null, data: TData ]
  | [ error: TError, data: null ];


/* --------
 * Utility Definition
 * -------- */

/**
 * Await a promise without a `try` / `catch`, getting the error back as a value.
 *
 * The Go flavoured alternative to wrapping half a function body in a `try` block, which is
 * particularly welcome inside a React event handler where the failure path is usually "flip a flag
 * and show a message" rather than "rethrow".
 *
 * A plain value is accepted as well as a promise, so a caller is free to hand over something that
 * only *might* be asynchronous.
 *
 * @param promise The promise — or plain value — to await
 * @returns A tuple of `[ null, data ]` on success, `[ error, null ]` on failure
 *
 * @example
 * const [ error, user ] = await will(client.get<User>('users/me'));
 *
 * if (error) {
 *   notify.failure(error);
 *   return;
 * }
 *
 * // 👇 user is narrowed to User here, no non-null assertion needed
 * setDisplayName(user.displayName);
 *
 * @example
 * // a rejection carrying something that is not an Error
 * const [ apiError, page ] = await will<Page, ApiProblemDetails>(client.get('pages/1'));
 *
 * @remarks
 * ⚠️ Rejections are captured, never suppressed by accident: ignoring the returned error is a
 * deliberate act. Nothing stops you from writing `await will(doSomething())` to fire and forget,
 * but do it because you mean it.
 */
export default async function will<TData, TError = Error>(
  promise: Awaitable<TData>
): Promise<WillResult<TData, TError>> {
  try {
    const result = await promise;
    return [ null, result ];
  }
  catch (error: any) {
    return [ error as TError, null ];
  }
}
