'use client';

import * as React from 'react';


/* --------
 * Hook Definition
 * -------- */

/**
 * Whether a media query matches, kept in sync with the browser.
 *
 * The primitive the other two hooks are built on, and exported because a named breakpoint is not the
 * only question worth asking: `(prefers-reduced-motion: reduce)`, `(prefers-contrast: more)`,
 * `print`, `(orientation: landscape)`, `(hover: hover)` and a width outside the theme's scale all
 * end here. Before this it was reachable only by going through a breakpoint name.
 *
 * ```tsx
 * const isLandscape = useMediaQuery('(orientation: landscape)');
 * const canHover = useMediaQuery('(hover: hover)');
 * ```
 *
 * `useSyncExternalStore` rather than an effect with a `setState`: it takes a server snapshot as an
 * argument, which is what turns a hydration-safe read into one line instead of the mounted-guard
 * dance. The same snapshot is used for the **first client render**, so it has to be the answer that
 * is safe to be wrong about for one frame.
 *
 * @param query - Any CSS media query, as `window.matchMedia` accepts it.
 * @param serverSnapshot - What to answer with no `window` and on the first client render. Defaults
 *  to `false`, i.e. "does not match".
 */
export function useMediaQuery(query: string, serverSnapshot: boolean = false): boolean {

  // ----
  // Handlers
  // ----
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);

      list.addEventListener('change', onStoreChange);

      return () => list.removeEventListener('change', onStoreChange);
    },
    [ query ]
  );

  const getSnapshot = React.useCallback(() => window.matchMedia(query).matches, [ query ]);

  const getServerSnapshot = React.useCallback(() => serverSnapshot, [ serverSnapshot ]);


  // ----
  // Hook Return
  // ----
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

}
