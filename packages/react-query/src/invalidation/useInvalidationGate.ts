import * as React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useUnmountEffect } from '@proedis/react';

import { InvalidationQueue } from './InvalidationQueue';
import { getClientRegistry } from './registry';


/* --------
 * Hook Definition
 * -------- */

/**
 * Hold back cache invalidation while `lock` is true, then flush everything that piled up.
 *
 * The case it exists for: a modal that saves several entities before closing. Each mutation
 * invalidates the list behind the modal, the list refetches under the user's hands, and a row they
 * were looking at moves. Gating the queue for the modal's lifetime turns those N refetches into
 * one, fired when the modal is gone.
 *
 * Every mounted instance holds its own key, so nesting is safe: the queue flushes when the last
 * holder releases it, not the first. Unmounting releases the gate even when `lock` never went back
 * to false — a modal closed by unmount is the common path, not the exception.
 *
 * @param lock - Whether this instance is currently holding the gate closed.
 */
export function useInvalidationGate(lock: boolean): void {

  // ----
  // Internal Hooks
  // ----
  const holderKey = React.useId();
  const queryClient = useQueryClient();


  // ----
  // Handlers
  // ----
  const release = React.useCallback(
    async () => {
      const { invalidationGate } = getClientRegistry(queryClient);

      /** `release` answers "was that the last holder?" — only then is the queue safe to flush */
      if (invalidationGate.release(holderKey)) {
        await InvalidationQueue.flush(queryClient);
      }
    },
    [ holderKey, queryClient ]
  );


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(
    () => {
      if (lock) {
        getClientRegistry(queryClient).invalidationGate.acquire(holderKey);
        return;
      }

      release().catch(() => undefined);
    },
    [ holderKey, lock, queryClient, release ]
  );

  useUnmountEffect(() => {
    release().catch(() => undefined);
  });

}
