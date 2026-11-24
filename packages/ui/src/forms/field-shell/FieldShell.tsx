'use client';

import * as React from 'react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { isPresent } from '../../internal/presence';

import { useFieldControl } from '../field/fieldContext';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_GAP, TEXT_CONTROL_SIZES, textControlState } from '../text-control/textControl';

import type { BaseProps } from '../../core/base';

import type { TextControlSize } from '../text-control/textControl';


/* --------
 * Types Definition
 * -------- */

export type FieldShellSize = TextControlSize;

export interface StrictFieldShellProps extends BaseProps {
  /** The three heights every control shares, so a custom control lines up with a TextInput. Defaults to `md` */
  size?: FieldShellSize;

  /** An icon before the content, as a node: this package imports no icon library */
  leading?: React.ReactNode;

  /** An icon or a quiet action after the content */
  trailing?: React.ReactNode;

  /** The error border. Inside a field with an error it is on already */
  invalid?: boolean;

  /** The surface of a value that cannot change */
  readOnly?: boolean;

  /** Inside a disabled `Field` it is on already */
  disabled?: boolean;

  /**
   * The control and whatever sits beside it, laid in the row as they are: the control fills it with
   * `flex-1`, and carries `data-field-control` on the element that takes the focus
   */
  children?: React.ReactNode;
}

export type FieldShellProps = StrictFieldShellProps & Omit<React.ComponentProps<'div'>, keyof StrictFieldShellProps | 'color'>;


/* --------
 * Constants Definition
 * -------- */

/** What a press on the frame gives the focus to: the element the control marks, never a button or a link */
const FIELD_CONTROL = '[data-field-control]';
const OWN_TARGET = 'button, a, input, textarea, select, [data-field-control]';

/** The icon of a slot is quiet and keeps its size */
const SLOT = 'shrink-0 text-muted-foreground [&_svg]:shrink-0';


/* --------
 * Component Definition
 * -------- */

/**
 * The frame of every bordered control: the border, the surface, the three heights, the states and the
 * focus. TextInput, NumberInput, Select, MultiSelect, Combobox, DatePicker and the field of
 * ModalSelector are each this frame around their own content, and a control of your own is too.
 *
 * ```tsx
 * <Field label={'Opening hours'}>
 *   <FieldShell leading={<Clock />} trailing={<span>24h</span>}>
 *     <TimeSlots data-field-control className={'flex-1'} … />
 *   </FieldShell>
 * </Field>
 * ```
 *
 * The focus is drawn by CSS, never by a prop: the frame lights when the element inside it that carries
 * `data-field-control` has the focus, and not when an action inside the frame has it. That same
 * attribute is what the error summary of a `Form` focuses. A press on the frame outside the control,
 * a button or a link moves the focus to the control; an `onMouseDown` that calls `preventDefault`
 * keeps the press for itself.
 *
 * `invalid` and `disabled` add to what the field says, they never take it away: a disabled field
 * disables what is in it. The frame fills its row (`w-full min-w-0`); a control sized by its content
 * says so in `className` (`w-auto min-w-auto`).
 *
 * The slots follow the slot of the frame, `field-shell` unless a control names it: a `TextInput` is a
 * `text-input` with `text-input-leading` and `text-input-trailing`.
 *
 * The status of the field reaches the frame too: `warning` and `success` colour its border.
 *
 * Slots: `field-shell` (with `data-size`, `data-invalid`, `data-status`, `data-readonly`, `data-disabled`),
 * `field-shell-leading`, `field-shell-trailing`.
 */
export const FieldShell = React.forwardRef<HTMLDivElement, FieldShellProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    disabled = false,
    invalid = false,
    leading,
    onMouseDown,
    readOnly = false,
    size = 'md',
    trailing,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);

  const slot = (rest as { 'data-slot'?: string })['data-slot'] ?? 'field-shell';


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();


  // ----
  // Handlers
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    onMouseDown?.(event);

    if (event.defaultPrevented || isDisabled || (event.target as Element).closest(OWN_TARGET) !== null) {
      return;
    }

    const control = event.currentTarget.querySelector<HTMLElement>(FIELD_CONTROL);

    if (control) {
      event.preventDefault();
      control.focus();
    }
  };


  // ----
  // Component Render
  // ----
  return (
    <Stack
      data-slot={'field-shell'}
      {...rest}
      /* The states after the rest: a control rendered by a library (Base UI's NumberField) hands in its own */
      data-size={size}
      {...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled, status: field.status })}
      ref={ref}
      direction={'horizontal'}
      align={'center'}
      gap={TEXT_CONTROL_GAP[size]}
      className={cn(TEXT_CONTROL_FRAME, TEXT_CONTROL_SIZES[size], 'w-full min-w-0', baseClasses, className)}
      onMouseDown={handleMouseDown}
    >
      {isPresent(leading) && (
        <Stack as={'span'} data-slot={`${slot}-leading`} direction={'horizontal'} align={'center'} gap={0} className={SLOT}>
          {leading}
        </Stack>
      )}

      {children}

      {isPresent(trailing) && (
        <Stack as={'span'} data-slot={`${slot}-trailing`} direction={'horizontal'} align={'center'} gap={0} className={SLOT}>
          {trailing}
        </Stack>
      )}
    </Stack>
  );

});

FieldShell.displayName = 'FieldShell';
