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

  /** The error border. Inside a field with a `Field.Error` it is on already */
  invalid?: boolean;

  /** The surface of a value that cannot change */
  readOnly?: boolean;

  /** Inside a disabled `Field` it is on already */
  disabled?: boolean;

  /** The control: its focusable element carries `data-field-control` */
  children?: React.ReactNode;
}

export type FieldShellProps = StrictFieldShellProps & Omit<React.ComponentProps<'div'>, keyof StrictFieldShellProps | 'color'>;


/* --------
 * Helpers
 * -------- */

/** What a press on the frame gives the focus to: the element the control marks, never a button or a link */
const FIELD_CONTROL = '[data-field-control]';
const OWN_TARGET = 'button, a, input, textarea, select, [data-field-control]';


/* --------
 * Component Definition
 * -------- */

/**
 * The frame of every text control, for a control of your own: the border, the surface, the three
 * heights, the states and the focus of a TextInput, around whatever you put in it.
 *
 * ```tsx
 * <Field>
 *   <Field.Label>Opening hours</Field.Label>
 *   <FieldShell leading={<Clock />} trailing={<span>24h</span>}>
 *     <TimeSlots data-field-control … />
 *   </FieldShell>
 * </Field>
 * ```
 *
 * The focus is drawn by CSS, never by a prop: the frame lights when the element inside it that
 * carries `data-field-control` has the focus, and not when an action inside the frame has it. That
 * same attribute is what the error summary of a `Form` focuses. A press on the frame outside the
 * control moves the focus to it.
 *
 * `invalid` and `disabled` add to what the field says, they never take it away: a disabled field
 * disables what is in it.
 *
 * Slots: `field-shell` (with `data-size`, `data-invalid`, `data-readonly`, `data-disabled`),
 * `field-shell-leading`, `field-shell-content`, `field-shell-trailing`.
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
      {...rest}
      ref={ref}
      data-slot={'field-shell'}
      data-size={size}
      {...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled })}
      direction={'horizontal'}
      align={'center'}
      gap={TEXT_CONTROL_GAP[size]}
      className={cn(
        TEXT_CONTROL_FRAME,
        TEXT_CONTROL_SIZES[size],
        'w-full min-w-0',
        '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        baseClasses,
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {isPresent(leading) && (
        <Stack as={'span'} data-slot={'field-shell-leading'} direction={'horizontal'} align={'center'} className={'shrink-0'}>{leading}</Stack>
      )}

      <Stack data-slot={'field-shell-content'} direction={'horizontal'} align={'center'} className={'h-full min-w-0 flex-1'}>{children}</Stack>

      {isPresent(trailing) && (
        <Stack as={'span'} data-slot={'field-shell-trailing'} direction={'horizontal'} align={'center'} className={'shrink-0'}>{trailing}</Stack>
      )}
    </Stack>
  );

});

FieldShell.displayName = 'FieldShell';
