'use client';

import * as React from 'react';

import { BREAKPOINT_WIDTHS, mediaQuery } from '../core/responsive';

import { useMediaQuery } from './useMediaQuery';

import type { MediaBreakpoint } from '../core/responsive';


/* --------
 * Types Definition
 * -------- */
export interface UseBreakpointOptions {
  /**
   * Override the pixel widths.
   *
   * Only needed when the Tailwind theme changed the scale **and** did not expose it as
   * `--breakpoint-*` variables, which is the first place this hook looks.
   */
  widths?: Readonly<Record<MediaBreakpoint, number>>;
}


/* --------
 * Helpers
 * -------- */

/**
 * Read a breakpoint width from the Tailwind theme, falling back to the default scale.
 *
 * Tailwind 4 publishes its breakpoints as `--breakpoint-sm` and friends, so a project that moved the
 * scale is followed automatically instead of drifting from it — which is the whole reason this hook
 * exists rather than a hardcoded `768` at each call site.
 */
function resolveWidth(
  breakpoint: MediaBreakpoint,
  widths: Readonly<Record<MediaBreakpoint, number>> = BREAKPOINT_WIDTHS
): number {
  if (typeof document === 'undefined') {
    return widths[breakpoint];
  }

  const declared = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${breakpoint}`)
    .trim();

  if (!declared) {
    return widths[breakpoint];
  }

  /** The theme states them in rem; anything unparseable falls back rather than producing `NaNpx` */
  const parsed = parseFloat(declared);

  if (Number.isNaN(parsed)) {
    return widths[breakpoint];
  }

  return declared.endsWith('rem') ? parsed * 16 : parsed;
}


/* --------
 * Hook Definition
 * -------- */

/**
 * Whether the viewport is **at or above** a breakpoint, matching the mobile-first meaning of the
 * `sm:` / `md:` prefixes — so the JavaScript and the classes speak the same language.
 *
 * ```tsx
 * const isDesktop = useBreakpoint('lg');
 * ```
 *
 * Server-side, and on the first client render, it answers `false`: the layout settles after
 * hydration instead of mismatching it. Render what mobile should see and let the wide layout arrive.
 *
 * @param breakpoint - Any breakpoint except `base`, which is always true by definition.
 * @param options - See `UseBreakpointOptions`.
 */
export function useBreakpoint(breakpoint: MediaBreakpoint, options?: UseBreakpointOptions): boolean {

  // ----
  // Memoized Data
  // ----
  const { widths } = options ?? {};

  const query = React.useMemo(
    () => mediaQuery(breakpoint, { ...BREAKPOINT_WIDTHS, ...widths, [breakpoint]: resolveWidth(breakpoint, widths) }),
    [ breakpoint, widths ]
  );


  // ----
  // Hook Return
  // ----

  /**
   * The subscription itself lives in `useMediaQuery`: this hook is the breakpoint vocabulary on top
   * of it, nothing more. Both used to be the same forty lines, which is how the generic query stayed
   * unreachable for so long.
   */
  return useMediaQuery(query);

}
