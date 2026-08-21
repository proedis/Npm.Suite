import * as React from 'react';

import { cn } from '../lib/cn';


/* --------
 * Types Definition
 * -------- */
export interface DividerProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** A caption between two rules. Horizontal only — «oppure», «or», a section name */
  label?: React.ReactNode;

  orientation?: 'horizontal' | 'vertical';
}


/* --------
 * Component Definition
 * -------- */

/**
 * A standalone hairline.
 *
 * For a rule *between* the children of a stack use `<Stack divided>` instead: it draws the line with
 * `divide-*`, so no separator element ends up in the tree and the first and last child never get one.
 *
 * Reads `--border`, and `--muted-foreground` for the label.
 */
export function Divider(props: DividerProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    label,
    orientation = 'horizontal',
    ...rest
  } = props;


  // ----
  // Component Render
  // ----
  if (orientation === 'vertical') {
    return (
      <div
        aria-orientation={'vertical'}
        data-slot={'divider'}
        role={'separator'}
        className={cn('w-px self-stretch bg-border', className)}
        {...rest}
      />
    );
  }

  if (label !== null && label !== undefined) {
    return (
      <div
        aria-orientation={'horizontal'}
        data-slot={'divider'}
        role={'separator'}
        className={cn('flex items-center gap-3', className)}
        {...rest}
      >
        <span className={'h-px flex-1 bg-border'} />
        <span className={'text-xs font-medium text-muted-foreground'}>{label}</span>
        <span className={'h-px flex-1 bg-border'} />
      </div>
    );
  }

  return (
    <div
      aria-orientation={'horizontal'}
      data-slot={'divider'}
      role={'separator'}
      className={cn('h-px w-full bg-border', className)}
      {...rest}
    />
  );

}

Divider.displayName = 'Divider';
