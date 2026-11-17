'use client';

import * as React from 'react';

import { Input } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import { Spinner } from '../components/Spinner';

import { useFieldRequired } from './fieldContext';

import type { BaseProps } from '../core/base';


/* --------
 * Types Definition
 * -------- */

export type TextInputSize = 'sm' | 'md' | 'lg';

/**
 * How much text the field is for. It sets the minimum width of the control, and it is what a form
 * builder reads to choose the `span` of the field (`FIELD_SPAN`): short is a postal code or a street
 * number, code an identifier, long a street, a company name, an email.
 */
export type TextInputWidth = 'short' | 'code' | 'default' | 'long';


export interface StrictTextInputProps extends BaseProps {
  /** Defaults to `md`. `sm` in a table row or a filter bar, `lg` on an access page */
  size?: TextInputSize;

  /** Defaults to `default` */
  width?: TextInputWidth;

  /** An icon at the start, as a node: nothing here imports an icon library */
  leading?: React.ReactNode;

  /** An icon or an action at the end */
  trailing?: React.ReactNode;

  /** Fixed text before the value, not part of it: `SG-` */
  prefix?: React.ReactNode;

  /** Fixed text after the value, not part of it: a unit */
  suffix?: React.ReactNode;

  /** The error state, for a field that lives outside a `Field`. Inside one, the `Field` decides */
  invalid?: boolean;
}

/**
 * A field that is loading says so, always: the spinner on its own is a shape, and a screen reader
 * has nothing to announce from it. The union makes the label required exactly when it is needed.
 */
type TextInputLoadingProps =
  | { loading?: false; loadingLabel?: string }
  | { loading: true; loadingLabel: string };

export type TextInputProps = StrictTextInputProps & TextInputLoadingProps & Omit<
  React.ComponentProps<'input'>,
  keyof StrictTextInputProps | 'size' | 'width' | 'children'
>;


/* --------
 * Constants Definition
 * -------- */

/** One source for each default, because `cva` applies them and the component has to report them */
const DEFAULT_VARIANTS = {
  size : 'md',
  width: 'default'
} as const;


/* --------
 * Variants Definition
 * -------- */

/**
 * The frame around the control, not the control itself.
 *
 * The `<input>` inside is borderless and transparent, and the frame draws the border, the fill and
 * the focus ring: that is what lets an icon, a prefix and a unit sit **inside** the field and be
 * covered by one edge, instead of each carrying its own.
 *
 * Every state is read from the input through `:has()`, never from a prop, so the frame cannot
 * disagree with the control: `data-invalid` is written by Base UI's `Field` (or by `invalid` outside
 * one), `readonly` and `disabled` are the input's own attributes.
 *
 * ⚠️ Invalid and focused at once keeps the destructive border: the compound variant
 * (`:has():focus-within`) carries one more pseudo-class than either half, so it wins on specificity
 * rather than on an emission order nobody should need to know.
 */
const textInputVariants = cva(
  [
    'flex w-full items-center rounded-md border border-input bg-card text-sm text-foreground',
    'transition motion-reduce:transition-none',

    /* Three chained conditions rather than one list: the arbitrary value lint reads a comma as the
       end of a value. Same selector, `:not(:has(…)):not(:has(…))` instead of `:not(:has(…, …))` */
    'hover:not-has-[[data-invalid]]:not-has-[input[readonly]]:not-has-[input:disabled]:border-input-hover',

    'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20',

    'has-[[data-invalid]]:border-destructive has-[[data-invalid]]:focus-within:border-destructive',

    'has-[input[readonly]]:border-border has-[input[readonly]]:bg-muted',

    'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',

    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
  ],
  {
    variants: {
      size: {
        sm: 'h-control-sm gap-1 px-2 [&_svg]:size-3.5',
        md: 'h-control-md gap-1.5 px-2.5 [&_svg]:size-4',
        lg: 'h-control-lg gap-1.5 px-3 [&_svg]:size-4'
      },

      width: {
        short  : 'min-w-16',
        code   : 'min-w-24',
        default: 'min-w-24',
        long   : 'min-w-24'
      }
    },

    defaultVariants: DEFAULT_VARIANTS
  }
);


/* --------
 * Component Definition
 * -------- */

/**
 * The one line text field.
 *
 * ```tsx
 * <Field label={'Town'}>
 *   <TextInput placeholder={'e.g. Brescia'} />
 * </Field>
 *
 * <TextInput aria-label={'Search'} leading={<Search />} size={'sm'} />
 * ```
 *
 * The label and the messages are the `Field`'s: this is the control alone, so the same field works in
 * a form, in a filter bar and in a table cell. Outside a `Field` it needs an accessible name.
 *
 * Its parts are slots an application can restyle from its stylesheet: `text-input` (the frame, with
 * `data-size` and `data-width`), `text-input-control`, `text-input-leading`, `text-input-trailing`,
 * `text-input-prefix`, `text-input-suffix`, `text-input-spinner`.
 *
 * The placeholder disappears in a read-only or disabled field: there it would read as a value.
 */
export function TextInput(props: TextInputProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    invalid = false,
    leading,
    loading = false,
    loadingLabel,
    prefix,
    size = DEFAULT_VARIANTS.size,
    suffix,
    trailing,
    width = DEFAULT_VARIANTS.width,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const required = useFieldRequired();


  // ----
  // Component Render
  // ----

  /**
   * Written only when true. Base UI writes `data-invalid` itself inside an invalid `Field`, and an
   * explicit `undefined` passed next to it would be one more prop to merge for nothing.
   */
  const invalidAttributes = invalid
    ? { 'aria-invalid': true, 'data-invalid': '' }
    : {};

  return (
    <div
      data-slot={'text-input'}
      data-size={size}
      data-width={width}
      data-loading={loading || undefined}
      className={cn(textInputVariants({ size, width }), baseClasses, className)}
    >
      {leading !== null && leading !== undefined && (
        <span data-slot={'text-input-leading'} className={'flex shrink-0 items-center'}>{leading}</span>
      )}

      {prefix !== null && prefix !== undefined && (
        <span data-slot={'text-input-prefix'} className={'shrink-0 text-muted-foreground'}>{prefix}</span>
      )}

      <Input
        data-slot={'text-input-control'}
        aria-required={required || undefined}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent tabular-nums outline-none',
          'placeholder:text-placeholder read-only:placeholder:text-transparent',
          'disabled:cursor-not-allowed'
        )}
        {...invalidAttributes}
        {...rest}
      />

      {suffix !== null && suffix !== undefined && (
        <span data-slot={'text-input-suffix'} className={'shrink-0 text-muted-foreground'}>{suffix}</span>
      )}

      {loading
        ? <Spinner data-slot={'text-input-spinner'} size={size === 'sm' ? 'xs' : 'sm'} label={loadingLabel} />
        : trailing !== null && trailing !== undefined && (
          <span data-slot={'text-input-trailing'} className={'flex shrink-0 items-center'}>{trailing}</span>
        )}
    </div>
  );

}

TextInput.displayName = 'TextInput';


export { textInputVariants };
