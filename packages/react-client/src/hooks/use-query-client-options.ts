import * as React from 'react';

import { mergeObjects } from '@proedis/utils';

import { useQueryClient } from '@tanstack/react-query';
import type { DefaultOptions } from '@tanstack/react-query';

import { useClient } from '../context';

import { createQueryClientDefaultOptions } from '../utils';


/* --------
 * Internal Types
 * -------- */
interface UseQueryClientOptionsOutput {
  /**
   * Set the default options of the QueryClient.
   * A function that will return a function to clean the options and restore the original state.
   */
  setDefaultOptions: (options?: DefaultOptions) => () => void;
}


/* --------
 * Hook Definition
 * -------- */
export function useQueryClientOptions(): UseQueryClientOptionsOutput {

  // ----
  // Internal Hooks
  // ----
  const client = useClient();
  const queryClient = useQueryClient();


  // ----
  // Utilities
  // ----
  const setDefaultOptions = React.useCallback<UseQueryClientOptionsOutput['setDefaultOptions']>(
    (overrides) => {
      /** Get the current options of the client */
      const currentOptions = queryClient.getDefaultOptions();

      /** Create the default QueryClient options */
      const defaultOptions = createQueryClientDefaultOptions(client);

      /** Set the new options, merging the default options with the overrides */
      queryClient.setDefaultOptions(mergeObjects<DefaultOptions>(defaultOptions, overrides || {}));

      /** Return a function to restore the original options */
      return () => {
        /** Restore the original options */
        queryClient.setDefaultOptions(currentOptions);
      };
    },
    [ client, queryClient ]
  );


  // ----
  // Hook Return
  // ----
  return {
    setDefaultOptions
  };

}
