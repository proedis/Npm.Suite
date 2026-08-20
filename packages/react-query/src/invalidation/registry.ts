import type { QueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import PauseGate from './PauseGate';


/* --------
 * Internal Types
 * -------- */
interface ClientRegistryEntry {
  /** The gate suppressing cache invalidation while at least one holder keeps it closed */
  invalidationGate: PauseGate;

  /** Invalidations deferred while the gate was closed, deduped by signature */
  invalidationQueue: Map<string, InvalidateQueryFilters>;

  /** One gate per query hash, suppressing window-focus refetch of that single query */
  refetchGates: Map<string, PauseGate>;
}


/* --------
 * Constants Definition
 * -------- */

/**
 * State is keyed by QueryClient instead of living in module scope.
 *
 * A module-level singleton is the same object for every client the bundle ever creates, so two
 * roots mounted side by side (an app and an embedded widget, a test file rendering two providers)
 * would share one queue and one gate: closing the gate in one would silently defer the other's
 * invalidations. A `WeakMap` also lets the whole entry go when the client is garbage collected,
 * which matters in a test suite that builds a fresh client per case.
 */
const REGISTRY = new WeakMap<QueryClient, ClientRegistryEntry>();


/* --------
 * API
 * -------- */

/**
 * Get the registry entry of a QueryClient, creating it on first access.
 *
 * @param queryClient - The client whose state is being read.
 */
export function getClientRegistry(queryClient: QueryClient): ClientRegistryEntry {
  const existingEntry = REGISTRY.get(queryClient);

  if (existingEntry) {
    return existingEntry;
  }

  const newEntry: ClientRegistryEntry = {
    invalidationGate : new PauseGate(),
    invalidationQueue: new Map<string, InvalidateQueryFilters>(),
    refetchGates     : new Map<string, PauseGate>()
  };

  REGISTRY.set(queryClient, newEntry);

  return newEntry;
}
