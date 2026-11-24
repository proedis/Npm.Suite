'use client';

import * as React from 'react';

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';

import { optionalContextBuilder } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { CONTROL_HEIGHT } from '../../internal/control';
import { isPresent } from '../../internal/presence';

import { handleRovingKeyDown } from '../roving/roving';
import { Tooltip } from '../tooltip/Tooltip';

import {
  FOCUS_INSIDE,
  PRESSABLE_BASE,
  PRESSABLE_CONTENT,
  PRESSABLE_OFF,
  PRESSABLE_ON,
  PRESSABLE_ON_LAYERS
} from './toggleStyles';

import type { BaseProps } from '../../core/base';
import type { ControlSize } from '../../core/control';
import type { SpacingValue } from '../../core/responsive';


/* --------
 * Types Definition
 * -------- */

export type ToggleSize = ControlSize;

export interface StrictToggleProps extends BaseProps {
  /** The icon, as a node */
  leading?: React.ReactNode;

  pressed?: boolean;

  /** Outside a group only */
  defaultPressed?: boolean;

  onPressedChange?: (pressed: boolean) => void;

  /** Inside a group, the item's value, required */
  value?: string;

  /** `sm` in a bar, `md` in an action bar, `lg` next to large fields. Defaults to `md`, or to the group's */
  size?: ToggleSize;

  /** Off and still reachable: the tooltip says why, through `disabledReason` */
  disabled?: boolean;

  /** The second line of the tooltip of a disabled toggle */
  disabledReason?: React.ReactNode;

  /** A change is being saved: clicks are ignored, nothing changes in its look */
  pending?: boolean;

  className?: string;
}

/**
 * A toggle always has a name: its visible label, or, icon only, an `aria-label`, which is also the
 * text of its tooltip. The type asks for one of the two rather than trusting a comment.
 */
export type ToggleNameProps =
  | {
    /** The visible label, optional with `leading`. It does not change with the state: the state is `aria-pressed` */
    children: React.ReactNode;
    'aria-label'?: string;
  }
  | { children?: undefined; 'aria-label': string };

export type ToggleProps = StrictToggleProps & ToggleNameProps & Omit<
  React.ComponentProps<'button'>,
  keyof StrictToggleProps | 'children' | 'aria-label' | 'ref' | 'value' | 'defaultValue' | 'onChange'
>;

export interface StrictToggleGroupProps extends BaseProps {
  /** The items on */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;

  /** For every item */
  size?: ToggleSize;

  /** The whole group: the items stay in the arrow cycle */
  disabled?: boolean;

  /** Repeated in the tooltip of every item while the group is disabled */
  disabledReason?: React.ReactNode;

  pending?: boolean;

  children: React.ReactNode;
  className?: string;
}

/** A group always has a name, and the type asks for it */
export type ToggleGroupNameProps =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type ToggleGroupProps = StrictToggleGroupProps & ToggleGroupNameProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictToggleGroupProps | 'aria-label' | 'aria-labelledby' | 'ref' | 'defaultValue' | 'onChange'
>;

interface ToggleGroupContextValue {
  size: ToggleSize;
  disabled: boolean;
  disabledReason?: React.ReactNode;
  pending: boolean;
}


/* --------
 * Constants Definition
 * -------- */

/** The button's own sizes, with the side of the icon 2px closer to the edge */
const SIZES: Readonly<Record<ToggleSize, string>> = {
  sm: `${CONTROL_HEIGHT.sm} rounded-control px-2.5 text-xs has-[[data-slot=toggle-leading]]:ps-2 [&_svg]:size-3.5`,
  md: `${CONTROL_HEIGHT.md} rounded-control px-3 text-sm has-[[data-slot=toggle-leading]]:ps-2.5 [&_svg]:size-4`,
  lg: `${CONTROL_HEIGHT.lg} rounded-control px-4 text-sm has-[[data-slot=toggle-leading]]:ps-3 [&_svg]:size-4`
};

const CONTENT_GAP: Readonly<Record<ToggleSize, SpacingValue>> = {
  sm: 1,
  md: 1.5,
  lg: 1.5
};

/** Alone: an outline 2px away and a halo, as the Button. In a group: inside, and a card line over the fill */
const FOCUS_ALONE = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-7 focus-visible:ring-ring/20';
const FOCUS_IN_GROUP = cn(FOCUS_INSIDE, 'data-pressed:focus-visible:ring-3 data-pressed:focus-visible:ring-inset data-pressed:focus-visible:ring-card');

const [ ToggleGroupContext, useToggleGroupContext ] = optionalContextBuilder<ToggleGroupContextValue | null>('ToggleGroup', null);


/* --------
 * Component Definition
 * -------- */

