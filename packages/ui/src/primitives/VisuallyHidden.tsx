import * as React from 'react';

import { cn } from '../core/cn';

import type { PolymorphicProps } from '../core/polymorphic';


/* --------
 * Types Definition
 * -------- */
export interface StrictVisuallyHiddenProps {
  /**
   * Bring the content back into view once it receives focus.
   *
   * The shape a skip link needs: invisible until a keyboard user tabs to it, and then a normal
   * visible control. Leave it off for content that is only ever meant for a screen reader.
   */
  focusable?: boolean;

}


export type VisuallyHiddenProps<E extends React.ElementType = 'span'> = PolymorphicProps<E, StrictVisuallyHiddenProps>;


/* --------
 * Component Definition
 * -------- */

/**
 * Content for a screen reader and not for the eye.
 *
 * The opposite of `Show`, and the distinction is the whole reason both exist: `Show` hides from
 * **everyone**, this hides from sight while keeping the content in the accessibility tree. A label
 * an icon-only button needs, the word "current" next to a highlighted page, the unit of a number
 * that is obvious visually and silent otherwise.
 *
 * ```tsx
 * <button><Icon /><VisuallyHidden>Delete</VisuallyHidden></button>
 * <VisuallyHidden as={'a'} focusable href={'#main'}>Skip to content</VisuallyHidden>
 * ```
 *
 * `display: none` and `visibility: hidden` are what this is **not**: both remove the content from
 * the accessibility tree, which is precisely the opposite of the intent. The clipping technique
 * behind `sr-only` is Tailwind's own.
 */
export function VisuallyHidden<E extends React.ElementType = 'span'>(props: VisuallyHiddenProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'span',
    className,
    focusable = false,
    ...rest
  } = props as VisuallyHiddenProps<'span'>;


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'visually-hidden'}
      data-focusable={focusable || undefined}
      className={cn('sr-only', focusable && 'focus:not-sr-only', className)}
      {...rest}
    />
  );

}

VisuallyHidden.displayName = 'VisuallyHidden';
