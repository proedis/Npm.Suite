/* --------
 * Query Descriptors
 * -------- */

/**
 * A query to invalidate, either as a bare query key — which invalidates the key and everything
 * below it — or as an explicit filter when the match must be exact.
 */
export type QueryToInvalidate =
  | ReadonlyArray<unknown>
  | { queryKey: ReadonlyArray<unknown>, exact?: boolean };


/**
 * The set of queries a hook will invalidate. A function receives the context the returned
 * invalidator is called with, which is how a mutation result can decide what to invalidate.
 */
export type UseQueryInvalidationInput<TContext> =
  | QueryToInvalidate[]
  | ((context: TContext) => QueryToInvalidate[]);


export interface UseQueryInvalidationOptions {
  /**
   * Await the invalidation before the returned promise resolves.
   *
   * Defaults to `true`: a caller closing a modal after a mutation usually wants the list behind it
   * already refreshed. Set it to `false` to fire and forget when the caller cannot afford the wait.
   */
  awaitInvalidation?: boolean;
}


/**
 * The invalidator returned by `useQueryInvalidation`. It takes no argument when the hook was given
 * a static list, and the context argument when it was given a builder.
 */
export type UseQueryInvalidationReturn<TContext> =
  TContext extends void ? () => Promise<void> : (context: TContext) => Promise<void>;
