import * as React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import type { InvalidateQueryFilters } from '@tanstack/react-query';

import { useSyncedRef } from '@proedis/react';

import { InvalidationQueue } from './InvalidationQueue';

import type {
  QueryToInvalidate,
  UseQueryInvalidationInput,
  UseQueryInvalidationOptions,
  UseQueryInvalidationReturn
} from './invalidation.types';


/* --------
 * Helpers
 * -------- */
function toInvalidateQueryFilters(query: QueryToInvalidate): InvalidateQueryFilters {
  /**
   * Both branches are cast explicitly. Narrowing a `ReadonlyArray` out of this union — with `in` or
   * with `Array.isArray` — depends on the consumer's compiler configuration, and a package that
   * compiles here and not there is worse than one extra assertion.
   */
  return Array.isArray(query)
    ? { queryKey: query as ReadonlyArray<unknown>, exact: false }
    : query as InvalidateQueryFilters;
}

function hasQueryKey(filter: InvalidateQueryFilters): boolean {
  return Array.isArray(filter.queryKey) && !!filter.queryKey.length;
}


/* --------
 * Hook Definition
 * -------- */

/**
 * Build a stable invalidator for a set of queries, routed through the `InvalidationQueue`.
 *
 * Use it instead of calling `queryClient.invalidateQueries` directly: going through the queue is
 * what makes invalidations dedupe within a tick and what lets `useInvalidationGate` hold them
 * back while a modal is still open.
 *
 * The returned function is referentially stable across renders even when the query list is
 * rebuilt inline on every render, so it is safe as a `useMutation` callback or an effect
 * dependency.
 *
 * @param queries - The queries to invalidate, or a builder receiving the invalidation context.
 * @param options - See `UseQueryInvalidationOptions`.
 */
export function useQueryInvalidation<TContext = void>(
  queries?: UseQueryInvalidationInput<TContext>,
  options?: UseQueryInvalidationOptions
): UseQueryInvalidationReturn<TContext> {

  // ----
  // Options Deconstruct
  // ----
  const {
    awaitInvalidation = true
  } = options ?? {};


  // ----
  // Internal Hooks
  // ----
  const queryClient = useQueryClient();

  /** Read the input through a ref, so an inline array does not change the invalidator identity */
  const queriesRef = useSyncedRef(queries);


  // ----
  // Handlers
  // ----
  const invalidate = React.useCallback(
    async (context?: TContext) => {
      const { current: input } = queriesRef;

      if (!input) {
        return;
      }

      const queriesToInvalidate = typeof input === 'function' ? input(context as TContext) : input;
      const filters = queriesToInvalidate.map(toInvalidateQueryFilters).filter(hasQueryKey);

      if (!filters.length) {
        return;
      }

      const enqueued = InvalidationQueue.enqueue(queryClient, filters);

      if (awaitInvalidation) {
        await enqueued;
      }
    },
    [ awaitInvalidation, queriesRef, queryClient ]
  );


  // ----
  // Hook Return
  // ----
  return invalidate as UseQueryInvalidationReturn<TContext>;

}
