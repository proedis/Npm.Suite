import * as React from 'react';

import { splitBaseProps } from '../lib/base';
import { cn } from '../lib/cn';

import type { BaseProps } from '../lib/base';
import type { PolymorphicProps } from '../lib/polymorphic';


/* --------
 * Types Definition
 * -------- */
export type BoxProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, BaseProps>;


/* --------
 * Component Definition
 * -------- */

/**
 * Any element, with the shared props and nothing else.
 *
 * ```tsx
 * <Box hideBelow={'lg'} className={'rounded-lg border p-4'}>…</Box>
 * <Box as={'a'} href={'/reports'} hideFrom={'md'}>…</Box>
 * <Box as={'section'} aria-labelledby={'title'}>…</Box>
 * ```
 *
 * It is the bottom of this package: the element the other primitives would be if you took their
 * layout away. Reach for it when a plain element needs one of the shared props, or when a one-off
 * arrangement does not deserve a named component.
 *
 * ## Wrapping a group without joining its layout
 *
 * A `Box` is whatever its element is, so around the children of a flex or grid parent it becomes an
 * item of that layout. When the point is only to hide a **group**, ask for `contents`:
 *
 * ```tsx
 * <Stack direction={'horizontal'} gap={4}>
 *   <Box className={'contents'} hideBelow={'lg'}>
 *     <Toolbar />
 *     <Filters />
 *   </Box>
 * </Stack>
 * ```
 *
 * With `display: contents` the wrapper stops existing as far as layout goes and both children stay
 * direct participants of the stack, gap included. Below `lg` the `not-lg:hidden` rule wins over it
 * and the group disappears. It is a literal class rather than a prop on purpose: the scanner finds it
 * for free, which is exactly the criterion for what does **not** become a shared prop.
 *
 * ⚠️ `contents` is right **here** and wrong on a primitive that owns a layout: on a `Stack` it would
 * leave the component's own `gap` and alignment inert, silently.
 *
 * ## What it is not
 *
 * Not a style-prop carrier. No `p`, `m`, `w`, `bg`, `rounded`: in a Tailwind codebase `className`
 * plus the conflict resolution in `cn` already is that system, and duplicating it as props buys a
 * narrower API and a much larger safelist. See `BaseProps` for the two things that do earn a place.
 *
 * ⚠️ Hiding is CSS, not conditional rendering. The children stay **mounted**: their effects run,
 * their requests fire, their markup ships in the payload. Use `useIsMobile` from
 * `@proedis/ui-core/hooks` and render nothing when a subtree has a cost.
 */
export function Box<E extends React.ElementType = 'div'>(props: BoxProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    ...others
  } = props as BoxProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----

  /** Undefined rather than an empty string: a plain `<Box>` must not render a `class=""` */
  const classes = cn(baseClasses, className) || undefined;

  return <Component data-slot={'box'} className={classes} {...rest} />;

}

Box.displayName = 'Box';
