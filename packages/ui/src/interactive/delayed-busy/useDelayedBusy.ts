'use client';

import * as React from 'react';


/**
 * `true` only once `busy` has lasted longer than `delayMs`.
 *
 * A fast answer does not flash a spinner: the combobox shows its spinner and its "searching" line
 * only when the server is slow. Private for now; it is published with the Loading guide.
 */
export function useDelayedBusy(busy: boolean, delayMs = 300): boolean {

  // ----
  // Internal State
  // ----
  const [ shown, setShown ] = React.useState(false);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (!busy) {
      const reset = window.setTimeout(() => setShown(false), 0);

      return () => window.clearTimeout(reset);
    }

    const timer = window.setTimeout(() => setShown(true), delayMs);

    return () => window.clearTimeout(timer);
  }, [ busy, delayMs ]);


  // ----
  // Hook Return
  // ----
  return busy && shown;

}
