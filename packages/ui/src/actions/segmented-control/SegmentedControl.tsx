'use client';

import * as React from 'react';

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';

import { optionalContextBuilder, useEnhancedEffect, useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { CONTROL_HEIGHT } from '../../internal/control';
import { isPresent } from '../../internal/presence';

import { handleRovingKeyDown } from '../roving/roving';
import { FOCUS_INSIDE, PRESSABLE_BASE, PRESSABLE_CONTENT, PRESSABLE_OFF } from '../toggle/toggleStyles';
import { Tooltip } from '../tooltip/Tooltip';

import type { BaseProps } from '../../core/base';
import type { ControlSize } from '../../core/control';
import type { SpacingValue } from '../../core/responsive';


/* --------
 * Types Definition
 * -------- */

export type SegmentedControlSize = ControlSize;

export interface StrictSegmentedControlProps extends BaseProps {
  onValueChange?: (value: string) => void;

  /** `sm` in a card header or a bar, `md` in a page header, `lg` next to large fields. Defaults to `md` */
  size?: SegmentedControlSize;

  /** The whole control, with the reason, repeated in the tooltip of every item */
  disabled?: boolean;
  disabledReason?: React.ReactNode;

  children: React.ReactNode;
  className?: string;
}

/** The chosen view. Never empty, so the type asks for one of the two */
export type SegmentedControlValueProps =
  | { value: string; defaultValue?: undefined }
  | { value?: undefined; defaultValue: string };

/** A control always has a name, "View", "Period": `aria-label` or `aria-labelledby` */
export type SegmentedControlNameProps =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type SegmentedControlProps = StrictSegmentedControlProps & SegmentedControlValueProps & SegmentedControlNameProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictSegmentedControlProps | 'value' | 'defaultValue' | 'aria-label' | 'aria-labelledby' | 'ref' | 'onChange'
>;

export interface StrictSegmentedControlItemProps {
  value: string;

  /** The icon, as a node */
  leading?: React.ReactNode;

  /** Never on the chosen item: a view left without data stays chosen and its content says so */
  disabled?: boolean;
  disabledReason?: React.ReactNode;

  className?: string;
}

/** An item has a name: its visible label, one word, or, icon only, an `aria-label` that is also its tooltip */
export type SegmentedControlItemNameProps =
  | { children: React.ReactNode; 'aria-label'?: string }
  | { children?: undefined; 'aria-label': string };

export type SegmentedControlItemProps = StrictSegmentedControlItemProps & SegmentedControlItemNameProps & Omit<
  React.ComponentProps<'button'>,
  keyof StrictSegmentedControlItemProps | 'children' | 'aria-label' | 'ref' | 'defaultValue' | 'onChange'
>;

/** The box of the chosen item inside the rail, in pixels */
interface IndicatorBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** What the rail reads off its own items after every change of them */
interface RailLayout {
  /** The box of the chosen item, null when the value matches no item */
  indicator: IndicatorBox | null;

  /** The value of the item that takes the focus from outside */
  tabStop: string | null;
}

interface SegmentedContextValue {
  size: SegmentedControlSize;
  disabled: boolean;
  disabledReason?: React.ReactNode;

  /**
   * The item that is a Tab stop while the focus is outside: the chosen one, or, when the value matches
   * no item, the first enabled one. Null until the rail has been read, then the chosen value is used
   */
  tabStop: string | null;
  value: string | undefined;
  focusInside: boolean;
}


/* --------
 * Constants Definition
 * -------- */

/**
 * The rail: `muted` with a 1px inner line, the items in equal columns as wide as the longest. Its
 * height is the control's, so the items are what the padding leaves: 32 in 40, 28 in 36, 26 in 32.
 */
/* eslint-disable no-restricted-syntax -- the gap of the rail, a grid of implicit columns (see RAIL) */
const RAIL_SIZES: Readonly<Record<SegmentedControlSize, string>> = {
  lg: `${CONTROL_HEIGHT.lg} gap-1 p-1`,
  md: `${CONTROL_HEIGHT.md} gap-1 p-1`,
  sm: `${CONTROL_HEIGHT.sm} gap-0.75 p-0.75`
};
/* eslint-enable no-restricted-syntax */

/**
 * As many equal columns as there are items, as wide as the longest, with no count to give: a grid that
 * flows into implicit columns (`grid-flow-col auto-cols-fr`), which `columns` cannot say
 */
// eslint-disable-next-line no-restricted-syntax -- implicit columns from the items, not a column count
const RAIL = 'relative inline-grid shrink-0 grid-flow-col auto-cols-fr items-stretch rounded-md bg-muted inset-ring inset-ring-border';

/** The item, and an active area reaching half the gap and the rail's edge: a click between two never misses */
const ITEM_SIZES: Readonly<Record<SegmentedControlSize, string>> = {
  lg: 'px-4 text-sm has-[[data-slot=segmented-control-leading]]:ps-3.5 data-icon-only:w-10 [&_svg]:size-4 after:-inset-x-0.5 after:-inset-y-1',
  md: 'px-4 text-sm has-[[data-slot=segmented-control-leading]]:ps-3.5 data-icon-only:w-9 [&_svg]:size-4 after:-inset-x-0.5 after:-inset-y-1',
  sm: 'px-3 text-xs has-[[data-slot=segmented-control-leading]]:ps-2.5 data-icon-only:w-7.5 [&_svg]:size-3.5 after:-inset-x-0.25 after:-inset-y-0.75'
};

const CONTENT_GAP: Readonly<Record<SegmentedControlSize, SpacingValue>> = {
  lg: 1.5,
  md: 1.5,
  sm: 1
};

/**
 * The chosen item keeps the ink of `primary` and leaves the fill to the indicator, which slides from
 * the item chosen before: an item that fills itself fades in while the previous one fades out, and
 * the two half fills read as a flash. Under forced colours the item is Highlight itself
 */
const ITEM_ON = 'data-pressed:text-primary-foreground forced-colors:data-pressed:forced-highlight';

const INDICATOR = [
  'pointer-events-none absolute top-(--indicator-top) left-(--indicator-left) h-(--indicator-height) w-(--indicator-width)',
  'rounded-sm bg-primary data-disabled:bg-primary/50',
  'transition-all duration-200 ease-out motion-reduce:transition-none forced-colors:hidden'
].join(' ');

const ITEM_SELECTOR = '[data-slot=segmented-control-item]';

const [ SegmentedContext, useSegmentedContext ] = optionalContextBuilder<SegmentedContextValue | null>('Segmented', null);


/* --------
 * Helpers
 * -------- */

function sameLayout(a: RailLayout, b: RailLayout): boolean {
  const boxA = a.indicator;
  const boxB = b.indicator;

  return a.tabStop === b.tabStop && (boxA === boxB || (
    boxA !== null && boxB !== null
    && boxA.left === boxB.left && boxA.top === boxB.top && boxA.width === boxB.width && boxA.height === boxB.height
  ));
}

/** The chosen item's box and the Tab stop, read from the items the rail holds right now */
function readRail(rail: HTMLElement): RailLayout {
  const items = Array.from(rail.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
  const chosen = items.find((item) => item.hasAttribute('data-pressed'));
  const target = chosen ?? items.find((item) => !item.hasAttribute('data-disabled')) ?? items[0];

  return {
    indicator: chosen
      ? { left: chosen.offsetLeft, top: chosen.offsetTop, width: chosen.offsetWidth, height: chosen.offsetHeight }
      : null,
    tabStop: target?.dataset.value ?? null
  };
}

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
    value,
    ...rest
  } = props;


  // ----
  // Internal Hooks
  // ----
  const context = useSegmentedContext();


  // ----
  // Style Computation
  // ----
  const size = context?.size ?? 'md';
  const isDisabled = disabled || (context?.disabled ?? false);
  const reason = context?.disabled ? context.disabledReason ?? disabledReason : disabled ? disabledReason : undefined;
  const iconOnly = !isPresent(children);

  /*
   * Coming in with Tab, the focus lands on the chosen item, wherever the arrows left it. A value that
   * matches no item (the items arrive later, or the value is stale) would leave no Tab stop at all and
   * the control out of reach from the keyboard: the rail names the first enabled item instead
   */
  const tabTarget = context ? context.tabStop ?? context.value : undefined;
  const tabStop = context && !context.focusInside ? { tabIndex: tabTarget === value ? 0 : -1 } : {};


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
      {...rest}
      {...tabStop}
      ref={ref}
      value={value}
      onPressedChange={handlePressedChange}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      data-value={value}
      data-disabled={isDisabled || undefined}
      data-icon-only={iconOnly || undefined}
      data-slot={'segmented-control-item'}
      render={<Stack gap={0} as={'button'} inline direction={'horizontal'} align={'center'} justify={'center'} />}
      className={cn(
        PRESSABLE_BASE,
        'duration-200',
        PRESSABLE_OFF,
        ITEM_ON,
        ITEM_SIZES[size],
        'h-full rounded-sm after:absolute',
        FOCUS_INSIDE,
        'data-pressed:cursor-default data-pressed:focus-visible:outline-offset-1',
        className
      )}
    >
      <Stack
        as={'span'}
        data-slot={'segmented-control-content'}
        inline
        direction={'horizontal'}
        align={'center'}
        gap={CONTENT_GAP[size]}
        className={PRESSABLE_CONTENT}
      >
        {leading !== null && leading !== undefined && (
          <Stack gap={0} as={'span'} data-slot={'segmented-control-leading'} inline direction={'horizontal'}>{leading}</Stack>
        )}
        {children}
      </Stack>
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
 * Parts with a slot: `segmented-control` (with `data-size`, `data-disabled`), `segmented-control-indicator`
 * (the fill that slides under the chosen item), `segmented-control-item`
 * (with `data-value`, `data-pressed`, `data-disabled`, `data-icon-only`), `segmented-control-content`,
 * `segmented-control-leading`.
 */
const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlProps>((props, ref) => {

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
    size = 'md',
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal State
  // ----
  const [ ownValue, setOwnValue ] = React.useState(defaultValue);
  const [ focusInside, setFocusInside ] = React.useState(false);
  const [ layout, setLayout ] = React.useState<RailLayout>({ indicator: null, tabStop: null });

  const railRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(railRef, ref);

  const chosen = value !== undefined ? value : ownValue;


  // ----
  // Lifecycle Events
  // ----
  /*
   * The rail is read again whenever its items change, not when the props say so: a reordered or a
   * removed item moves the chosen one without changing the choice, an item arriving after the value
   * is the chosen one without the value changing, and Base UI sets `data-pressed` after the render.
   * The mutations say all of it; the sizes (a label, a font loading, the rail) are said by the
   * ResizeObserver, attached again to the items present after each mutation.
   */
  useEnhancedEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return undefined;
    }

    const measure = (): void => {
      const next = readRail(rail);

      setLayout((previous) => (sameLayout(previous, next) ? previous : next));
    };

    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

    const observeItems = (): void => {
      if (!resize) {
        return;
      }

      resize.disconnect();
      resize.observe(rail);
      rail.querySelectorAll(ITEM_SELECTOR).forEach((item) => resize.observe(item));
    };

    const mutations = typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
        observeItems();
        measure();
      });

    mutations?.observe(rail, { childList: true, subtree: true, attributes: true, attributeFilter: [ 'data-pressed', 'data-disabled' ] });
    observeItems();
    measure();

    return () => {
      mutations?.disconnect();
      resize?.disconnect();
    };
  }, [ size ]);


  // ----
  // Memoized Data
  // ----
  const context = React.useMemo<SegmentedContextValue>(
    () => ({ size, disabled, disabledReason, tabStop: layout.tabStop, value: chosen, focusInside }),
    [ size, disabled, disabledReason, layout.tabStop, chosen, focusInside ]
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
        {...rest}
        ref={handleRef}
        loopFocus
        value={chosen !== undefined ? [ chosen ] : []}
        onValueChange={handleValueChange}
        onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
          rest.onFocus?.(event);
          setFocusInside(true);
        }}
        onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
          rest.onBlur?.(event);
          handleBlur(event);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          rest.onKeyDown?.(event);
          handleRovingKeyDown(event, '[data-slot=segmented-control-item]');
        }}
        aria-disabled={disabled || undefined}
        data-slot={'segmented-control'}
        data-size={size}
        data-disabled={disabled || undefined}
        className={cn(
          RAIL,
          'has-data-icon-only:auto-cols-auto',

          /* Transparent until the system draws borders itself: then it becomes the frame */
          'outline-1 outline-transparent',
          RAIL_SIZES[size],
          baseClasses,
          className
        )}
      >
        {/* First, so every item paints over it; absolute, so it takes no cell of the grid */}
        {layout.indicator && (
          <span
            aria-hidden
            data-slot={'segmented-control-indicator'}
            data-disabled={disabled || undefined}
            className={INDICATOR}
            style={{
              '--indicator-left'  : `${layout.indicator.left}px`,
              '--indicator-top'   : `${layout.indicator.top}px`,
              '--indicator-width' : `${layout.indicator.width}px`,
              '--indicator-height': `${layout.indicator.height}px`
            } as React.CSSProperties}
          />
        )}
        {children}
      </ToggleGroupPrimitive>
    </SegmentedContext.Provider>
  );

});


export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(SegmentedControlItem)
});

SegmentedControlRoot.displayName = 'SegmentedControl';
SegmentedControl.Item.displayName = 'SegmentedControl.Item';
