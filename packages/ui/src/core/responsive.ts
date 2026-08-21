/* --------
 * Breakpoints
 * -------- */

/**
 * The breakpoint vocabulary, shared by the class builders below and by the media-query hooks.
 *
 * `base` is mobile and carries **no** Tailwind prefix, which is what makes the whole system
 * mobile-first: a value declared at `base` applies everywhere until a wider breakpoint overrides it.
 */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';


/** Every breakpoint except `base`, i.e. the ones that are an actual media query */
export type MediaBreakpoint = Exclude<Breakpoint, 'base'>;


/** Mobile-first order. Iterating this is what keeps the emitted classes in cascade order */
export const BREAKPOINTS: readonly Breakpoint[] = [ 'base', 'sm', 'md', 'lg', 'xl', '2xl' ];


/**
 * The default pixel width of each breakpoint, matching Tailwind's own scale.
 *
 * Only the hooks need the numbers — the class builders never do, because Tailwind resolves the
 * prefixes itself. A project that changed the scale in its theme can hand its own values over, and
 * `useBreakpoint` also tries to read them from the `--breakpoint-*` theme variables first.
 */
export const BREAKPOINT_WIDTHS: Readonly<Record<MediaBreakpoint, number>> = {
  sm : 640,
  md : 768,
  lg : 1024,
  xl : 1280,
  '2xl': 1536
};


/* --------
 * Responsive Values
 * -------- */

/**
 * A single value, or one value per breakpoint.
 *
 * ```tsx
 * <Stack gap={4} />
 * <Stack gap={{ base: 2, lg: 6 }} direction={{ base: 'vertical', lg: 'horizontal' }} />
 * ```
 */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;


/**
 * The spacing steps a gap may take.
 *
 * A **union, not `number`**, and that is the point: the classes these props produce are declared
 * once in the package's stylesheet, so a value outside this scale would build a class that has no
 * CSS behind it — a component silently losing its gap, with no error anywhere. Here it does not
 * compile.
 */
export type SpacingValue = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 14 | 16;


/** The column counts a grid may take. Same reasoning as `SpacingValue` */
export type ColumnsValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;


/** The axis children are laid out along */
export type Direction = 'horizontal' | 'vertical';


/**
 * Cross-axis alignment.
 *
 * Declared here rather than on a component because three of them share it, and the maps that turn
 * these into classes were literally the same twenty lines in `Stack` and `Cluster` — in a package
 * whose reason to exist is that five layout files were the same file twice.
 */
export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';


/** Main-axis distribution */
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';


/* --------
 * Helpers
 * -------- */

/** The Tailwind prefix of a breakpoint. `base` has none, which is what makes it the mobile default */
export function breakpointPrefix(breakpoint: Breakpoint): string {
  return breakpoint === 'base' ? '' : `${breakpoint}:`;
}


/** Normalize a responsive value into a per-breakpoint map */
export function toResponsiveMap<T>(value: Responsive<T> | undefined): Partial<Record<Breakpoint, T>> {
  if (value === null || value === undefined) {
    return {};
  }

  /** An array is a value, not a map — `Responsive<T>` allows any `T`, arrays included */
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Partial<Record<Breakpoint, T>>;
  }

  return { base: value as T };
}


/** The declared breakpoints of a responsive value, in mobile-first order */
export function responsiveEntries<T>(value: Responsive<T> | undefined): [ Breakpoint, T ][] {
  const map = toResponsiveMap(value);

  return BREAKPOINTS
    .filter(breakpoint => map[breakpoint] !== undefined)
    .map(breakpoint => [ breakpoint, map[breakpoint] as T ]);
}


/* --------
 * Constants
 * -------- */

/** The one place the alignment utilities are named. Both maps used to be duplicated per component */
const ALIGN: Readonly<Record<Align, string>> = {
  baseline: 'items-baseline',
  center  : 'items-center',
  end     : 'items-end',
  start   : 'items-start',
  stretch : 'items-stretch'
};

const JUSTIFY: Readonly<Record<Justify, string>> = {
  around : 'justify-around',
  between: 'justify-between',
  center : 'justify-center',
  end    : 'justify-end',
  evenly : 'justify-evenly',
  start  : 'justify-start'
};


/* --------
 * Class Builders
 * -------- */

/**
 * Turn a responsive value into one prefixed class per declared breakpoint.
 *
 * The generic form every builder below is made of: `build` receives a value and returns the
 * **unprefixed** utility, and the prefix is added here so no caller has to think about the cascade.
 *
 * @param value - The responsive value.
 * @param build - Utility for one value, without a breakpoint prefix. Return several, space
 *  separated, when one value needs more than one utility.
 */
export function responsiveClasses<T>(
  value: Responsive<T> | undefined,
  build: (value: T) => string
): string[] {
  return responsiveEntries(value).map(([ breakpoint, entry ]) => (
    build(entry)
      .split(' ')
      .filter(Boolean)
      .map(utility => `${breakpointPrefix(breakpoint)}${utility}`)
      .join(' ')
  ));
}


/** `gap-*`, responsive */
export function gapClasses(gap: Responsive<SpacingValue> | undefined): string[] {
  return responsiveClasses(gap, value => `gap-${value}`);
}


/** `grid-cols-*`, responsive */
export function columnsClasses(columns: Responsive<ColumnsValue> | undefined): string[] {
  return responsiveClasses(columns, value => `grid-cols-${value}`);
}


/** `flex-row` / `flex-col`, responsive */
export function directionClasses(direction: Responsive<Direction> | undefined): string[] {
  return responsiveClasses(direction, value => (value === 'horizontal' ? 'flex-row' : 'flex-col'));
}


/**
 * `items-*`, responsive.
 *
 * Responsive on purpose, and it is the pair of `direction` that needed it most: a stack that turns
 * from a column into a row at `lg` almost always wants `stretch` while it is a column and `center`
 * once it is a row. It used to be the one half of that pair which could not follow.
 */
export function alignClasses(align: Responsive<Align> | undefined): string[] {
  return responsiveClasses(align, value => ALIGN[value]);
}


/** `justify-*`, responsive */
export function justifyClasses(justify: Responsive<Justify> | undefined): string[] {
  return responsiveClasses(justify, value => JUSTIFY[value]);
}


/**
 * `divide-x` / `divide-y`, responsive — and the reset of the other axis.
 *
 * The reset is the part that is easy to miss: a stack whose direction switches at a breakpoint would
 * otherwise keep both rules drawn from there on, because `divide-y` declared at `base` is still in
 * effect when `divide-x` arrives at `lg`.
 */
export function divideClasses(direction: Responsive<Direction> | undefined): string[] {
  return responsiveClasses(direction, value => (
    value === 'horizontal' ? 'divide-x divide-y-0' : 'divide-y divide-x-0'
  ));
}


/** The `min-width` media query of a breakpoint, from the widths in use */
export function mediaQuery(
  breakpoint: MediaBreakpoint,
  widths: Readonly<Record<MediaBreakpoint, number>> = BREAKPOINT_WIDTHS
): string {
  return `(min-width: ${widths[breakpoint]}px)`;
}
