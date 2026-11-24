import * as React from 'react';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import { Stack } from '../layout/Stack';

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

  /** The control the name belongs to: the name becomes a `<label>` pointing at it, a `<span>` otherwise */
  htmlFor?: string;

  /** The id of the name alone, for a control named by `aria-labelledby` */
  textId?: string;

  /**
   * A second line under the name: the unit, the format, what to write. Outside the name element, so
   * it never joins the name of the control: point the control at it with `aria-describedby`
   */
  description?: React.ReactNode;

  /** The id of the description. Defaults to `<textId>-description` when `textId` is given */
  descriptionId?: string;

  /** A glyph before the name, as tall as the text and centred on its first line. A node: no icon library here */
  leading?: React.ReactNode;

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

  /**
   * The element of the name, when neither a `<label>` nor a `<span>` will do: a field of your own
   * renders its library's label here, with `textProps` for what that element needs
   */
  textAs?: React.ElementType;

  textProps?: Readonly<Record<string, unknown>>;
}

export type LabelProps<E extends React.ElementType = 'span'> = PolymorphicProps<E, StrictLabelProps>;


/* --------
 * Constants Definition
 * -------- */

/** The house register, in one place, so `default` and the step it equals cannot drift apart */
const DEFAULT_EMPHASIS_CLASS = 'text-sm font-medium text-foreground leading-snug';

/**
 * On the root, so the glyph before the name reads the same size and line. The line height comes AFTER
 * the size: a size carries its own, and tailwind-merge drops whichever of the two comes first. `regular`
 * keeps the line of its size, 20px: the box of a checkbox, a radio, a switch is centred on it (16 on 20)
 */
const EMPHASIS: Readonly<Record<LabelEmphasis, string>> = {
  default: DEFAULT_EMPHASIS_CLASS,
  quiet  : 'text-xs font-medium text-muted-foreground leading-snug',
  regular: 'text-sm font-normal text-foreground',
  strong : DEFAULT_EMPHASIS_CLASS
};

/** The glyph follows the size of the text it sits next to */
const LEADING_SIZE: Readonly<Record<LabelEmphasis, string>> = {
  default: '[&_svg]:size-4',
  quiet  : '[&_svg]:size-3.5',
  regular: '[&_svg]:size-4',
  strong : '[&_svg]:size-4'
};


/* --------
 * Helpers
 * -------- */

/** Whether a slot renders anything: `internal/presence` comes after this section, so the test is written here */
function isShown(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== '';
}


/* --------
 * Component Definition
 * -------- */

/**
 * The name of something: of a field, of an option, of a value. Every label of the package is this one.
 *
 * ```tsx
 * <Label htmlFor={'plate'} textId={'plate-label'} description={'As on the registration'} required>Plate</Label>
 * <TextInput id={'plate'} aria-describedby={'plate-label-description'} />
 *
 * <Label emphasis={'quiet'}>Collected today</Label>
 * ```
 *
 * Two elements in one component: the root, which carries `className` and the shared props, and the
 * name inside it, which is a `<label>` when `htmlFor` points it at a control. The description sits
 * beside the name and never inside it: inside a `<label>` it would become part of the name of the
 * control, read at every focus and once more through `aria-describedby`.
 *
 * The root is a `span` by default, phrasing content, so a Label stays valid inside a `<label>` row or a
 * button; `as` changes it, a `dt` in a definition list.
 *
 * Slots: `label` (with `data-emphasis`, `data-required`, `data-optional`, `data-leading`),
 * `label-leading`, `label-body` (with a leading glyph only), `label-text`, `label-required`,
 * `label-optional`, `label-description`.
 */
export function Label<E extends React.ElementType = 'span'>(props: LabelProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'span',
    children,
    className,
    description,
    descriptionId,
    emphasis = 'default',
    htmlFor,
    leading,
    optional,
    required = false,
    textAs,
    textId,
    textProps,
    ...others
  } = props as LabelProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  const showOptional = !required && isShown(optional);
  const hasLeading = isShown(leading);
  const Text: React.ElementType = textAs ?? (htmlFor === undefined ? 'span' : 'label');

  const name = (
    <Text {...textProps} id={textId} htmlFor={htmlFor} data-slot={'label-text'} className={'min-w-0'}>
      {children}

      {required && (
        <span data-slot={'label-required'} aria-hidden={'true'} className={'ms-0.5 text-destructive'}>*</span>
      )}

      {showOptional && (
        <span data-slot={'label-optional'} className={'ms-1.5 text-xs font-normal text-muted-foreground'}>{optional}</span>
      )}
    </Text>
  );

  const line = isShown(description) && (
    <span
      id={descriptionId ?? (textId === undefined ? undefined : `${textId}-description`)}
      data-slot={'label-description'}
      className={'text-xs leading-snug font-normal text-muted-foreground'}
    >
      {description}
    </span>
  );

  return (
    <Stack
      as={Component}
      data-slot={'label'}
      data-emphasis={emphasis}
      data-required={required || undefined}
      data-optional={showOptional || undefined}
      data-leading={hasLeading || undefined}
      direction={hasLeading ? 'horizontal' : 'vertical'}
      align={hasLeading ? 'start' : undefined}
      gap={hasLeading ? 1.5 : 0.5}
      className={cn('min-w-0', EMPHASIS[emphasis], baseClasses, className)}
      {...rest}
    >
      {hasLeading ? (
        <React.Fragment>
          {/* As tall as one line of the name, the glyph centred in it */}
          <Stack
            as={'span'}
            data-slot={'label-leading'}
            direction={'horizontal'}
            align={'center'}
            gap={0}
            className={cn('h-lh shrink-0 text-muted-foreground', LEADING_SIZE[emphasis])}
          >
            {leading}
          </Stack>

          <Stack as={'span'} data-slot={'label-body'} gap={0.5} className={'min-w-0'}>
            {name}
            {line}
          </Stack>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {name}
          {line}
        </React.Fragment>
      )}
    </Stack>
  );

}

Label.displayName = 'Label';
