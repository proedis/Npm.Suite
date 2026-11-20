import * as React from 'react';

import { cn } from '@proedis/ui/core';


/* --------
 * Component Definition
 * -------- */

/** A name of the API inside a sentence: a prop, a value, a slot */
export function InlineCode(props: React.ComponentProps<'code'>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...rest } = props;


  // ----
  // Component Render
  // ----
  return (
    <code
      className={cn('rounded-sm bg-muted px-1 py-0.5 font-mono text-foreground', className)}
      {...rest}
    />
  );

}

InlineCode.displayName = 'InlineCode';
