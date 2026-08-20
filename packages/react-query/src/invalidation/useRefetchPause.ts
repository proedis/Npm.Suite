import * as React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useUnmountEffect } from '@proedis/react';

import PauseGate from './PauseGate';
import { getClientRegistry } from './registry';


/* --------
 * Hook Definition
 * -------- */

/**
 * Suppress window-focus refetch, while `lock` is true, for the queries that were already in cache
 * when this hook mounted.
 *
 * The case it exists for: a form open over a list. The user switches to another window to copy a
 * value, comes back, and every query behind the form refetches — the list reorders, a selector
 * loses the option that was picked. Gating those queries for the form's lifetime keeps the screen
 * still while the user is editing it.
 *
 * The snapshot is deliberate. It is taken once, on mount, so queries mounted *after* the form
 * opened — the form's own selectors, a lazy tab — keep refetching normally; only the screen the
 * user left behind is frozen.
 *
 * ⚠️ Requires the client to be built with `refetchOnWindowFocusGate`, otherwise nothing reads the
 * gates and the hook does nothing.
 *
 * @param lock - Whether this instance is currently suppressing refetch.
 */
export function useRefetchPause(lock: boolean): void {

  // ----
  // Internal Hooks
  // ----
  const holderKey = React.useId();
  const queryClient = useQueryClient();


  // ----
  // Internal State
  // ----
  const [ gatedQueryHashes ] = React.useState(
    () => queryClient.getQueryCache().getAll().map(({ queryHash }) => queryHash)
  );


  // ----
  // Handlers
  // ----
  const acquire = React.useCallback(
    () => {
      const { refetchGates } = getClientRegistry(queryClient);

      gatedQueryHashes.forEach((queryHash) => {
        const gate = refetchGates.get(queryHash) ?? new PauseGate();

        gate.acquire(holderKey);
        refetchGates.set(queryHash, gate);
      });
    },
    [ gatedQueryHashes, holderKey, queryClient ]
  );

  const release = React.useCallback(
    () => {
      const { refetchGates } = getClientRegistry(queryClient);

      gatedQueryHashes.forEach((queryHash) => {
        const gate = refetchGates.get(queryHash);

        if (!gate) {
          return;
        }

        /** Drop the entry entirely once the last holder is gone, so the map cannot grow forever */
        if (gate.release(holderKey)) {
          refetchGates.delete(queryHash);
        }
      });
    },
    [ gatedQueryHashes, holderKey, queryClient ]
  );


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(
    () => {
      if (lock) {
        acquire();
      }
      else {
        release();
      }
    },
    [ acquire, lock, release ]
  );

  useUnmountEffect(release);

}
