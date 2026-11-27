'use client';

import * as React from 'react';

import { Input } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';

import { optionalContextBuilder, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { bindable } from '../../core/binding';
import { cn } from '../../core/cn';

import { Spinner } from '../../primitives/Spinner';

import { isPresent } from '../../internal/presence';

import { IconButton } from '../../actions/button/IconButton';
import { CopyButton } from '../../actions/copy-button/CopyButton';

import { useFieldControl } from '../field/fieldContext';
import { FieldShell } from '../field-shell/FieldShell';
import { TEXT_CONTROL_TEXT } from '../text-control/textControl';

import type { BaseProps } from '../../core/base';
import type { BoundValue } from '../../core/binding';

import type { IconButtonProps, StrictIconButtonProps } from '../../actions/button/IconButton';
import type { CopyButtonProps, StrictCopyButtonProps } from '../../actions/copy-button/CopyButton';

import type { TextControlSize } from '../text-control/textControl';


/* --------
 * Types Definition
 * -------- */

export type TextInputSize = TextControlSize;

export type TextInputWidth = 'short' | 'code' | 'default' | 'long';

export interface StrictTextInputProps extends BaseProps {
  /** `sm` in a table row or a filter bar, `md` in forms, `lg` for sign-in and empty states. Defaults to `md` */
  size?: TextInputSize;

  /**
   * The kind of value, which sets the minimum width of the frame: `short` 16 steps of the spacing
   * scale, the others 24 (64px and 96px at the default spacing).
   * Reported as `data-width`. It does not set the span of the field in a form section: that is the
   * `span` of the `Field` around it. Defaults to `default`.
   */
  width?: TextInputWidth;

  /** An icon before the value. Not clickable */
  leading?: React.ReactNode;

  /** An icon after the value, or a `TextInput.Action` */
  trailing?: React.ReactNode;

  /** Fixed text before the value, not part of it: `SG-`. The caller adds it on save */
  prefix?: React.ReactNode;

  /** Fixed text after the value, normally a unit, not part of it */
  suffix?: React.ReactNode;

  /** The error state. Inside a `Field` with an `error` it is on already */
  invalid?: boolean;

  /** Classes for the frame, last so they win */
  className?: string;
}

/** `loadingLabel` is required with `loading`: a spinner nobody announces is a field that went quiet */
export type TextInputLoadingProps =
  | { loading?: false; loadingLabel?: string }
  | { loading: true; loadingLabel: string };

export type TextInputProps = StrictTextInputProps & TextInputLoadingProps & Omit<
  React.ComponentProps<'input'>,
  keyof StrictTextInputProps | 'size' | 'width' | 'children' | 'ref'
>;

/** An action is an `IconButton` whose size, fill and tone are the field's */
export type StrictTextInputActionProps = StrictIconButtonProps;

export type TextInputActionProps = StrictTextInputActionProps
  & Omit<IconButtonProps, 'size' | 'fill' | 'tone' | 'loading' | 'loadingLabel'>;

/** `value` is optional: without it the button copies what the field holds when it is pressed */
export type StrictTextInputCopyProps = Omit<StrictCopyButtonProps, 'value'> & {
  value?: CopyButtonProps['value'];
};

export type TextInputCopyProps = StrictTextInputCopyProps & Omit<CopyButtonProps, 'size' | 'fill' | 'tone' | 'value'>;

interface TextInputState {
  readonly size: TextInputSize;
  readonly inert: boolean;
  readonly disabled: boolean;
}


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_VARIANTS = {
  size : 'md',
  width: 'default'
} as const;

/**
 * An action sits 4px from the border whatever the padding of the size, so it pulls itself back by the
 * difference: 8, 10 and 12 of padding.
 */
const ACTION_OFFSET: Readonly<Record<TextInputSize, string>> = {
  sm: '-me-1',
  md: '-me-1.5',
  lg: '-me-2'
};


/* --------
 * Context Definition
 * -------- */

const [ TextInputContext, useTextInputContext ] = optionalContextBuilder<TextInputState>('TextInput', { size: 'md', inert: false, disabled: false });


/* --------
 * Variants
 * -------- */

/**
 * The frame is `FieldShell`, the one every bordered control is: this adds what a text field does on
 * top of it, the text cursor, icons that let a press through, and the minimum width of its kind.
 */
const textInputVariants = cva(
  [
    'cursor-text',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
  ],
  {
    variants: {
      width: {
        short  : 'min-w-16',
        code   : 'min-w-24',
        default: 'min-w-24',
        long   : 'min-w-24'
      }
    },

    defaultVariants: { width: DEFAULT_VARIANTS.width }
  }
);


/* --------
 * Helpers
 * -------- */

/** One ref for two owners: the caller's and the frame's own, which moves the focus on a click */

/* --------
 * Parts
 * -------- */

/**
 * A button inside the field: show a password, clear a search.
 *
 * ```tsx
 * <TextInput trailing={<TextInput.Action label={'Clear'} icon={<X />} onClick={clear} />} />
 * ```
 *
 * An `IconButton`, so its name and its tooltip are the same required `label`. Quiet (`plain muted`),
 * 24 square in every size, 4px from the border, with an inner focus and no halo. It is not rendered
 * while the field is disabled or read only, where it would act on a value that cannot change.
 */
const TextInputAction = React.forwardRef<HTMLButtonElement, TextInputActionProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...rest } = props;


  // ----
  // Internal Hooks
  // ----
  const { inert, size } = useTextInputContext();


  // ----
  // Component Render
  // ----
  if (inert) {
    return null;
  }

  return (
    <IconButton
      {...rest}
      ref={ref}
      size={size === 'sm' ? 'sm' : 'md'}
      fill={'plain'}
      tone={'muted'}
      data-slot={'text-input-action'}
      className={cn(
        'size-6 cursor-pointer rounded-sm',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:ring-0',
        ACTION_OFFSET[size],
        className
      )}
    />
  );

});