/**
 * A button that stays on, in a bar: a view option or a tool. Off it is a `plain muted` button, on it
 * is filled with `primary`. Not for forms: a value in a form is a Checkbox.
 *
 * ```tsx
 * <Toggle pressed={compact} onPressedChange={setCompact}>Compact view</Toggle>
 * <Toggle aria-label={'Auto refresh'} leading={<Refresh />} pressed={auto} onPressedChange={setAuto} />
 * ```
 *
 * Disabled and pending are never passed to Base UI as `disabled`: that would take the item out of
 * the Tab order and of the arrows. They render `aria-disabled` and `data-disabled` and cancel the
 * change, so a disabled toggle keeps its tooltip with the reason. Icon only, the tooltip says what
 * `aria-label` says.
 *
 * Parts with a slot: `toggle` (with `data-size`, `data-pressed`, `data-disabled`, `data-pending`,
 * `data-icon-only`), `toggle-content`, `toggle-leading`.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    children,
    className,
    defaultPressed,
    disabled = false,
    disabledReason,
    leading,
    onPressedChange,
    pending = false,
    pressed,
    size,
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const group = useToggleGroupContext();


  // ----
  // Style Computation
  // ----
  const resolvedSize = size ?? group?.size ?? 'md';
  const isDisabled = disabled || (group?.disabled ?? false);
  const isPending = pending || (group?.pending ?? false);
  const reason = disabled ? disabledReason : group?.disabled ? group.disabledReason ?? disabledReason : undefined;
  const hasText = isPresent(children);
  const iconOnly = !hasText;


  // ----
  // Handlers
  // ----
  const handlePressedChange = (next: boolean, details: TogglePrimitive.ChangeEventDetails): void => {
    if (isDisabled || isPending) {
      details.cancel();
      return;
    }

    onPressedChange?.(next);
  };


  // ----
  // Component Render
  // ----
  const toggle = (
    <TogglePrimitive
      {...rest}
      ref={ref}
      value={value}
      pressed={pressed}
      defaultPressed={group ? undefined : defaultPressed}
      onPressedChange={handlePressedChange}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      data-disabled={isDisabled || undefined}
      data-pending={isPending || undefined}
      data-icon-only={iconOnly || undefined}
      data-size={resolvedSize}
      data-slot={'toggle'}
      render={<Stack gap={0} as={'button'} inline direction={'horizontal'} align={'center'} justify={'center'} />}
      className={cn(
        PRESSABLE_BASE,
        PRESSABLE_OFF,
        PRESSABLE_ON,
        PRESSABLE_ON_LAYERS,
        SIZES[resolvedSize],
        iconOnly && 'aspect-square px-0 has-[[data-slot=toggle-leading]]:ps-0',
        group ? FOCUS_IN_GROUP : FOCUS_ALONE,
        isPending && 'cursor-default',
        baseClasses,
        className
      )}
    >
      <Stack
        as={'span'}
        data-slot={'toggle-content'}
        inline
        direction={'horizontal'}
        align={'center'}
        gap={CONTENT_GAP[resolvedSize]}
        className={PRESSABLE_CONTENT}
      >
        {leading !== null && leading !== undefined && (
          <Stack gap={0} as={'span'} data-slot={'toggle-leading'} inline direction={'horizontal'}>{leading}</Stack>
        )}
        {children}
      </Stack>
    </TogglePrimitive>
  );

  /* The name of an icon is shown on hover; the reason of a disabled one too, under its name */
  const showsTooltip = iconOnly || (isDisabled && reason !== undefined && reason !== null);

  if (!showsTooltip) {
    return toggle;
  }

  return (
    <Tooltip content={iconOnly ? ariaLabel : children} description={isDisabled ? reason : undefined}>
      {toggle}
    </Tooltip>
  );

});

Toggle.displayName = 'Toggle';


/**
 * Toggles that are on together: "Columns", "Layers". Always more than one may be on; one choice among
 * views is a `SegmentedControl`. One Tab stop for the group, the arrows move between items and loop.
 *
 * ```tsx
 * <ToggleGroup aria-label={'Visible columns'} value={columns} onValueChange={setColumns} size={'sm'}>
 *   <Toggle value={'code'}>Code</Toggle>
 *   <Toggle value={'state'}>State</Toggle>
 * </ToggleGroup>
 * ```
 *
 * Parts with a slot: `toggle-group` (with `data-size`, `data-disabled`, `data-pending`).
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    defaultValue,
    disabled = false,
    disabledReason,
    onValueChange,
    pending = false,
    size = 'md',
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Memoized Data
  // ----
  const context = React.useMemo<ToggleGroupContextValue>(
    () => ({ size, disabled, disabledReason, pending }),
    [ size, disabled, disabledReason, pending ]
  );


  // ----
  // Handlers
  // ----
  const handleValueChange = (next: string[], details: ToggleGroupPrimitive.ChangeEventDetails): void => {
    if (disabled || pending) {
      details.cancel();
      return;
    }

    onValueChange?.(next);
  };


  // ----
  // Component Render
  // ----
  return (
    <ToggleGroupContext.Provider value={context}>
      <ToggleGroupPrimitive
        {...rest}
        ref={ref}
        multiple
        loopFocus
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          rest.onKeyDown?.(event);
          handleRovingKeyDown(event, '[data-slot=toggle]');
        }}
        aria-disabled={disabled || undefined}
        data-slot={'toggle-group'}
        data-size={size}
        data-disabled={disabled || undefined}
        data-pending={pending || undefined}
        render={<Stack inline direction={'horizontal'} align={'center'} gap={1} />}
        className={cn('shrink-0', baseClasses, className)}
      >
        {children}
      </ToggleGroupPrimitive>
    </ToggleGroupContext.Provider>
  );

});

ToggleGroup.displayName = 'ToggleGroup';
