import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import { VisuallyHidden } from './VisuallyHidden';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';


/* --------
 * Constants Definition
 * -------- */

/** One source for the default, because `cva` applies it and the component has to report it */
const DEFAULT_SIZE = 'md';


/* --------
 * Variants Definition
 * -------- */

/**
 * A ring with one transparent quarter, spun by CSS.
 *
 * `border-current` and `text-*` are what colour it: the spinner inherits the ink of whatever it sits
 * in, so it needs no tone of its own and no token beyond the one its parent already set. That is the
 * whole reason it can live this low in the package.
 *
 * ⚠️ `motion-reduce:animate-none` is not decoration. A spinner is the most common animation on a
 * screen and it runs unattended for as long as a request takes; someone who asked the system to
 * reduce motion asked about exactly this.
 */
const spinnerVariants = cva(
  'inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent motion-reduce:animate-none',
  {
    variants       : {
      size: {
        xs: 'size-3 border',
        sm: 'size-4 border-2',
        md: 'size-5 border-2',
        lg: 'size-8 border-2'
      }
    },
    defaultVariants: {
      size: DEFAULT_SIZE
    }
  }
);


/* --------
 * Types Definition
 * -------- */
export interface StrictSpinnerProps extends BaseProps, VariantProps<typeof spinnerVariants> {
  /**
   * What a screen reader announces while this is on screen.
   *
   * Declaring it turns the spinner into a live region; leaving it out marks the spinner
   * `aria-hidden`, which is correct when the surrounding text already says what is happening. One of
   * the two is always right, and the default is the quiet one.
   */
  label?: string;
}

export type SpinnerProps<E extends React.ElementType = 'span'> = PolymorphicProps<E, StrictSpinnerProps>;


/* --------
 * Component Definition
 * -------- */

/**
 * The house spinner: a CSS ring, no icon library, no markup.
 *
 * ```tsx
 * <Spinner />                                     // inside a button, next to its label
 * <Spinner size={'lg'} label={'Caricamento'} />   // on its own, announced
 * ```
 *
 * It exists as its own component for a reason worth knowing: both frontends this package draws on
 * reach for `Loader2` from `lucide-react`, which puts an **icon library** on the critical path of a
 * loading state. Here the same shape is four borders and one keyframe, and it colours itself from
 * `currentColor`, so a package whose entire runtime is `clsx`, `tailwind-merge` and `cva` stays that
 * way.
 */
export function Spinner<E extends React.ElementType = 'span'>(props: SpinnerProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'span',
    className,
    label,
    size = DEFAULT_SIZE,
    ...others
  } = props as SpinnerProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----

  /** Announced when it carries a label, invisible to assistive tech when it does not */
  const semantics = label === undefined
    ? { 'aria-hidden': true }
    : { 'aria-live': 'polite' as const, role: 'status' };

  return (
    <Component
      data-slot={'spinner'}
      data-size={size}
      className={cn(spinnerVariants({ size }), baseClasses, className)}
      {...semantics}
      {...rest}
    >
      {label !== undefined && <VisuallyHidden>{label}</VisuallyHidden>}
    </Component>
  );

}

Spinner.displayName = 'Spinner';
