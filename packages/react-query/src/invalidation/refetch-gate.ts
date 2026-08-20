import type { Query, QueryClient } from '@tanstack/react-query';
import { getClientRegistry } from './registry';


/* --------
 * API
 * -------- */

/**
 * Check whether window-focus refetch is currently suppressed for a single query.
 *
 * @param queryClient - The client owning the cache.
 * @param queryHash - The hash of the query being considered, as `@tanstack/react-query` computes it.
 */
export function isRefetchPaused(queryClient: QueryClient, queryHash: string): boolean {
  return !!getClientRegistry(queryClient).refetchGates.get(queryHash)?.isPaused();
}


/**
 * Build the `refetchOnWindowFocus` option that makes `useRefetchPause` effective.
 *
 * ⚠️ Without this wiring the hook is inert: nothing in `@tanstack/react-query` consults the gates
 * on its own. Pass it once, when the client is created.
 *
 * ```ts
 * const queryClient: QueryClient = new QueryClient({
 *   defaultOptions: { queries: { refetchOnWindowFocus: refetchOnWindowFocusGate(() => queryClient) } }
 * });
 * ```
 *
 * The client is taken as a getter because the option has to be declared in the same object literal
 * that produces the client it gates.
 *
 * @param getQueryClient - Returns the client the gates are registered against.
 * @param fallback - What to answer when no gate holds the query. Defaults to `true`, matching the
 *  library default.
 */
export function refetchOnWindowFocusGate(
  getQueryClient: () => QueryClient,
  fallback: boolean = true
): (query: Query) => boolean {
  return (query) => (isRefetchPaused(getQueryClient(), query.queryHash) ? false : fallback);
}
