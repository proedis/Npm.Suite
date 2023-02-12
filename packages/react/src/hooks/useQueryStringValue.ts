import * as React from 'react';

import { useQueryString } from './useQueryString';


/**
 * Use this hook to manage a single field of the current query string.
 * A utility function will be returned with the field value to help
 * easily change the value.
 *
 * @param field
 */
export function useQueryStringValue<T extends string | string[]>(field: string): [ T, (value: T) => void ] {

  // ----
  // Internal Hooks
  // ----
  const [ queryString, setQueryString ] = useQueryString();


  // ----
  // Memoized Callbacks
  // ----
  const setNewQueryStringValue = React.useCallback(
    (value: T) => setQueryString((curr) => {
      curr[field] = value;
      return curr;
    }),
    [ setQueryString, field ]
  );


  // ----
  // Hook Returns
  // ----
  return [ queryString[field] as T, setNewQueryStringValue ];

}
