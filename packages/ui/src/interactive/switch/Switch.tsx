'use client';

import * as React from 'react';

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { CHOICE_ALIGN, CHOICE_FOCUS, CHOICE_ROW, ChoiceText } from '../choice/choice';

import type { BaseProps } from '../../core/base';


/* --------
 * Types Definition
 * -------- */

export interface StrictSwitchProps extends BaseProps {
  /** What is on, as content. It does not change between on and off */
  children?: React.ReactNode;

  /** A line under the label, and the place for the reason it is disabled or read only */
  description?: React.ReactNode;

  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;

  /**
   * A change is on its way to the server: further clicks are ignored, and nothing changes in the look.
   * The thumb has already moved; if the change fails the caller puts `checked` back and says so.
   */
  pending?: boolean;

  /** The value cannot change here */
  readOnly?: boolean;

  disabled?: boolean;

  name?: string;

  /** Classes for the row, last so they win */
  className?: string;
}

/** The row takes `className` and the shared props; the native props and the ref reach the track, which takes the focus */
export type SwitchProps = StrictSwitchProps & Omit<React.ComponentProps<'span'>, keyof StrictSwitchProps | 'ref' | 'onChange'>;


/* --------
 * Constants Definition
 * -------- */

const TRACK = [
  'relative inline-flex h-4 w-7 items-center rounded-full border border-transparent bg-switch-off p-px',
  'transition-colors duration-100 motion-reduce:transition-none',
  CHOICE_ALIGN,
  CHOICE_FOCUS,
  'data-checked:bg-primary',
  'not-data-disabled:not-data-readonly:group-hover/choice:bg-linear-to-b',
  'not-data-disabled:not-data-readonly:group-hover/choice:not-data-checked:from-foreground/8',
  'not-data-disabled:not-data-readonly:group-hover/choice:not-data-checked:to-foreground/8',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-checked:from-state-hover',
  'not-data-disabled:not-data-readonly:group-hover/choice:data-checked:to-state-hover',
  'data-readonly:border-input data-readonly:bg-muted data-readonly:data-checked:border-transparent',
  'data-readonly:data-checked:bg-muted-foreground',
  'data-disabled:opacity-50'
].join(' ');

const THUMB = [
  'size-3 rounded-full bg-primary-foreground transition-transform duration-100 motion-reduce:transition-none',
  'data-checked:translate-x-3 rtl:data-checked:-translate-x-3',
  'in-data-readonly:bg-border in-data-readonly:data-checked:bg-card'
].join(' ');


/* --------
 * Component Definition
 * -------- */

/**
 * Turns something on or off at once, with no Save and no confirmation. In a form that is saved with a
 * button, the control is a `Checkbox`.
 *
 * ```tsx
 * <Switch checked={showClosed} onCheckedChange={toggleClosed} pending={saving}>Show the closed ones too</Switch>
 * ```
 *
 * It is not a field: no error, not saved with a form. The thumb moves on the click without waiting;
 * while `pending` further clicks are ignored. Space and Enter both toggle it. On and off differ by the
 * position of the thumb and the colour of the track, never by colour alone.
 *
 * Slots: `switch` (the row, with `data-disabled`, `data-readonly`), `switch-track`, `switch-thumb`,
 * `switch-text`, `switch-label`, `switch-description`.
 *
 * The ref and the native props reach the track, the element that takes the focus; `className` and the
 * shared props reach the row.
 */
export const Switch = React.forwardRef<HTMLSpanElement, SwitchProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-describedby': ariaDescribedBy,
    checked,
    children,
    className,
    defaultChecked,
    description,
    disabled = false,
    name,
    onCheckedChange,
    pending = false,
    readOnly = false,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const descriptionId = React.useId();


  // ----
  // Component Render
  // ----
  const hasDescription = description !== null && description !== undefined && description !== false;

  return (
    <label
      data-slot={'switch'}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn(CHOICE_ROW, baseClasses, className)}
    >
      <SwitchPrimitive.Root
        {...rest}
        ref={ref}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(next, details) => {
          /* Not `readOnly`, which would change the look: a pending switch looks exactly the same */
          if (pending) {
            details.cancel();
            return;
          }

          onCheckedChange?.(next);
        }}
        disabled={disabled}
        readOnly={readOnly}
        aria-describedby={[ ariaDescribedBy, hasDescription ? descriptionId : undefined ].filter(Boolean).join(' ') || undefined}
        aria-busy={pending || undefined}
        data-slot={'switch-track'}
        className={TRACK}
      >
        <SwitchPrimitive.Thumb data-slot={'switch-thumb'} className={THUMB} />
      </SwitchPrimitive.Root>

      <ChoiceText slot={'switch'} label={children} description={description} descriptionId={descriptionId} />
    </label>
  );

});

Switch.displayName = 'Switch';
