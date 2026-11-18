'use client';

import * as React from 'react';

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';

import { cn } from '../../core/cn';

import { handleRovingKeyDown } from '../roving/roving';
import { FOCUS_INSIDE, PRESSABLE_BASE, PRESSABLE_CONTENT, PRESSABLE_OFF, PRESSABLE_ON } from '../toggle/toggleStyles';
import { Tooltip } from '../tooltip/Tooltip';


/* --------
 * Types Definition
 * -------- */

export type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedControlProps {
  /** The chosen view. Never empty: one of this and `defaultValue` is required */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  /** `sm` in a card header or a 28px bar, `md` in a page header. Defaults to `md` */
  size?: SegmentedControlSize;

  /** The whole control, with the reason, repeated in the tooltip of every item */
  disabled?: boolean;
  disabledReason?: React.ReactNode;

  /** One of the two is required: "View", "Period" */
  'aria-label'?: string;
  'aria-labelledby'?: string;

  children: React.ReactNode;
  className?: string;
}

export interface SegmentedControlItemProps {
  value: string;

  /** The visible label, one word */
  children?: React.ReactNode;

  /** The icon, as a node */
  leading?: React.ReactNode;

  /** Required without `children`; it is also the text of the tooltip */
  'aria-label'?: string;

  /** Never on the chosen item: a view left without data stays chosen and its content says so */
  disabled?: boolean;
  disabledReason?: React.ReactNode;

  className?: string;
}

interface SegmentedContextValue {
  size: SegmentedControlSize;
  disabled: boolean;
  disabledReason?: React.ReactNode;

  /** The chosen value, and whether the focus is inside: from outside, only the chosen item is a Tab stop */
  value: string | undefined;
  focusInside: boolean;
}


/* --------
 * Constants Definition
 * -------- */

/**
 * The rail: `muted` with a 1px inner line, the items in equal columns as wide as the longest. Its
 * height is the control's, so the items are what the padding leaves: 24 in 32, 22 in 28.
 */
const RAIL_SIZES: Readonly<Record<SegmentedControlSize, string>> = {
  md: 'h-control-md gap-1 p-1',
  sm: 'h-control-sm gap-0.75 p-0.75'
};

/** The item, and an active area reaching half the gap and the rail's edge: a click between two never misses */
const ITEM_SIZES: Readonly<Record<SegmentedControlSize, string>> = {
  md: 'px-4 text-sm has-[[data-slot=segmented-control-leading]]:ps-3.5 data-icon-only:w-9 [&_svg]:size-4 after:-inset-x-0.5 after:-inset-y-1',
  sm: 'px-3 text-xs has-[[data-slot=segmented-control-leading]]:ps-2.5 data-icon-only:w-7.5 [&_svg]:size-3.5 after:-inset-x-0.25 after:-inset-y-0.75'
};

const CONTENT_GAP: Readonly<Record<SegmentedControlSize, string>> = {
  md: 'gap-1.5',
  sm: 'gap-1'
};

const SegmentedContext = React.createContext<SegmentedContextValue | null>(null);


/* --------
 * Helpers
 * -------- */

function SegmentedControlItem(props: SegmentedControlItemProps, ref: React.ForwardedRef<HTMLButtonElement>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    children,
    className,
    disabled = false,
    disabledReason,
    leading,
    value
  } = props;


  // ----
  // Internal Hooks
  // ----
  const context = React.useContext(SegmentedContext);


  // ----
  // Style Computation
  // ----
  const size = context?.size ?? 'md';
  const isDisabled = disabled || (context?.disabled ?? false);
  const reason = context?.disabled ? context.disabledReason ?? disabledReason : disabled ? disabledReason : undefined;
  const iconOnly = children === null || children === undefined || children === false || children === '';

  /* Coming in with Tab, the focus lands on the chosen item, wherever the arrows left it */
  const tabStop = context && !context.focusInside ? { tabIndex: context.value === value ? 0 : -1 } : {};


  // ----
  // Handlers
  // ----
  const handlePressedChange = (_pressed: boolean, details: TogglePrimitive.ChangeEventDetails): void => {
    if (isDisabled) {
      details.cancel();
    }
  };


  // ----
  // Component Render
  // ----
  const item = (
    <TogglePrimitive
      {...tabStop}
      ref={ref}
      value={value}
      onPressedChange={handlePressedChange}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      data-disabled={isDisabled ? '' : undefined}
      data-icon-only={iconOnly ? '' : undefined}
      data-slot={'segmented-control-item'}
      className={cn(
        PRESSABLE_BASE,
        PRESSABLE_OFF,
        PRESSABLE_ON,
        ITEM_SIZES[size],
        'h-full rounded-sm after:absolute',
        FOCUS_INSIDE,
        'data-pressed:cursor-default data-pressed:focus-visible:outline-offset-1',
        className
      )}
    >
      <span data-slot={'segmented-control-content'} className={cn(PRESSABLE_CONTENT, CONTENT_GAP[size])}>
        {leading !== null && leading !== undefined && (
          <span data-slot={'segmented-control-leading'} className={'inline-flex'}>{leading}</span>
        )}
        {children}
      </span>
    </TogglePrimitive>
  );

  const showsTooltip = iconOnly || (isDisabled && reason !== undefined && reason !== null);

  if (!showsTooltip) {
    return item;
  }

  return (
    <Tooltip content={iconOnly ? ariaLabel : children} description={isDisabled ? reason : undefined}>
      {item}
    </Tooltip>
  );

}


