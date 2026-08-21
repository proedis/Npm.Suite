import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { PolymorphicProps } from '../core/polymorphic';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */

/**
 * How loud the label is next to what it labels.
 *
 * The two are not a matter of taste, they are opposite emphases for opposite jobs. A **form** label
 * is the prominent element of its pair: the field below it is empty until someone types, so the
 * label carries the meaning. A **data** label is the quiet one: the value next to it is the point,
 * and a label competing with it flattens the hierarchy.
 */
export type LabelEmphasis = 'quiet' | 'strong';


export interface StrictLabelProps extends BaseProps {
  /** A second line under the label: the unit, the format, where the value comes from */
  description?: React.ReactNode;

  /** Defaults to `strong`, the form register */
  emphasis?: LabelEmphasis;

}


export type LabelProps<E extends React.ElementType = 'label'> = PolymorphicProps<E, StrictLabelProps>;


/* --------
 * Constants Definition
 * -------- */
const EMPHASIS: Readonly<Record<LabelEmphasis, string>> = {
  quiet : 'text-xs font-medium text-muted-foreground',
  strong: 'text-sm font-medium text-foreground'
};


/* --------
 * Component Definition
 * -------- */

/**
 * The name of something, with an optional line of detail under it.
 *
 * ```tsx
 * <Label htmlFor={'email'} description={'We never share it'}>Email</Label>
 * <Label as={'span'} emphasis={'quiet'}>Collected today</Label>
 * ```
 *
 * A `<label>` by default, because the element is the reason this exists rather than a `<span>` with
 * two classes: it is what connects a name to a control, and what makes clicking the name focus the
 * field. `as={'span'}` is for the cases with no control to point at — a summary row, a definition
 * list, `LabeledContent`, which is built on exactly this.
 *
 * Every element here is phrasing content (`span`, laid out with flex), so the component stays valid
 * inside a `<label>` even with a description: a `<div>` there is not.
 *
 * ⚠️ No `required` prop, and that is a boundary rather than an omission. The asterisk belongs to the
 * form layer: it needs a status colour, and this package declares no status colour because it ships
 * no form control that could read one. A `FormFieldShell` renders its own, next to the error state
 * and the description slot it already owns.
 */
export function Label<E extends React.ElementType = 'label'>(props: LabelProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'label',
    children,
    className,
    description,
    emphasis = 'strong',
    ...others
  } = props as LabelProps<'label'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'label'}
      data-emphasis={emphasis}
      className={cn('flex min-w-0 flex-col gap-0.5', baseClasses, className)}
      {...rest}
    >
      <span data-slot={'label-text'} className={cn('leading-snug', EMPHASIS[emphasis])}>
        {children}
      </span>

      {description !== null && description !== undefined && (
        <span data-slot={'label-description'} className={'text-2xs text-muted-foreground/70'}>
          {description}
        </span>
      )}
    </Component>
  );

}

Label.displayName = 'Label';