TextInputAction.displayName = 'TextInput.Action';


/**
 * Copies the value of the field: the look of `TextInput.Action`, the behaviour of `CopyButton`.
 *
 * ```tsx
 * <TextInput readOnly value={apiKey} trailing={<TextInput.Copy labels={{ copy: 'Copy the key', copied: 'Copied' }} />} />
 * ```
 *
 * Unlike an action it stays in a read only field, the field one most often copies from: a key, a code, a
 * link. Without `value` it copies what the field holds at the moment of the press. Hidden while disabled.
 */
const TextInputCopy = React.forwardRef<HTMLButtonElement, TextInputCopyProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { className, value, ...rest } = props;


  // ----
  // Internal Hooks
  // ----
  const { disabled, size } = useTextInputContext();
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const forkedRef = useForkRef(ref, buttonRef);


  // ----
  // Component Render
  // ----
  if (disabled) {
    return null;
  }

  /* The text of the field when the press happens, read from the frame the button sits in */
  const fieldValue = (): string => buttonRef.current
    ?.closest('[data-slot=text-input]')
    ?.querySelector<HTMLInputElement>('[data-field-control]')
    ?.value ?? '';

  return (
    <CopyButton
      {...rest}
      ref={forkedRef}
      value={value ?? fieldValue}
      size={size === 'sm' ? 'sm' : 'md'}
      fill={'plain'}
      tone={'muted'}
      data-slot={'text-input-copy'}
      className={cn(
        'size-6 cursor-pointer rounded-sm',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:ring-0',
        ACTION_OFFSET[size],
        className
      )}
    />
  );

});

TextInputCopy.displayName = 'TextInput.Copy';


/* --------
 * Component Definition
 * -------- */

const TextInputBase = React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    disabled = false,
    invalid = false,
    leading,
    loading = false,
    loadingLabel,
    prefix,
    readOnly = false,
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
  const field = useFieldControl();


  // ----
  // Memoized Data
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;

  const state = React.useMemo<TextInputState>(
    () => ({ size, inert: isDisabled || readOnly, disabled: isDisabled }),
    [ size, isDisabled, readOnly ]
  );


  // ----
  // Handlers
  // ----


  // ----
  // Component Render
  // ----
  /* A press anywhere on the frame lands in the text: the frame's own, `FieldShell` */
  return (
    /* Around the frame, not inside it: the trailing slot, where an action sits, is the frame's */
    <TextInputContext.Provider value={state}>
      <FieldShell
        data-slot={'text-input'}
        size={size}
        data-width={width}
        data-loading={loading || undefined}
        invalid={isInvalid}
        readOnly={readOnly}
        disabled={isDisabled}
        leading={leading}
        trailing={loading ? undefined : trailing}
        className={cn(textInputVariants({ width }), baseClasses, className)}
      >
        {isPresent(prefix) && (
          <span data-slot={'text-input-prefix'} className={'shrink-0 text-muted-foreground'}>{prefix}</span>
        )}

        <Input
          {...rest}
          ref={ref}
          data-slot={'text-input-control'}
          data-field-control={''}
          disabled={isDisabled}
          readOnly={readOnly}
          aria-required={field.required || undefined}
          aria-invalid={isInvalid || undefined}
          className={cn(
            'frame-line min-w-0 flex-1 bg-transparent outline-none',
            TEXT_CONTROL_TEXT,
            '[&::-webkit-search-cancel-button]:appearance-none'
          )}
        />

        {isPresent(suffix) && (
          <span data-slot={'text-input-suffix'} className={'shrink-0 text-muted-foreground'}>{suffix}</span>
        )}

        {loading && (
          <Spinner data-slot={'text-input-spinner'} size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} label={loadingLabel} />
        )}
      </FieldShell>
    </TextInputContext.Provider>
  );

});

TextInputBase.displayName = 'TextInput';


/**
 * The single line text field: full border on a `card` surface, three sizes, four slots.
 *
 * ```tsx
 * <Field required label={'Town'}>
 *   <TextInput placeholder={'E.g. Brescia'} />
 * </Field>
 *
 * <TextInput aria-label={'Search'} leading={<Search />} size={'sm'} />
 * ```
 *
 * The control alone: label and messages are the `Field`'s, so the same field works in a form, a
 * filter bar and a table row. Outside a `Field` it needs an accessible name. Inside one it reads
 * `required`, `invalid` and `disabled` from it.
 *
 * What it decides on its own: the focus lights the frame only from the text, never from an action
 * inside it; a click anywhere on the frame lands in the text; the placeholder disappears when read
 * only or disabled, and darkens with the system's "more contrast"; the browser's autofill keeps the
 * surface of the field. Read only and disabled are different states: read only stays reachable,
 * selectable and submitted.
 *
 * The ref is the `<input>`, which is also what a `Tooltip` around it anchors to.
 *
 * Slots: `text-input` (the frame, with `data-size`, `data-width`, `data-loading`, `data-invalid`,
 * `data-readonly`, `data-disabled`), `text-input-control`, `text-input-leading`,
 * `text-input-trailing`, `text-input-prefix`, `text-input-suffix`, `text-input-spinner`,
 * `text-input-action`.
 */
export const TextInput = bindable(Object.assign(TextInputBase, { Action: TextInputAction, Copy: TextInputCopy }), {
  kind: 'text',
  bind: (field: BoundValue<string>) => ({
    name    : field.name,
    ref     : field.ref,
    value   : field.value ?? '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => field.onChange(event.currentTarget.value),
    onBlur  : field.onBlur
  })
});
