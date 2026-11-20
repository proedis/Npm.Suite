'use client';

import * as React from 'react';

import { Input } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';

import { useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Spinner } from '../../components/Spinner';

import { IconButton } from '../button/IconButton';
import { useFieldControl } from '../field/fieldContext';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_SIZES, TEXT_CONTROL_TEXT, textControlState } from '../text-control/textControl';

import type { BaseProps } from '../../core/base';

import type { IconButtonProps } from '../button/IconButton';
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
   * The kind of value, which sets the span of the field in a form section (1, 2, 3, 4) and the
   * minimum width. Defaults to `default`.
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

  /** The error state. Inside a `Field` with a `Field.Error` it is on already */
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

export type TextInputActionProps = Omit<IconButtonProps, 'size' | 'fill' | 'tone' | 'loading' | 'loadingLabel'>;

interface TextInputState {
  readonly size: TextInputSize;
  readonly inert: boolean;
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

const TextInputContext = React.createContext<TextInputState>({ size: 'md', inert: false });

TextInputContext.displayName = 'TextInputContext';


/* --------
 * Variants
 * -------- */

/**
 * The look of the frame and its states are the shared text-control classes: TextInput, Textarea,
 * NumberInput and the triggers of the lists read the same ones.
 */
const textInputVariants = cva(
  [
    TEXT_CONTROL_FRAME,
    'flex w-full cursor-text items-center',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground'
  ],
  {
    variants: {
      size: TEXT_CONTROL_SIZES,

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
 * Helpers
 * -------- */

function isPresent(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false;
}


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
  const { inert, size } = React.useContext(TextInputContext);


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
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:ring-0',
        ACTION_OFFSET[size],
        className
      )}
    />
  );

});

TextInputAction.displayName = 'TextInput.Action';


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

  const inputRef = React.useRef<HTMLInputElement | null>(null);


  // ----
  // Memoized Data
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;

  const state = React.useMemo<TextInputState>(
    () => ({ size, inert: isDisabled || readOnly }),
    [ size, isDisabled, readOnly ]
  );


  // ----
  // Handlers
  // ----
  const setRefs = useForkRef(inputRef, ref);

  /** A click on any part that is not the text or an action lands in the text */
  const handleFrameMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    const target = event.target as Element;

    if (target === inputRef.current || target.closest('button, a, input') !== null) {
      return;
    }

    event.preventDefault();
    inputRef.current?.focus();
  };


  // ----
  // Component Render
  // ----
  return (
    <div
      data-slot={'text-input'}
      data-size={size}
      data-width={width}
      data-loading={loading || undefined}
      {...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled })}
      className={cn(textInputVariants({ size, width }), baseClasses, className)}
      onMouseDown={handleFrameMouseDown}
    >
      <TextInputContext.Provider value={state}>
        {isPresent(leading) && (
          <span data-slot={'text-input-leading'} className={'flex shrink-0 items-center'}>{leading}</span>
        )}

        {isPresent(prefix) && (
          <span data-slot={'text-input-prefix'} className={'shrink-0 text-muted-foreground'}>{prefix}</span>
        )}

        <Input
          {...rest}
          ref={setRefs}
          data-slot={'text-input-control'}
          data-field-control={''}
          disabled={isDisabled}
          readOnly={readOnly}
          aria-required={field.required || undefined}
          aria-invalid={isInvalid || undefined}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent outline-none',
            TEXT_CONTROL_TEXT,
            '[&::-webkit-search-cancel-button]:appearance-none'
          )}
        />

        {isPresent(suffix) && (
          <span data-slot={'text-input-suffix'} className={'shrink-0 text-muted-foreground'}>{suffix}</span>
        )}

        {loading
          ? <Spinner data-slot={'text-input-spinner'} size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} label={loadingLabel} />
          : isPresent(trailing) && (
            <span data-slot={'text-input-trailing'} className={'flex shrink-0 items-center'}>{trailing}</span>
          )}
      </TextInputContext.Provider>
    </div>
  );

});

TextInputBase.displayName = 'TextInput';


/**
 * The single line text field: full border on a `card` surface, three sizes, four slots.
 *
 * ```tsx
 * <Field>
 *   <Field.Label required>Town</Field.Label>
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
export const TextInput = Object.assign(TextInputBase, { Action: TextInputAction });


export { textInputVariants };
