/* --------
 * Constants Definition
 * -------- */

/**
 * The class of the default gap of each component that has one, written where layout classes are
 * written. Each reads a variable of the theme, `--stack-gap` and the others, falling back to its step
 * of the scale (`ui.css`), and is used only where the prop is not declared: a declared gap writes its
 * own class.
 *
 * Private to the package: no barrel exports it. `Item` and `Heading` import it by relative path, so
 * their default moves with the theme like the layout primitives' own.
 */
export const DEFAULT_GAP_CLASS = {
  stack  : 'gap-stack',
  cluster: 'gap-cluster',
  grid   : 'gap-grid',
  split  : 'gap-split',
  item   : 'gap-item',
  heading: 'gap-heading'
} as const;