/* --------
 * Component Definition
 * -------- */

/**
 * One choice among a few views of the same thing: Table or Map, Day, Week or Month. A grey rail with
 * the items inside; the chosen one is filled with `primary`. The choice applies at once and one item
 * is always chosen. In headers and bars, not in forms: a value in a form is a Radio.
 *
 * ```tsx
 * <SegmentedControl aria-label={'View'} value={view} onValueChange={setView}>
 *   <SegmentedControl.Item value={'table'}>Table</SegmentedControl.Item>
 *   <SegmentedControl.Item value={'map'}>Map</SegmentedControl.Item>
 * </SegmentedControl>
 * ```
 *
 * The arrows move the focus, not the choice: a view that loads a map does not start while passing
 * over it. Space or Enter chooses. Tab enters on the chosen item, whatever the arrows did before. A
 * click on the chosen item does not empty the control. Disabled items stay in the arrow cycle with
 * their tooltip; the chosen item is never disabled. A group with `aria-pressed` buttons, not a
 * `radiogroup` (the arrows would choose) nor a `tablist` (it asks for panels).
 *
 * Parts with a slot: `segmented-control` (with `data-size`, `data-disabled`), `segmented-control-item`
 * (with `data-pressed`, `data-disabled`, `data-icon-only`), `segmented-control-content`,
 * `segmented-control-leading`.
 */
function SegmentedControlRoot(props: SegmentedControlProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    className,
    defaultValue,
    disabled = false,
    disabledReason,
    onValueChange,
    size = 'md',
    value
  } = props;


  // ----
  // Internal State
  // ----
  const [ ownValue, setOwnValue ] = React.useState(defaultValue);
  const [ focusInside, setFocusInside ] = React.useState(false);

  const chosen = value !== undefined ? value : ownValue;


  // ----
  // Memoized Data
  // ----
  const context = React.useMemo<SegmentedContextValue>(
    () => ({ size, disabled, disabledReason, value: chosen, focusInside }),
    [ size, disabled, disabledReason, chosen, focusInside ]
  );


  // ----
  // Handlers
  // ----
  const handleValueChange = (next: string[], details: ToggleGroupPrimitive.ChangeEventDetails): void => {
    /* One item is always chosen: a click on the chosen one would empty the control */
    if (disabled || next.length === 0) {
      details.cancel();
      return;
    }

    if (value === undefined) {
      setOwnValue(next[0]);
    }

    onValueChange?.(next[0]);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
      setFocusInside(false);
    }
  };


  // ----
  // Component Render
  // ----
  return (
    <SegmentedContext.Provider value={context}>
      <ToggleGroupPrimitive
        loopFocus
        value={chosen !== undefined ? [ chosen ] : []}
        onValueChange={handleValueChange}
        onFocus={() => setFocusInside(true)}
        onBlur={handleBlur}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => handleRovingKeyDown(event, '[data-slot=segmented-control-item]')}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={disabled || undefined}
        data-slot={'segmented-control'}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        className={cn(
          'inline-grid shrink-0 grid-flow-col auto-cols-fr items-stretch rounded-md bg-muted inset-ring inset-ring-border',
          'has-data-icon-only:auto-cols-auto',

          /* Transparent until the system draws borders itself: then it becomes the frame */
          'outline-1 outline-transparent',
          RAIL_SIZES[size],
          className
        )}
      >
        {children}
      </ToggleGroupPrimitive>
    </SegmentedContext.Provider>
  );

}


export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(SegmentedControlItem)
});

SegmentedControlRoot.displayName = 'SegmentedControl';
SegmentedControl.Item.displayName = 'SegmentedControl.Item';
