/* --------
 * Types Definition
 * -------- */

/**
 * How a rail of choices stands on the page, shared by `SegmentedControl` and `Tabs`, which differ in what
 * they mean and not in how they look. `contained`: a grey rail with an inner line. `elevated`: a white
 * rail raised like a card. `plain`: no rail at all, only the fill that slides under the chosen item.
 */
export type RailVariant = 'contained' | 'elevated' | 'plain';


/* --------
 * Constants Definition
 * -------- */

/** The surface of the rail per variant; its geometry (padding, radius, height) is each component's */
export const RAIL_SURFACE: Readonly<Record<RailVariant, string>> = {
  contained: 'bg-muted inset-ring inset-ring-border',
  elevated : 'bg-card shadow-sm',
  plain    : 'bg-transparent'
};


/** The corner of a rail: the theme's, a step of the scale, or a pill. Its items follow it, concentric */
export type RailRadius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/** What sets the corner of one rail; `default` sets nothing and the theme's variable is read */
export const RAIL_RADIUS: Readonly<Record<RailRadius, string | undefined>> = {
  default: undefined,
  none   : 'rail-radius-none',
  sm     : 'rail-radius-sm',
  md     : 'rail-radius-md',
  lg     : 'rail-radius-lg',
  xl     : 'rail-radius-xl',
  '2xl'  : 'rail-radius-2xl',
  full   : 'rail-radius-full'
};
