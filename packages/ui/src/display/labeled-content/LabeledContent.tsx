import * as React from 'react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Label } from '../../primitives/Label';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';


/* --------
 * Types Definition
 * -------- */
export interface StrictLabeledContentProps extends BaseProps {
  /** Label on the left, value on the right — the shape a settings row or a summary row wants */
  inline?: boolean;
}

export type LabeledContentProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictLabeledContentProps>;


export interface StrictLabeledContentLabelProps extends BaseProps {
  /** A second line under the name: the unit, where the value comes from */
  description?: React.ReactNode;
}

export type LabeledContentLabelProps<E extends React.ElementType = 'span'> =
  PolymorphicProps<E, StrictLabeledContentLabelProps>;


export interface StrictLabeledContentValueProps extends BaseProps {}

export type LabeledContentValueProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictLabeledContentValueProps>;


/* --------
 * Parts Definition
 * -------- */

/**
 * The quiet half: a `Label` in its quiet emphasis, rendered as a `span`, with its description under it.
 * The part is the pair, `labeled-content-label`, so the name is always the `label` inside it.
 *
 * Quiet on purpose, and it is the whole reason this component exists rather than a `Heading`: the
 * emphasis is inverted. A heading is a loud title with a quiet line under it; this is a quiet name
 * with a loud value under it, because here the value is the point and a label competing with it
 * flattens the pair. Same two elements, opposite weights.
 *
 * A `span` and not a `<label>`, because there is no control to point at — that is what `Label` itself
 * is for, and the difference between the two is whether there is a `for`.
 */
function LabeledContentLabel<E extends React.ElementType = 'span'>(
  props: LabeledContentLabelProps<E>
): React.ReactNode {
  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'span',
    children,
    className,
    description,
    ...others
  } = props as LabeledContentLabelProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={Component}
      data-slot={'labeled-content-label'}
      gap={0.5}
      className={cn('min-w-0', baseClasses, className)}
      {...rest}
    >
      <Label as={'span'} emphasis={'quiet'}>{children}</Label>
      {description !== null && description !== undefined && description !== false && description !== '' && (
        <Label.Description>{description}</Label.Description>
      )}
    </Stack>
  );
}

LabeledContentLabel.displayName = 'LabeledContent.Label';


/** The loud half: the number, the date, the state */
function LabeledContentValue<E extends React.ElementType = 'div'>(
  props: LabeledContentValueProps<E>
): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    ...others
  } = props as LabeledContentValueProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'labeled-content-value'}
      className={cn('min-w-0 text-sm font-semibold text-foreground', baseClasses, className)}
      {...rest}
    />
  );

}

LabeledContentValue.displayName = 'LabeledContent.Value';


/* --------
 * Component Definition
 * -------- */

/**
 * A value with a label: the read-only counterpart of a form field.
 *
 * ```tsx
 * <LabeledContent>
 *   <LabeledContent.Label>Totale raccolto</LabeledContent.Label>
 *   <LabeledContent.Value>1.204 kg</LabeledContent.Value>
 * </LabeledContent>
 *
 * <LabeledContent inline>                            // a settings row: name left, state right
 *   <LabeledContent.Label>Notifiche push</LabeledContent.Label>
 *   <LabeledContent.Value>Attive</LabeledContent.Value>
 * </LabeledContent>
 * ```
 *
 * ## What it stopped doing
 *
 * It used to take `icon` and render its own framed box for it — `size-9`, a radius, `bg-muted`, a
 * glyph size — which is an `IconBox` written by hand before `IconBox` existed. Gone: the icon and the
 * row around it belong to `Item`, which already owns the truncation plumbing this was reproducing.
 *
 * ```tsx
 * <Item align={'start'}>
 *   <IconBox><Scale /></IconBox>
 *   <LabeledContent>
 *     <LabeledContent.Label>Totale raccolto</LabeledContent.Label>
 *     <LabeledContent.Value>1.204 kg</LabeledContent.Value>
 *   </LabeledContent>
 *   <Item.Actions>{…}</Item.Actions>
 * </Item>
 * ```
 *
 * `Item` grows this the same way it grows a `Heading`, so the pair takes the free space and the value
 * truncates instead of pushing the actions out of the row.
 *
 * ⚠️ `inline` is still here rather than deferred to `Item`, and the reason is the axis: an inline
 * `LabeledContent` puts the label and the value on **one** line with the value pushed to the far end,
 * which is an arrangement of the pair itself. An `Item` around it would put the pair on one side and
 * something else on the other.
 */
export function LabeledContent<E extends React.ElementType = 'div'>(
  props: LabeledContentProps<E>
): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    inline = false,
    ...others
  } = props as LabeledContentProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----

  /**
   * The inline arrangement pushes the value to the end and lets the label take the room, which is the
   * mirror of the plumbing in `Item`: the growing half is the one that may truncate, the other never
   * shrinks. Declared as descendant classes so no caller has to write them, at the known cost that
   * their specificity beats the part's own `className`.
   */
  const arrangement = inline && cn(
    '[&>[data-slot=labeled-content-label]]:grow',
    '[&>[data-slot=labeled-content-value]]:shrink-0 [&>[data-slot=labeled-content-value]]:text-right'
  );


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={Component}
      data-slot={'labeled-content'}
      data-inline={inline || undefined}
      direction={inline ? 'horizontal' : 'vertical'}
      align={inline ? 'center' : undefined}
      justify={inline ? 'between' : undefined}
      gap={inline ? 4 : 1}
      className={cn('min-w-0', arrangement, baseClasses, className)}
      {...rest}
    />
  );

}

LabeledContent.displayName = 'LabeledContent';
LabeledContent.Label = LabeledContentLabel;
LabeledContent.Value = LabeledContentValue;
