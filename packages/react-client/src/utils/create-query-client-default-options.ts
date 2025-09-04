import { hasEqualHash, isNil } from '@proedis/utils';

import type { Client } from '@proedis/client';

import { replaceEqualDeep } from '@tanstack/react-query';
import type { DefaultOptions } from '@tanstack/react-query';


/* --------
 * Constants Definition
 * -------- */
const DEFAULT_ARRAY_LENGTH_THRESHOLD = 1_000;

export const defaultStructuralSharing = (
  oldData: unknown,
  newData: unknown,
  arrayLengthThreshold = DEFAULT_ARRAY_LENGTH_THRESHOLD
) => {
  if (oldData === newData) {
    return oldData;
  }

  if (isNil(oldData)) {
    return newData;
  }

  if (Array.isArray(oldData) && Array.isArray(newData)) {
    /** If the length is above the threshold, directly return the result object */
    if (oldData.length > arrayLengthThreshold || newData.length > arrayLengthThreshold) {
      return replaceEqualDeep(oldData, newData);
    }

    /** Else, use the hash comparison to check array equality */
    return hasEqualHash(oldData, newData) ? oldData : replaceEqualDeep(oldData, newData);
  }

  return hasEqualHash(oldData, newData) ? oldData : replaceEqualDeep(oldData, newData);
};


/* --------
 * Utilities
 * -------- */
export function createQueryClientDefaultOptions(client: Client<any, any, any>): DefaultOptions {
  return {
    queries: {
      /** Enable by default the refetch options */
      refetchOnMount      : true,
      refetchOnReconnect  : true,
      refetchOnWindowFocus: true,

      /** Change the function to assert data is equal or not */
      structuralSharing: (oldData, newData) => defaultStructuralSharing(oldData, newData),

      /** Set the default query function to use client instance to perform request */
      queryFn: (ctx) => {
        /** Get the current key and query meta */
        const { meta: requestConfig } = ctx;
        /** Use the base client request method to fetch data */
        return client.request({
          method: 'GET',
          ...requestConfig
        });
      }
    }
  };
}
