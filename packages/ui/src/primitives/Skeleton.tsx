import * as React from 'react';

import { cva } from 'class-variance-authority';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import { DEFAULT_GAP_CLASS } from '../layout/defaultGap';
import { Stack } from '../layout/Stack';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */

export type SkeletonShape = 'text' | 'block' | 'pill' | 'field' | 'item';

/** The text a `text` skeleton stands for, by Tailwind's size names */
export type SkeletonTextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export interface StrictSkeletonProps extends BaseProps {
  /**
   * `text`, a line of text of `size`; `block`, a rectangle sized by `className`; `pill`, a badge;
   * `field`, a field at the height of an `md` control; `item`, the row of an `Item`: a square, a title
   * and a description. Defaults to `text`
   */
  shape?: SkeletonShape;

  /** Several lines of text, the last one shorter */
  lines?: number;

  /**
   * The size of the text a `text` skeleton stands for: each line is as tall as a line of that text, with
   * the bar half of it, so a paragraph of skeleton keeps the rhythm of the paragraph. Defaults to `sm`
   */
  size?: SkeletonTextSize;

  /** The width goes here, as a class: `w-1/2`, `w-24`. Last, so it wins */
  className?: string;
}
export type SkeletonProps = StrictSkeletonProps;


/* --------
 * Variants Definition
 * -------- */

const PULSE = 'animate-pulse bg-secondary motion-reduce:animate-none';

const skeletonVariants = cva(`block shrink-0 ${PULSE}`, {
  variants: {
    shape: {
      block: 'h-4 w-full rounded-sm',
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
  defaultVariants: { shape: 'block' }
});

/** The text size of a line, which gives it the height of a line of that text */
const TEXT_SIZE: Readonly<Record<SkeletonTextSize, string>> = {
  xs  : 'text-xs',
  sm  : 'text-sm',
  base: 'text-base',
  lg  : 'text-lg',
  xl  : 'text-xl',
  '2xl': 'text-2xl'
};


/* --------
 * Parts
 * -------- */

/** One line of text: a box one line of `size` tall, with the bar across its middle half */
function TextLine(props: { size: SkeletonTextSize; className?: string }): React.ReactNode {
  return (
    <Stack
      as={'span'}
      gap={0}
      justify={'center'}
      data-slot={'skeleton'}
      data-shape={'text'}
      data-size={props.size}
      className={cn('h-lh w-full shrink-0', TEXT_SIZE[props.size], props.className)}
    >
      <span data-slot={'skeleton-bar'} className={cn('block h-1/2 w-full rounded-sm', PULSE)} />
    </Stack>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The shape of what is coming, for a first load in a page or a card. Dialogs and drawers use the veil
 * instead.
 *
 * ```tsx
 * <Skeleton lines={3} className={'w-2/3'} />      // a paragraph of text-sm
 * <Skeleton size={'lg'} className={'w-1/3'} />    // a title
 * <Skeleton shape={'item'} />                     // the row of an Item
 * <Skeleton shape={'block'} className={'size-4'} />
 * ```
 *
 * The real header, titles, labels and frame are there from the start, still; the shapes appear after
 * 300ms (`useDelayedBusy`). It pulses, still with reduced motion, and it is always hidden from screen
 * readers: the container announces the wait with `aria-busy`.
 *
 * Parts with a slot: `skeleton` (with `data-shape`, and `data-size` on a line of text), `skeleton-bar`
 * inside a line, `skeleton-lines` around several lines, `skeleton-item` around the row.
 */
export function Skeleton(props: SkeletonProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    lines,
    shape = 'text',
    size = 'sm',
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  if (shape === 'item') {
    return (
      <Stack
        as={'span'}
        aria-hidden
        direction={'horizontal'}
        align={'center'}
        gap={0}
        data-slot={'skeleton-item'}
        className={cn(DEFAULT_GAP_CLASS.item, 'w-full', baseClasses, className)}
        {...rest}
      >
        <span data-slot={'skeleton'} data-shape={'block'} className={cn('block size-8 shrink-0 rounded-md', PULSE)} />
        <Stack as={'span'} gap={0} className={'min-w-0 flex-1'}>
          <TextLine size={'sm'} className={'w-2/5'} />
          <TextLine size={'xs'} className={'w-3/5'} />
        </Stack>
      </Stack>
    );
  }

  if (shape === 'text' && lines !== undefined && lines > 1) {
    return (
      <Stack as={'span'} aria-hidden data-slot={'skeleton-lines'} gap={0} className={cn(baseClasses, className)} {...rest}>
        {Array.from({ length: lines }, (_, index) => (
          <TextLine key={index} size={size} className={index === lines - 1 ? 'w-3/5' : undefined} />
        ))}
      </Stack>
    );
  }

  if (shape === 'text') {
    return (
      <Stack
        as={'span'}
        aria-hidden
        gap={0}
        justify={'center'}
        data-slot={'skeleton'}
        data-shape={'text'}
        data-size={size}
        className={cn('h-lh w-full shrink-0', TEXT_SIZE[size], baseClasses, className)}
        {...rest}
      >
        <span data-slot={'skeleton-bar'} className={cn('block h-1/2 w-full rounded-sm', PULSE)} />
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
