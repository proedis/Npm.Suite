'use client';

import { useBreakpoint } from './useBreakpoint';

import type { MediaBreakpoint } from '../core/responsive';
import type { UseBreakpointOptions } from './useBreakpoint';


/* --------
 * Hook Definition
 * -------- */

/**
 * Whether the viewport is **below** a breakpoint — the mirror of `useBreakpoint`, for the reading a
 * mobile layout actually wants.
 *
 * ```tsx
 * const isMobile = useIsMobile();          // below md
 * const isNarrow = useIsMobile('lg');      // below lg
 * ```
 *
 * Server-side it answers `false`, i.e. "assume desktop", and the mobile layout arrives after
 * hydration. Reach for it only where CSS cannot do the job — a component that renders a bottom sheet
 * instead of a dialog, not one that changes its padding.
 *
 * @param below - The breakpoint to stay under. Defaults to `md`.
 * @param options - See `UseBreakpointOptions`.
 */
export function useIsMobile(below: MediaBreakpoint = 'md', options?: UseBreakpointOptions): boolean {
  return !useBreakpoint(below, options);
}
