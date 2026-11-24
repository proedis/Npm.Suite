import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';


/* --------
 * Types Definition
 * -------- */

/**
 * How loud the label is next to what it labels.
 *
 * Opposite emphases for opposite jobs. A **form** label (`default`) is the prominent element of its
 * pair: the field below it is empty until someone types, so the label carries the meaning. A **data**
 * label (`quiet`) is the quiet one: the value next to it is the point, and a label competing with it
 * flattens the hierarchy. The text of an **option** (`regular`) sits between the two: a checkbox, a
 * radio, a switch, where the row is the control and its text is read at the weight of the body.
 */
export type LabelEmphasis = 'default' | 'quiet' | 'regular' | 'strong';


export interface StrictLabelProps extends BaseProps {
  /**
   * Defaults to `default`, which renders the form register.
   *
   * A value of its own rather than the resolved step, so
   * `[data-slot='label'][data-emphasis='default']` owns every label nobody had an opinion about, and
   * keeps owning them if this package ever changes which register that is.
   */
  emphasis?: LabelEmphasis;

  /**
   * The asterisk after the name, hidden from assistive technology. Only the mark: the control says
   * `aria-required` itself, and a `Field` does that for the control inside it
   */
  required?: boolean;

  /**
   * The word after the name of a value that may stay empty, in the language of the page: "optional".
   * The convention of a form where almost everything is required. Not shown with `required`
   */
  optional?: React.ReactNode;
}

export type LabelProps<E extends React.ElementType = 'label'> = PolymorphicProps<E, StrictLabelProps>;


export type StrictLabelDescriptionProps = BaseProps;

export type LabelDescriptionProps<E extends React.ElementType = 'span'> = PolymorphicProps<E, StrictLabelDescriptionProps>;


/* --------
 * Constants Definition
 * -------- */

/** The house register, in one place, so `default` and the step it equals cannot drift apart */
const DEFAULT_EMPHASIS_CLASS = 'text-sm font-medium text-foreground';

/** The line height comes AFTER the size: a size carries its own, and tailwind-merge drops whichever of the two comes first */
const EMPHASIS: Readonly<Record<LabelEmphasis, string>> = {
  default: `${DEFAULT_EMPHASIS_CLASS} leading-snug`,
  quiet  : 'text-xs font-medium text-muted-foreground leading-snug',
  /* The line of the body, 20px: the box of a checkbox, a radio, a switch is centred on it (16 on 20) */
  regular: 'text-sm font-normal text-foreground',
  strong : `${DEFAULT_EMPHASIS_CLASS} leading-snug`
};


/* --------
 * Parts
 * -------- */

/**
 * The second line of a label: the unit, the format, where the value comes from, what to write.
 *
 * A sibling of the `Label`, never inside it: a description inside a `<label>` becomes part of the
 * name of the control, and a screen reader then reads it at every focus, and once more through
 * `aria-describedby`. Whoever pairs the two places them, and ties the description to the control.
 */
function LabelDescription<E extends React.ElementType = 'span'>(props: LabelDescriptionProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { as: Component = 'span', className, ...others } = props as LabelDescriptionProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'label-description'}
      className={cn('text-xs leading-snug text-muted-foreground', baseClasses, className)}
      {...rest}
    />
  );

}

LabelDescription.displayName = 'Label.Description';


/* --------
 * Component Definition
 * -------- */

/**
 * The name of something: of a field, of an option, of a value. Every label of the package is this one.
 *
 * ```tsx
 * <Label htmlFor={'email'} required>Email</Label>
 * <Label.Description id={'email-hint'}>We never share it</Label.Description>
 *
 * <Label as={'span'} emphasis={'quiet'}>Collected today</Label>
 * ```
 *
 * A `<label>` by default, because the element is the reason this exists rather than a `<span>` with
 * two classes: it is what connects a name to a control, and what makes clicking the name focus the
 * field. `as={'span'}` is for the cases with no control to point at: a summary row, a definition
 * list, `LabeledContent`.
 *
 * It is one element and only the name, with its marks: the asterisk of `required` and the word of
 * `optional`. The second line is `Label.Description`, a sibling: see there why it is never inside.
 *
 * Slots: `label` (with `data-emphasis`, `data-required`, `data-optional`), `label-required`,
 * `label-optional`, `label-description`.
 */
function LabelRoot<E extends React.ElementType = 'label'>(props: LabelProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'label',
    children,
    className,
    emphasis = 'default',
    optional,
    required = false,
    ...others
  } = props as LabelProps<'label'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  /* `internal/presence` comes after this section, so the test is written here: the empty string counts as nothing */
  const showOptional = !required && optional !== null && optional !== undefined && optional !== false && optional !== '';

  return (
    <Component
      data-slot={'label'}
      data-emphasis={emphasis}
      data-required={required || undefined}
      data-optional={showOptional || undefined}
      className={cn('min-w-0', EMPHASIS[emphasis], baseClasses, className)}
      {...rest}
    >
      {children}

      {required && (
        <span data-slot={'label-required'} aria-hidden={'true'} className={'ms-0.5 text-destructive'}>*</span>
      )}

      {showOptional && (
        <span data-slot={'label-optional'} className={'ms-1.5 text-xs font-normal text-muted-foreground'}>{optional}</span>
      )}
    </Component>
  );

}

LabelRoot.displayName = 'Label';

export const Label = Object.assign(LabelRoot, {
  Description: LabelDescription
});
