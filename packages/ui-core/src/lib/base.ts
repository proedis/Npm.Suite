import type { MediaBreakpoint } from './responsive';


/* --------
 * Types Definition
 * -------- */

/**
 * The props every primitive in this package accepts, on top of its own.
 *
 * This is the shared contract, and it exists so that adding one is a change to **this file** rather
 * than to seventeen components. It is deliberately not a `Box`: see the note on `splitBaseProps` for
 * what earns a place here and what does not.
 */
export interface BaseProps {
  /**
   * Hide below a breakpoint, i.e. show from it up.
   *
   * ```tsx
   * <Stack hideBelow={'lg'}>…</Stack>   // the desktop half of a layout
   * ```
   */
  hideBelow?: MediaBreakpoint;

  /**
   * Hide from a breakpoint up, i.e. show below it.
   *
   * ```tsx
   * <Stack hideFrom={'lg'}>…</Stack>    // the mobile half
   * ```
   */
  hideFrom?: MediaBreakpoint;
}


/* --------
 * Helpers
 * -------- */

/**
 * Split the shared props out of a component's own, returning their classes and everything else.
 *
 * ```tsx
 * const { as: Component = 'div', className, gap, ...others } = props;
 * const { baseClasses, rest } = splitBaseProps(others);
 *
 * return <Component className={cn(classes, baseClasses, className)} {...rest} />;
 * ```
 *
 * The order in that `cn` is the contract: the component's own classes, then the shared ones, then
 * `className` last so a consumer's override still wins over both.
 *
 * ## Why `not-*` rather than a display to restore
 *
 * `hideBelow` compiles to `not-lg:hidden`, a single class that applies `display: none` **only** inside
 * a negated media query. Above the breakpoint no rule matches the element at all, so its own display
 * is untouched, whatever it happens to be — `flex`, `grid`, `contents`, the browser default.
 *
 * That is not a stylistic preference, it is the reason this helper can be generic. The obvious
 * implementation is the pair `hidden lg:flex`, which has to name the display it restores, and
 * measurement says naming it wrong fails silently: `flex flex-col gap-4` plus `lg:contents` resolves
 * to `flex-col gap-4 hidden lg:contents`, so above `lg` the element is `display: contents` and the
 * `flex-col` and `gap-4` it still carries are **inert**. A stack that loses its gap at one breakpoint,
 * with nothing reported anywhere. A helper that had to be told the display would put that mistake one
 * argument away from every call site; `not-*` removes the argument.
 *
 * It also costs five safelist entries instead of one per display per breakpoint.
 *
 * ## What earns a place in `BaseProps`
 *
 * One of two things, and nothing else:
 *
 * 1. **A consumer could not write it as a literal class.** Anything built from a value at runtime is
 *    invisible to the Tailwind scanner, so it needs a safelist entry — that is the whole reason these
 *    props exist rather than being left to `className`.
 * 2. **It needs knowledge the component has and the caller does not** — its own axis, its own
 *    padding, its own display.
 *
 * ⚠️ `p`, `m`, `w`, `bg`, `rounded` and the rest of the style-prop family fail both: they are already
 * writable as `className={'p-4 lg:p-8'}`, where the scanner finds them for free. This is the road to
 * the sixty style props of a UI kit that has no utility class layer to lean on, and this package has
 * one. `p` / `px` / `py` alone, made responsive, would be 324 safelist rules — more than everything
 * this stylesheet declares today.
 */
export function splitBaseProps<P extends BaseProps>(props: P): {
  baseClasses: string[];
  rest: Omit<P, keyof BaseProps>;
} {

  // ----
  // Props Deconstruct
  // ----
  const { hideBelow, hideFrom, ...rest } = props;


  // ----
  // Classes Computation
  // ----
  const baseClasses = [
    hideBelow !== undefined && `not-${hideBelow}:hidden`,
    hideFrom !== undefined && `${hideFrom}:hidden`
  ].filter((value): value is string => typeof value === 'string');


  // ----
  // Return
  // ----
  return { baseClasses, rest };

}
