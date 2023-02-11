import * as React from 'react';

import { useEnhancedEffect } from './useEnhancedEffect';


/* --------
 * Internal Types
 * -------- */
interface UseWindowSizeOptions {
  /** Disable the monitoring of the Window Size */
  disabled?: boolean;
}

interface WindowSize {
  /** The inner height of the window element */
  height: number;

  /** The inner width of the window element */
  width: number;
}


/**
 * Monitor the change of the Window Size.
 * Take careful that the object returned by the hook will never change:
 * to use value within hook dependencies must deconstruct internal properties
 *
 * @param options Set hook options
 *
 * @example
 *    // Do this
 *    const { height, width } = useWindowSize();
 *
 *    React.useEffect(
 *      () => {
 *        // Wonderful code...
 *      },
 *      [ height, width ]
 *    );
 */
export function useWindowSize(options?: UseWindowSizeOptions): WindowSize {

  const { disabled } = options || {};

  // ----
  // Internal State
  // ----
  const [ currentSize, setCurrentSize ] = React.useState<WindowSize>(() => ({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    width : typeof window !== 'undefined' ? window.innerWidth : 0
  }));


  // ----
  // Handler
  // ----
  const handleWindowSizeChange = React.useCallback(
    () => setCurrentSize((curr) => {
      curr.height = window.innerHeight;
      curr.width = window.innerWidth;
      return curr;
    }),
    []
  );


  // ----
  // Internal Hooks
  // ----
  useEnhancedEffect(
    () => {
      /** If hook has been disabled, avoid the event listen */
      if (disabled) {
        return;
      }

      /** Attach event to the window element to listen for resize change */
      window.addEventListener('resize', handleWindowSizeChange);

      /** On effect clear, remove the event attached to the window */
      return () => {
        window.removeEventListener('resize', handleWindowSizeChange);
      };
    },
    [ disabled, handleWindowSizeChange ]
  );


  // ----
  // Hook returns
  // ----
  return currentSize;

}
