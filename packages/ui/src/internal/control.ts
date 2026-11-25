import type { ControlSize } from '../core/control';


/* --------
 * Constants Definition
 * -------- */

/**
 * The height of each control size, the one place it is written.
 *
 * Every control composes its size from this map, so a control cannot be one step off the others: that
 * is the rule `ControlSize` states, and the lint of the repository forbids an `h-control-*` anywhere
 * else in the package. The heights themselves are `--spacing-control-*` in `theme.css`: 32, 36 and
 * 40px, one step larger under a coarse pointer.
 */
export const CONTROL_HEIGHT: Readonly<Record<ControlSize, string>> = {
  sm: 'h-control-sm',
  md: 'h-control-md',
  lg: 'h-control-lg'
};
