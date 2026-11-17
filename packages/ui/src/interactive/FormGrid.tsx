import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */

/**
 * How many of the six columns of a `FormGrid` a field takes.
 *
 * Five steps rather than six on purpose: a field five sixths wide has no use that a field four or
 * six sixths wide does not cover better, and an extra step is one more way for two forms to disagree.
 */
export type FieldSpan = 1 | 2 | 3 | 4 | 6;


export interface StrictFormGridProps extends BaseProps {
  children?: React.ReactNode;
}

export type FormGridProps = StrictFormGridProps & Omit<React.ComponentProps<'div'>, keyof StrictFormGridProps>;


export interface StrictFormSectionProps extends BaseProps {
  /** The name of the section. Without it the section is the only one, and its container names it */
  title?: React.ReactNode;

  /** One line under the title: what the section is for, not how to fill it in */
  description?: React.ReactNode;

  /** The level of the title, one below the title of whatever contains the form. Defaults to 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;

  children?: React.ReactNode;
}

export type FormSectionProps = StrictFormSectionProps & Omit<React.ComponentProps<'div'>, keyof StrictFormSectionProps>;


/* --------
 * Constants Definition
 * -------- */

/**
 * The width of a field, from the kind of control it holds.
 *
 * The width of a field is a property of its **content**, not a choice made on each form: a postal
 * code is short wherever it appears, and two forms that size it differently are two forms that look
 * unrelated. A form builder reads this map; a form written by hand passes `span` to the `Field`.
 *
 * Only the kinds of control this package ships today are listed: an entry for a control that does
 * not exist is a promise nobody can check.
 */
export const FIELD_SPAN = {
  'text-short': 1,
  'text-code' : 2,
  text        : 3,
  'text-long' : 4
} as const satisfies Readonly<Record<string, FieldSpan>>;


const HEADING_ELEMENT = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6'
} as const;


/* --------
 * Component Definition
 * -------- */

/**
 * The six column grid the fields of a form are laid on.
 *
 * ```tsx
 * <FormGrid>
 *   <Field label={'Street'} span={4}><TextInput /></Field>
 *   <Field label={'Number'} span={1}><TextInput width={'short'} /></Field>
 * </FormGrid>
 * ```
 *
 * Every `Field` inside becomes a **subgrid** three rows tall (label, control, messages), so the
 * fields of one row share their tracks: a label that wraps to two lines or an error that appears
 * under one field moves the whole row together, and the controls stay aligned.
 *
 * It is also a size container. Below 32rem of its **own** width, whatever the viewport, the short
 * fields go to half a row and the rest to a full one, which is what a form inside a narrow dialog
 * needs and a media query could not tell.
 *
 * The column gap and the row gap are the house default, and the most likely thing an application
 * retunes: `[data-slot='form-grid'] { column-gap: … }` in its stylesheet, or `className` on one grid.
 */
export function FormGrid(props: FormGridProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <div
      data-slot={'form-grid'}
      className={cn('@container grid grid-cols-6 gap-x-6 gap-y-5', baseClasses, className)}
      {...rest}
    />
  );

}

FormGrid.displayName = 'FormGrid';


/**
 * A group of fields with a title and a line of explanation over them.
 *
 * ```tsx
 * <FormSection title={'Address'} description={'Where the collection takes place'}>
 *   <FormGrid>…</FormGrid>
 * </FormSection>
 * ```
 *
 * A `div` with `role="group"`, named by its title and described by its explanation, rather than a
 * `section`: a `section` with a name is a landmark, and a form of four sections would put four
 * landmarks in the page's navigation. The `fieldset` stays where it belongs, around a group of
 * radios or checkboxes.
 *
 * Consecutive sections are separated by a rule with room on both sides; the first one has neither.
 */
export function FormSection(props: FormSectionProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    description,
    headingLevel = 3,
    title,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const titleId = React.useId();
  const descriptionId = React.useId();


  // ----
  // Component Render
  // ----
  const hasTitle = title !== null && title !== undefined;
  const hasDescription = hasTitle && description !== null && description !== undefined;

  const Title = HEADING_ELEMENT[headingLevel];

  return (
    <div
      data-slot={'form-section'}
      role={hasTitle ? 'group' : undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={cn(
        'flex flex-col gap-4 border-border not-first:mt-6 not-first:border-t not-first:pt-6',
        baseClasses,
        className
      )}
      {...rest}
    >
      {hasTitle && (
        <div data-slot={'form-section-header'} className={'flex flex-col gap-0.5'}>
          <Title id={titleId} data-slot={'form-section-title'} className={'text-sm font-semibold text-foreground'}>
            {title}
          </Title>

          {hasDescription && (
            <p id={descriptionId} data-slot={'form-section-description'} className={'text-xs text-muted-foreground'}>
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );

}

FormSection.displayName = 'FormSection';
