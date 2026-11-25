import * as React from 'react';

import { cn } from '@proedis/ui/core';


/* --------
 * Component Definition
 * -------- */

/**
 * A tinted placeholder for the layout examples: a box with a label, so the geometry of a primitive
 * is visible. Not part of the package, only of these pages.
 */
export function Block(props: React.ComponentProps<'div'>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...rest } = props;


  // ----
  // Component Render
  // ----
  return (
    <div
      className={cn(
        'rounded-md border border-info/25 bg-info-soft px-3 py-2 font-mono text-xs text-info-soft-foreground',
        className
      )}
      {...rest}
    />
  );

}

Block.displayName = 'Block';
