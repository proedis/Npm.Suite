'use client';

import * as React from 'react';

import { useUnmountEffect } from './useUnmountEffect';


/* --------
 * Types Definition
 * -------- */

/** The text to render in a live region, and the function that announces a new one */
export type Announcer = readonly [ message: string, announce: (text: string | null | undefined) => void ];


/* --------
 * Hook Definition
 * -------- */

/**
 * The text of a live region, announced again even when it repeats.
 *
 * ```tsx
 * const [ message, announce ] = useAnnouncer();
 *
 * <button onClick={() => { remove(file); announce(`${file.name} removed`); }}>Remove</button>
 * <span role={'status'} className={'sr-only'}>{message}</span>
 * ```
 *
 * A screen reader speaks a live region when its content changes, so setting the same text twice in
 * a row says nothing the second time: two files with the same name removed one after the other, the
 * same sort applied again. `announce` empties the region first and writes the text on the next task,
 * which makes every call a change.
 *
 * A call replaces one still pending, so only the last text is spoken; an empty text is ignored, so
 * an optional label can be passed as it is. The region itself is the caller's: the hook renders
 * nothing, and the element, its role and its slot stay where the component decides.
 */
export function useAnnouncer(): Announcer {

  // ----
  // Internal State
  // ----
  const [ message, setMessage ] = React.useState('');
  const timerRef = React.useRef<number | null>(null);


  // ----
  // Handlers
  // ----
  const announce = React.useCallback((text: string | null | undefined): void => {
    if (!text) {
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setMessage('');

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setMessage(text);
    });
  }, []);


  // ----
  // Lifecycle Events
  // ----
  useUnmountEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
  });


  return [ message, announce ] as const;

}
