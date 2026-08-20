import { hashKey, notifyManager } from '@tanstack/react-query';
import type { QueryClient, InvalidateQueryFilters } from '@tanstack/react-query';

import { getClientRegistry } from './registry';


/* --------
 * Helpers
 * -------- */

/**
 * `exact` reaches this layer from query keys built by hand, by a code generator, or by a URL
 * parser, so both `true` and the string `'true'` show up in the wild. Normalizing it is what makes
 * the signature below stable: two filters that differ only in the shape of that flag are the same
 * invalidation and must dedupe against each other.
 */
function normalizeExact(exact: unknown): boolean {
  return exact === true || exact === 'true';
}

function withNormalizedExact(filter: InvalidateQueryFilters): InvalidateQueryFilters {
  const exact = normalizeExact(filter.exact);
  return exact === filter.exact ? filter : { ...filter, exact };
}

function getSignature(filter: InvalidateQueryFilters): string {
  return hashKey([ normalizeExact(filter.exact), ...(Array.isArray(filter.queryKey) ? filter.queryKey : []) ]);
}

function dedupe(filters: InvalidateQueryFilters[]): InvalidateQueryFilters[] {
  const uniqueFilters = new Map<string, InvalidateQueryFilters>();

  for (const filter of filters) {
    const normalizedFilter = withNormalizedExact(filter);
    uniqueFilters.set(getSignature(normalizedFilter), normalizedFilter);
  }

  return Array.from(uniqueFilters.values());
}

function invalidateAll(queryClient: QueryClient, filters: InvalidateQueryFilters[]): Promise<void> {
  /**
   * `notifyManager.batch` collapses every subscriber notification produced by the whole set into a
   * single render pass. `allSettled` and not `all`: one rejected invalidation must not abort the
   * others, and a caller awaiting the flush is asking when the cache is done, not whether every
   * refetch succeeded.
   */
  return notifyManager.batch(async () => {
    await Promise.allSettled(filters.map(filter => queryClient.invalidateQueries(filter)));
  });
}


/* --------
 * API
 * -------- */
export const InvalidationQueue = {

  /**
   * Invalidate a set of queries, or defer them when the client's gate is closed.
   *
   * Filters are deduped by query key + `exact` before running, so the same key coming from three
   * mutations in the same tick costs one invalidation.
   *
   * @param queryClient - The client owning the cache.
   * @param filters - The invalidations to run. An empty array is a no-op.
   * @returns A promise that resolves once the invalidations ran, or immediately when they were
   *  queued instead.
   */
  enqueue(queryClient: QueryClient, filters: InvalidateQueryFilters[]): Promise<void> {
    if (!filters.length) {
      return Promise.resolve();
    }

    const uniqueFilters = dedupe(filters);
    const { invalidationGate, invalidationQueue } = getClientRegistry(queryClient);

    /** With the gate open there is nothing to wait for: run them now */
    if (!invalidationGate.isPaused()) {
      return invalidateAll(queryClient, uniqueFilters);
    }

    /** Otherwise park them, keyed by signature so a repeated key never queues twice */
    for (const filter of uniqueFilters) {
      invalidationQueue.set(getSignature(filter), filter);
    }

    return Promise.resolve();
  },


  /**
   * Run every deferred invalidation and empty the queue.
   *
   * Called by `useInvalidationGate` when the last holder releases the gate; calling it while the
   * gate is still closed is legal and simply flushes early.
   *
   * @param queryClient - The client owning the cache.
   */
  async flush(queryClient: QueryClient): Promise<void> {
    const { invalidationQueue } = getClientRegistry(queryClient);

    if (!invalidationQueue.size) {
      return;
    }

    /** Snapshot and clear before awaiting, or an invalidation enqueued meanwhile would be dropped */
    const filtersToRun = Array.from(invalidationQueue.values());
    invalidationQueue.clear();

    await invalidateAll(queryClient, filtersToRun);
  },


  /**
   * Check whether invalidations are currently being deferred for this client.
   *
   * @param queryClient - The client owning the cache.
   */
  isPaused(queryClient: QueryClient): boolean {
    return getClientRegistry(queryClient).invalidationGate.isPaused();
  },


  /**
   * Drop every deferred invalidation without running it.
   *
   * @param queryClient - The client owning the cache.
   */
  clear(queryClient: QueryClient): void {
    getClientRegistry(queryClient).invalidationQueue.clear();
  }

};
