import * as React from 'react';

import { cn } from '../lib/cn';


/* --------
 * Types Definition
 * -------- */
export interface AspectRatioProps extends React.ComponentProps<'div'> {
  /** Width over height: `16 / 9`, `1`, `4 / 3` */
  ratio?: number;
}


/* --------
 * Component Definition
 * -------- */

/**
 * Holds a child — an image, a map, a video, an embed — at a fixed ratio.
 *
 * The child is stretched to fill the box, and an image or a video is cropped rather than distorted.
 * The inner absolute layer is what makes that work for a child that has no intrinsic size of its
 * own, like a map canvas.
 */
export function AspectRatio(props: AspectRatioProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    ratio = 16 / 9,
    style,
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  return (
    <div
      data-slot={'aspect-ratio'}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...rest}
    >
      <div className={'absolute inset-0 [&>*]:size-full [&>img]:object-cover [&>video]:object-cover'}>
        {children}
      </div>
    </div>
  );

}

AspectRatio.displayName = 'AspectRatio';
