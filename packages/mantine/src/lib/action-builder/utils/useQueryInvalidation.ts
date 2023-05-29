import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey as QK } from '@tanstack/react-query';

import type { PlainOrBuilder } from '../action-builder.types';


export default function useQueryInvalidation<P extends {}>(
  props: P,
  invalidateQueries?: PlainOrBuilder<QK[], P>
): () => Promise<void> {

  // ----
  // Internal Hooks
  // ----
  const queryClient = useQueryClient();


  // ----
  // Build query to invalidate
  // ----
  const queryToInvalidate = typeof invalidateQueries === 'function'
    ? invalidateQueries(props)
    : invalidateQueries;


  // ----
  // Return the invalidation function
  // ----
  return async () => {
    /** Abort if query to invalidate is of invalid type */
    if (!Array.isArray(queryToInvalidate)) {
      return;
    }

    /** Await all invalidation promises */
    await Promise.all(
      queryToInvalidate
        .filter(k => Array.isArray(k) && !!k.length)
        .map(k => queryClient.invalidateQueries(k))
    );
  };

}
