import * as React from 'react';


/* --------
 * Internal Types
 * -------- */
export interface UseDataManagerResult<T> {
  /** Current selected item to delete */
  deleting: T | undefined;

  /** Clear the current deleting element */
  clearDeleting: () => void;

  /** Clear the current editing element */
  clearUpdating: () => void;

  /** Create a function that will be used to set the deleting element */
  createDeletingHandler: (element: T | undefined) => () => void;

  /** Create a function that will be used to set the updating element */
  createUpdatingHandler: (element: T | undefined) => () => void;

  /** Set the item to delete */
  setDeleting: (element: T | undefined) => void;

  /** Set the item to edit */
  setUpdating: (element: T | undefined) => void;

  /** Current selected item to update */
  updating: T | undefined;
}


/* --------
 * Hook Definition
 * -------- */
export function useDataManager<T>(): UseDataManagerResult<T> {

  // ----
  // Internal State
  // ----
  const [ deleting, setDeleting ] = React.useState<T | undefined>(undefined);
  const [ updating, setUpdating ] = React.useState<T | undefined>(undefined);


  // ----
  // Handlers
  // ----
  const clearDeleting = React.useCallback(
    () => setDeleting(undefined),
    []
  );

  const clearUpdating = React.useCallback(
    () => setUpdating(undefined),
    []
  );

  const createDeletingHandler = React.useCallback(
    (element: T | undefined) => () => setDeleting(element),
    []
  );

  const createUpdatingHandler = React.useCallback(
    (element: T | undefined) => () => setUpdating(element),
    []
  );


  // ----
  // Hook Return
  // ----
  return {
    deleting,
    clearDeleting,
    clearUpdating,
    createDeletingHandler,
    createUpdatingHandler,
    setDeleting,
    setUpdating,
    updating
  };

}
