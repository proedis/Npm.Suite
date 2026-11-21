import * as React from 'react';

import { cva } from 'class-variance-authority';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import { Stack } from '../layout/Stack';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */

export type SkeletonShape = 'text' | 'pill' | 'field';

export interface SkeletonProps extends BaseProps {
  /** A line of text (10px), a badge (20px), a field (the control height). Defaults to `text` */
  shape?: SkeletonShape;

  /** Several lines of text, the last one shorter */
  lines?: number;

  /** The width goes here, as a class: `w-1/2`, `w-24`. Last, so it wins */
  className?: string;
}


/* --------
 * Variants Definition
 * -------- */

const skeletonVariants = cva(
  'block shrink-0 animate-pulse bg-secondary motion-reduce:animate-none',
  {
    variants: {
      shape: {
        text : 'h-2.5 w-full rounded-sm',
        pill : 'h-5 w-16 rounded-full',
        /*
         * The placeholder of a field, at the height of an `md` control. Written here because `primitives`
         * comes before `internal`, where `CONTROL_HEIGHT` lives: it reads the same variable, so it moves
         * with the controls it stands in for.
         */
        // eslint-disable-next-line no-restricted-syntax -- the shape of an md field, see above
        field: 'h-control-md w-full rounded-md'
      }
    },
    defaultVariants: { shape: 'text' }
  }
);


/* --------
 * Component Definition
 * -------- */

/**
 * The shape of what is coming, for a first load in a page or a card. Dialogs and drawers use the veil
 * instead.
 *
 * ```tsx
 * <Skeleton shape={'pill'} />
 * <Skeleton lines={3} className={'w-2/3'} />
 * ```
 *
 * The real header, titles, labels and frame are there from the start, still; the shapes appear after
 * 300ms (`useDelayedBusy`). It pulses, still with reduced motion, and it is always hidden from screen
 * readers: the container announces the wait with `aria-busy`.
 *
 * Parts with a slot: `skeleton` (with `data-shape`), and `skeleton-lines` around several lines.
 */
export function Skeleton(props: SkeletonProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    lines,
    shape = 'text',
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  if (shape === 'text' && lines !== undefined && lines > 1) {
    return (
      <Stack as={'span'} aria-hidden data-slot={'skeleton-lines'} gap={2.5} className={cn(baseClasses, className)} {...rest}>
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            data-slot={'skeleton'}
            data-shape={'text'}
            className={cn(skeletonVariants({ shape: 'text' }), index === lines - 1 && 'w-3/5')}
          />
        ))}
      </Stack>
    );
  }

  return (
    <span
      aria-hidden
      data-slot={'skeleton'}
      data-shape={shape}
      className={cn(skeletonVariants({ shape }), baseClasses, className)}
      {...rest}
    />
  );

}

Skeleton.displayName = 'Skeleton';


export { skeletonVariants };
