import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';
import { responsiveClasses } from '../core/responsive';

import { Stack } from '../layout/Stack';

import type { BaseProps } from '../core/base';
import type { Responsive, Spacing } from '../core/responsive';
import type { Tone } from '../core/tone';


/* --------
 * Types Definition
 * -------- */

/** The colour of the line: the line of the theme, or the ink of a tone */
export type DividerTone = 'default' | Tone;

/** The thickness of the line, in pixels */
export type DividerLineWidth = 1 | 2 | 4;

export type DividerLineStyle = 'solid' | 'dashed' | 'dotted' | 'double';

export interface StrictDividerProps extends BaseProps {
  /** A caption between two rules. Horizontal only: “oppure”, “or”, a section name */
  label?: React.ReactNode;

  /** The colour of the line: `--border`, or the ink of a tone. Defaults to `default` */
  lineTone?: DividerTone;

  /** The thickness of the line, in pixels. Defaults to `1` */
  lineWidth?: DividerLineWidth;

  /** Defaults to `solid`. `double` needs a `lineWidth` of at least `4` to show two lines */
  lineStyle?: DividerLineStyle;

  orientation?: 'horizontal' | 'vertical';

  /**
   * The room on both sides of the line, across it: above and below a horizontal divider, before and
   * after a vertical one. A step of the spacing scale by name or a Tailwind step by number, per
   * breakpoint if needed. Defaults to `0`, so a divider inside a Stack takes the Stack's gap and no more.
   */
  spacing?: Responsive<Spacing>;
}
export type DividerProps = StrictDividerProps & Omit<React.ComponentProps<'div'>, keyof StrictDividerProps | 'children'>;


/* --------
 * Constants Definition
 * -------- */

/** The colour of the line per tone: the ink of the plain fill, which is what a line of that tone is */
const LINE_TONE: Readonly<Record<DividerTone, string>> = {
  default    : 'border-border',
  muted      : 'border-muted-soft-foreground',
  secondary  : 'border-secondary-soft-foreground',
  primary    : 'border-primary-soft-foreground',
  success    : 'border-success-soft-foreground',
  warning    : 'border-warning-soft-foreground',
  destructive: 'border-destructive',
  info       : 'border-info-soft-foreground'
};

const LINE_WIDTH: Readonly<Record<'horizontal' | 'vertical', Readonly<Record<DividerLineWidth, string>>>> = {
  horizontal: { 1: 'border-t', 2: 'border-t-2', 4: 'border-t-4' },
  vertical  : { 1: 'border-s', 2: 'border-s-2', 4: 'border-s-4' }
};

const LINE_STYLE: Readonly<Record<DividerLineStyle, string>> = {
  solid : 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
  double: 'border-double'
};


/* --------
 * Component Definition
 * -------- */

/**
 * A standalone line.
 *
 * For a rule *between* the children of a stack use `<Stack divided>` instead: it draws the line with
 * `divide-*`, so no separator element ends up in the tree and the first and last child never get one.
 *
 * The line is a border, not a filled box, which is what lets it be dashed or dotted: its thickness is
 * `lineWidth`, its colour `lineTone`, its pattern `lineStyle`. Reads `--border` by default, a tone's ink
 * otherwise, and `--muted-foreground` for the label.
 */
export function Divider(props: DividerProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    label,
    lineStyle = 'solid',
    lineTone = 'default',
    lineWidth = 1,
    orientation = 'horizontal',
    spacing,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----
  const line = cn(LINE_WIDTH[orientation][lineWidth], LINE_STYLE[lineStyle], LINE_TONE[lineTone]);
  const room = responsiveClasses(spacing, (value) => (orientation === 'vertical' ? `mx-${value}` : `my-${value}`));

  const attributes = {
    'data-slot'      : 'divider',
    'data-line-tone' : lineTone,
    'data-line-width': lineWidth,
    'data-line-style': lineStyle,
    role             : 'separator'
  } as const;


  // ----
  // Component Render
  // ----
  if (orientation === 'vertical') {
    return (
      <div
        {...attributes}
        aria-orientation={'vertical'}
        data-orientation={'vertical'}
        className={cn('w-0 self-stretch', line, room, baseClasses, className)}
        {...rest}
      />
    );
  }

  if (label !== null && label !== undefined) {
    return (
      <Stack
        {...attributes}
        aria-orientation={'horizontal'}
        data-labelled={true}
        data-orientation={'horizontal'}
        direction={'horizontal'}
        align={'center'}
        gap={3}
        className={cn(room, baseClasses, className)}
        {...rest}
      >
        <span className={cn('h-0 flex-1', line)} />
        <span className={'text-xs font-medium text-muted-foreground'}>{label}</span>
        <span className={cn('h-0 flex-1', line)} />
      </Stack>
    );
  }

  return (
    <div
      {...attributes}
      aria-orientation={'horizontal'}
      data-orientation={'horizontal'}
      className={cn('h-0 w-full', line, room, baseClasses, className)}
      {...rest}
    />
  );

}

Divider.displayName = 'Divider';
