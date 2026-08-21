'use client';

import { useMediaQuery } from './useMediaQuery';


/* --------
 * Constants Definition
 * -------- */
const QUERY = '(prefers-reduced-motion: reduce)';


/* --------
 * Hook Definition
 * -------- */

/**
 * Whether the user asked the system to reduce motion.
 *
 * For animation driven from JavaScript — a spring, a scroll interpolation, an autoplaying carousel.
 * A transition written in CSS does **not** need this: `@media (prefers-reduced-motion: reduce)`
 * answers the same question where the animation lives, without shipping a hook to the client.
 *
 * ```tsx
 * const still = usePrefersReducedMotion();
 * <motion.div animate={still ? {} : { y: 0 }} />
 * ```
 *
 * ⚠️ It answers **`true`** with no `window` and on the first client render, unlike every other hook
 * here, and the asymmetry is on purpose: the two possible mistakes are not equivalent. Guessing
 * "reduce" and correcting to "animate" costs one frame of stillness; guessing the other way plays
 * the animation this preference exists to prevent, to the person who asked for it not to.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(QUERY, true);
}
