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
