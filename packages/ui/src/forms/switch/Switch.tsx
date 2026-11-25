'use client';

import * as React from 'react';

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { splitBaseProps } from '../../core/base';
import { bindable } from '../../core/binding';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { isPresent } from '../../internal/presence';

import { CHOICE_ALIGN, CHOICE_FOCUS, CHOICE_ROW, ChoiceText } from '../choice/choice';

import type { BaseProps } from '../../core/base';
import type { BoundValue } from '../../core/binding';


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

/** The track carries its thumb as an inline Stack, given through `render` */
const TRACK = [
  'relative h-4 w-7 rounded-full border border-transparent bg-switch-off p-px',
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
 * `label` (the text, with `label-text`, `label-description`).
 *
 * The ref and the native props reach the track, the element that takes the focus; `className` and the
 * shared props reach the row.
 */
const SwitchBase = React.forwardRef<HTMLSpanElement, SwitchProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-describedby': ariaDescribedBy,
    'aria-labelledby': ariaLabelledBy,
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
  const labelId = React.useId();


  // ----
  // Component Render
  // ----
  const hasDescription = isPresent(description);
  /* Named by its label alone: the row is a `<label>` too, and would bring the description into the name */
  const labelledBy = ariaLabelledBy ?? (isPresent(children) ? labelId : undefined);

  return (
    <Stack
      as={'label'}
      data-slot={'switch'}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      direction={'horizontal'}
      align={'start'}
      gap={2}
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
        aria-labelledby={labelledBy}
        aria-describedby={[ ariaDescribedBy, hasDescription ? descriptionId : undefined ].filter(Boolean).join(' ') || undefined}
        aria-busy={pending || undefined}
        data-slot={'switch-track'}
        render={<Stack gap={0} as={'span'} inline direction={'horizontal'} align={'center'} />}
        className={TRACK}
      >
        <SwitchPrimitive.Thumb data-slot={'switch-thumb'} className={THUMB} />
      </SwitchPrimitive.Root>

      <ChoiceText label={children} description={description} labelId={labelId} descriptionId={descriptionId} />
    </Stack>
  );

});

SwitchBase.displayName = 'Switch';

/** Bound to a form through `binding`: see `bindable` in core */
export const Switch = bindable(SwitchBase, {
  kind: 'boolean',
  bind: (field: BoundValue<boolean>) => ({
    name           : field.name,
    ref            : field.ref,
    checked        : field.value === true,
    onCheckedChange: field.onChange,
    onBlur         : field.onBlur
  })
});
