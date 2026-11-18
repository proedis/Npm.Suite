'use client';

import * as React from 'react';


/* --------
 * Types Definition
 * -------- */

export interface DelayedBusyOptions {
  /** How long a wait lasts before it shows. Defaults to 300ms: a fast answer flashes nothing */
  delay?: number;

  /** How long, once shown, the indicator stays at least. Defaults to 400ms: it never blinks */
  minDuration?: number;
}

export interface DelayedBusy {
  /** At once: block the clicks, set `aria-busy`, make a dialog `inert`. No double submit in the first 300ms */
  busy: boolean;

  /** Later: the look of the wait, a skeleton, a bar, a veil, a spinner */
  visible: boolean;
}


/* --------
 * Hook Definition
 * -------- */

/**
 * The timing every wait shares, in two values: the block comes at once, the look after 300ms, and
 * once shown it stays at least 400ms.
 *
 * ```tsx
 * const wait = useDelayedBusy(query.isFetching);
 *
 * <div aria-busy={wait.busy}>
 *   {wait.visible && <LoadingBar />}
 * </div>
 * ```
 *
 * Data that arrives is shown at once and replaces a skeleton: the minimum holds only the indicator
 * (a bar, a veil, a spinner), which is what `visible` drives.
 */
export function useDelayedBusy(busy: boolean, options: DelayedBusyOptions = {}): DelayedBusy {

  // ----
  // Options Deconstruct
  // ----
  const { delay = 300, minDuration = 400 } = options;


  // ----
  // Internal State
  // ----
  const [ visible, setVisible ] = React.useState(false);
  const shownAtRef = React.useRef(0);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (busy) {
      if (visible) {
        return undefined;
      }

      const timer = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delay);

      return () => window.clearTimeout(timer);
    }

    if (!visible) {
      return undefined;
    }

    const left = Math.max(0, minDuration - (Date.now() - shownAtRef.current));
    const timer = window.setTimeout(() => setVisible(false), left);

    return () => window.clearTimeout(timer);
  }, [ busy, visible, delay, minDuration ]);


  // ----
  // Hook Return
  // ----
  return { busy, visible };

}
