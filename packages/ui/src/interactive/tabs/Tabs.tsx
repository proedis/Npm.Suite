'use client';

import * as React from 'react';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { inertValue, optionalContextBuilder, useOverflowItems } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { VisuallyHidden } from '../../components/VisuallyHidden';


import { Button } from '../button/Button';
import { ChevronGlyph } from '../list-panel/listPanel';
import { Menu } from '../menu/Menu';
import { Tooltip } from '../tooltip/Tooltip';

import type { BaseProps } from '../../core/base';


/* --------
 * Types Definition
 * -------- */

export type TabsSize = 'sm' | 'md';

export interface TabItem {
  readonly value: string;

  /** The visible name, one or two words: it never truncates nor wraps */
  readonly label: React.ReactNode;

  /** On every tab or on none */
  readonly leading?: React.ReactNode;

  /** Only on sections that are lists, 0 included; past 999 it reads "999+". Comes with the record */
  readonly count?: number;

  /** Required with `count`: what a screen reader hears after the name, "12 movements" */
  readonly countLabel?: string;

  /** A section that exists but is not needed now, with the reason. Never the open one */
  readonly disabled?: boolean;
  readonly disabledReason?: React.ReactNode;
}

export interface TabsLabels {
  /** The text of the "More" button that holds the tabs that do not fit */
  readonly overflow: string;
}

export interface StrictTabsProps extends BaseProps {
  /** The tabs, in their fixed order: the first is the most read */
  items: readonly TabItem[];

  onValueChange?: (value: string) => void;

  /** `sm` in a drawer or a card, `md` in a page. Defaults to `md` */
  size?: TabsSize;

  labels: TabsLabels;

  /** The panels: `Tabs.Panel` */
  children?: React.ReactNode;

  className?: string;
}

/** The open tab: one of `value` and `defaultValue` */
export type TabsValueProps =
  | { value: string; defaultValue?: undefined }
  | { value?: undefined; defaultValue: string };

/** The name of the list, normally the id of the page's or the drawer's title: one of the two */
export type TabsNameProps =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

/** The native props reach the root, around the list and the panels; the name goes to the list */
export type TabsProps = StrictTabsProps & TabsValueProps & TabsNameProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictTabsProps | 'value' | 'defaultValue' | 'aria-label' | 'aria-labelledby' | 'ref' | 'onChange'
>;

export interface StrictTabsPanelProps extends BaseProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export type TabsPanelProps = StrictTabsPanelProps & Omit<React.ComponentProps<'div'>, keyof StrictTabsPanelProps | 'ref'>;

interface TabsContextValue {
  value: string | undefined;
  items: readonly TabItem[];
  hidden: ReadonlySet<string>;
}


/* --------
 * Constants Definition
 * -------- */

/** No height of its own: a tab at the height of a control, and one step of padding around it */
const RAIL: Readonly<Record<TabsSize, string>> = {
  md: 'gap-1 rounded-lg p-1',
  sm: 'gap-1 rounded-md p-1'
};

const TAB_BASE = [
  'group/tab relative inline-flex shrink-0 cursor-pointer items-center justify-center',
  'border border-transparent font-medium whitespace-nowrap select-none outline-none',
  'transition-colors duration-200 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  'after:absolute',

  /* Closed: a muted ink that darkens under the pointer, a layer of its own ink at 8% and 16% */
  'not-data-active:text-muted-foreground',
  'not-data-active:not-data-disabled:hover:text-foreground',
  'not-data-active:not-data-disabled:hover:bg-linear-to-b not-data-active:not-data-disabled:hover:from-current/8 not-data-active:not-data-disabled:hover:to-current/8',
  'not-data-active:not-data-disabled:active:bg-linear-to-b not-data-active:not-data-disabled:active:from-current/16 not-data-active:not-data-disabled:active:to-current/16',

  /*
   * Open: the ink of `primary`, no change under the pointer. The fill is not the tab's: it is the
   * indicator below it, which slides from the tab that was open, so the two never fade at once
   */
  'data-active:cursor-default data-active:text-primary-foreground forced-colors:data-active:forced-highlight',

  /* The focus inside a closed tab, outside the open one */
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-active:focus-visible:outline-offset-1',

  'data-disabled:cursor-not-allowed'
].join(' ');

const TAB_SIZES: Readonly<Record<TabsSize, string>> = {
  md: 'h-control-md rounded-md px-4 text-sm has-[[data-slot=tabs-tab-leading]]:ps-3.5 [&_svg]:size-4 after:-inset-x-0.5 after:-inset-y-1',
  sm: 'h-control-sm rounded-sm px-3.5 text-xs has-[[data-slot=tabs-tab-leading]]:ps-3 [&_svg]:size-3.5 after:-inset-x-0.5 after:-inset-y-1'
};

const CONTENT_GAP: Readonly<Record<TabsSize, string>> = { md: 'gap-1.5', sm: 'gap-1' };

/**
 * The fill of the open tab, one element for the whole list: Base UI measures the open tab into the
 * `--active-tab-*` variables, and the fill slides there. Before it, the open tab painted its own fill
 * and the closed one faded its own out, and for a moment both were half there. Under forced colours
 * the tab is Highlight itself, so the indicator steps aside
 */
const INDICATOR = [
  'pointer-events-none absolute top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width)',
  'bg-primary transition-all duration-200 ease-out motion-reduce:transition-none forced-colors:hidden'
].join(' ');

const INDICATOR_RADIUS: Readonly<Record<TabsSize, string>> = { md: 'rounded-md', sm: 'rounded-sm' };

const PILL = [
  'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs leading-none font-semibold tabular-nums',
  'bg-muted text-muted-foreground group-hover/tab:bg-border',
  'group-data-active/tab:bg-card group-data-active/tab:text-primary-soft-foreground'
].join(' ');

const [ TabsContext, useTabsContext ] = optionalContextBuilder<TabsContextValue>('Tabs', { value: undefined, items: [], hidden: new Set() });


/* --------
 * Helpers
 * -------- */

/** The padding of the rail, which the tabs cannot use, as the page lays it out */
function railInset(row: HTMLElement): number {
  const rail = row.querySelector<HTMLElement>('[data-slot=tabs-rail]');

  if (!rail) {
    return 0;
  }

  const style = getComputedStyle(rail);

  return (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0);
}

function countText(count: number): string {
  return count > 999 ? '999+' : String(count);
}

function TabContent(props: { item: TabItem; size: TabsSize }): React.ReactNode {
  const { item, size } = props;

  return (
    <span data-slot={'tabs-tab-content'} className={cn('inline-flex items-center group-data-disabled/tab:opacity-50', CONTENT_GAP[size])}>
      {item.leading !== null && item.leading !== undefined && (
        <span data-slot={'tabs-tab-leading'} className={'inline-flex'}>{item.leading}</span>
      )}
      {item.label}
      {item.count !== undefined && (
        <React.Fragment>
          <span aria-hidden data-slot={'tabs-tab-count'} className={PILL}>{countText(item.count)}</span>
          {item.countLabel && <VisuallyHidden>{`, ${item.countLabel}`}</VisuallyHidden>}
        </React.Fragment>
      )}
    </span>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The sections of one thing, read one at a time: the data, the movements, the attachments of a
 * container. A white rail raised like a card, with the tabs inside; the open one is filled with
 * `primary`. Above the panel, in a detail page, a drawer or a card.
 *
 * ```tsx
 * <Tabs
 *   aria-labelledby={titleId}
 *   items={[ { value: 'data', label: 'Data' }, { value: 'moves', label: 'Movements', count: 12, countLabel: '12 movements' } ]}
 *   value={tab} onValueChange={setTab}
 *   labels={{ overflow: 'More' }}
 * >
 *   <Tabs.Panel value={'data'}>…</Tabs.Panel>
 *   <Tabs.Panel value={'moves'}>…</Tabs.Panel>
 * </Tabs>
 * ```
 *
 * The arrows move the focus, not the open tab: a panel that loads does not start while passing over
 * it. Tab enters on the open tab. Disabled tabs stay in the arrow cycle with the reason in their
 * tooltip. What does not fit goes into "More", a menu after a divider, outside the tab list; a tab
 * chosen there takes the last visible place, and the open one is never in the menu. A panel mounts
 * the first time it opens and is kept, with its filters and scroll.
 *
 * The tabs are data rather than children: the overflow measures them, reorders them and draws them
 * again as menu items, which children wrapped in fragments or components would not allow.
 *
 * Parts with a slot: `tabs` (the root, where `className` lands), `tabs-row`, `tabs-rail` (with
 * `data-size`), `tabs-list`, `tabs-indicator`, `tabs-tab`, `tabs-tab-content`, `tabs-tab-leading`,
 * `tabs-tab-count`, `tabs-more`, `tabs-panel`, and `tabs-measure`, the hidden copy whose tabs carry
 * `tabs-tab` too.
 */
const TabsRoot = React.forwardRef<HTMLDivElement, TabsProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    className,
    defaultValue,
    items,
    labels,
    onValueChange,
    size = 'md',
    value: valueProp,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const rowRef = React.useRef<HTMLDivElement>(null);
  const copyRef = React.useRef<HTMLDivElement>(null);


  // ----
  // Internal State
  // ----
  const [ ownValue, setOwnValue ] = React.useState(defaultValue ?? items[0]?.value);
  const [ focusInside, setFocusInside ] = React.useState(false);

  const value = valueProp ?? ownValue;
  const activeIndex = items.findIndex((item) => item.value === value);

  /*
   * Gap and padding are read from the page, never written here in pixels: they are `gap-1` and `p-1`,
   * steps of `--spacing`, and a product that rescales it or restyles the rail would otherwise get the
   * fit computed on the default widths.
   */
  const { overflow, visible } = useOverflowItems(rowRef, copyRef, {
    count    : items.length,
    pinned   : activeIndex >= 0 ? activeIndex : undefined,
    available: (container) => container.clientWidth - railInset(container)
  });


  // ----
  // Memoized Data
  // ----
  const context = React.useMemo<TabsContextValue>(() => ({
    value,
    items,
    hidden: new Set(overflow.map((index) => items[index].value))
  }), [ value, items, overflow ]);


  // ----
  // Handlers
  // ----
  const select = (next: string): void => {
    if (valueProp === undefined) {
      setOwnValue(next);
    }

    onValueChange?.(next);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
      setFocusInside(false);
    }
  };


  // ----
  // Component Render
  // ----
  const renderTab = (item: TabItem): React.ReactNode => {
    const isActive = item.value === value;
    const tabStop = focusInside ? {} : { tabIndex: isActive ? 0 : -1 };

    const tab = (
      <TabsPrimitive.Tab
        {...tabStop}
        value={item.value}
        disabled={item.disabled && !isActive}
        data-slot={'tabs-tab'}
        className={cn(TAB_BASE, TAB_SIZES[size])}
      >
        <TabContent item={item} size={size} />
      </TabsPrimitive.Tab>
    );

    if (item.disabled && item.disabledReason !== undefined && item.disabledReason !== null) {
      return (
        <Tooltip key={item.value} content={item.label} description={item.disabledReason}>
          {tab}
        </Tooltip>
      );
    }

    return <React.Fragment key={item.value}>{tab}</React.Fragment>;
  };

  const moreButton = (
    <Button
      size={'sm'}
      fill={'plain'}
      tone={'muted'}
      trailing={<ChevronGlyph />}
      data-slot={'tabs-more'}
      className={size === 'sm' ? undefined : 'h-control-md'}
    >
      {labels.overflow}
    </Button>
  );

  return (
    <TabsContext.Provider value={context}>
      <TabsPrimitive.Root
        {...rest}
        ref={ref}
        value={value}
        onValueChange={(next: string, details: TabsPrimitive.Root.ChangeEventDetails) => {
          /* Only a choice of the user: never a tab picked by Base UI because another went away */
          if (details.reason === 'none') {
            select(next);
          }
        }}
        data-slot={'tabs'}
        className={cn('flex min-w-0 flex-col gap-3', baseClasses, className)}
      >
        <div ref={rowRef} data-slot={'tabs-row'} className={'relative flex w-full min-w-0'}>
          <div data-slot={'tabs-rail'} data-size={size} className={cn('inline-flex max-w-full items-center bg-card shadow-sm', RAIL[size])}>
            <TabsPrimitive.List
              activateOnFocus={false}
              loopFocus
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              data-slot={'tabs-list'}
              className={'relative flex items-center gap-1'}
              onFocus={() => setFocusInside(true)}
              onBlur={handleBlur}
            >
              {/* First, so every tab paints over it */}
              <TabsPrimitive.Indicator data-slot={'tabs-indicator'} className={cn(INDICATOR, INDICATOR_RADIUS[size])} />
              {visible.map((index) => renderTab(items[index]))}
            </TabsPrimitive.List>

            {overflow.length > 0 && (
              <React.Fragment>
                <span aria-hidden className={'mx-1 h-4 w-px shrink-0 bg-border'} />
                <Menu trigger={moreButton} aria-label={labels.overflow} align={'start'}>
                  {overflow.map((index) => {
                    const item = items[index];

                    return (
                      <Menu.Item
                        key={item.value}
                        icon={item.leading}
                        disabled={item.disabled}
                        description={item.disabled ? item.disabledReason : undefined}
                        onSelect={() => select(item.value)}
                      >
                        <span className={'inline-flex items-center gap-1.5'}>
                          {item.label}
                          {item.count !== undefined && <span aria-hidden className={PILL}>{countText(item.count)}</span>}
                          {item.count !== undefined && item.countLabel && <VisuallyHidden>{`, ${item.countLabel}`}</VisuallyHidden>}
                        </span>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              </React.Fragment>
            )}
          </div>

          {/*
            * A hidden copy of every tab, measured to know what fits. Its tabs carry the slot of the real
            * ones, so a product's rules for `[data-slot='tabs-tab']` size the copy too.
            */}
          <div
            ref={copyRef}
            data-slot={'tabs-measure'}
            aria-hidden
            inert={inertValue(true)}
            className={'pointer-events-none invisible absolute start-0 top-0 flex items-center gap-1'}
          >
            {items.map((item) => (
              <span key={item.value} data-slot={'tabs-tab'} className={cn(TAB_BASE, TAB_SIZES[size])}>
                <TabContent item={item} size={size} />
              </span>
            ))}
            <span data-overflow-reserve className={'inline-flex items-center gap-1 ps-1'}>
              <span className={'mx-1 h-4 w-px'} />
              <span className={'inline-flex items-center gap-1 px-2.5 text-xs font-medium [&_svg]:size-3.5'}>
                {labels.overflow}
                <ChevronGlyph />
              </span>
            </span>
          </div>
        </div>

        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  );

});

TabsRoot.displayName = 'Tabs';


/** A panel: mounted the first time its tab opens, then kept */
const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>((props, ref) => {
  const { children, className, value, ...others } = props;
  const { baseClasses, rest } = splitBaseProps(others);
  const { hidden, items, value: active } = useTabsContext();

  const isActive = active === value;
  const [ visited, setVisited ] = React.useState(isActive);

  if (isActive && !visited) {
    setVisited(true);
  }

  /* The tab of a panel in "More" is not in the list: the panel takes its name from it */
  const label = hidden.has(value) ? items.find((item) => item.value === value)?.label : undefined;

  return (
    <TabsPrimitive.Panel
      {...rest}
      ref={ref}
      value={value}
      keepMounted={visited}
      aria-label={typeof label === 'string' ? label : undefined}
      data-slot={'tabs-panel'}
      data-visited={visited || undefined}
      className={cn('outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring', baseClasses, className)}
    >
      {visited ? children : null}
    </TabsPrimitive.Panel>
  );
});

TabsPanel.displayName = 'Tabs.Panel';


export const Tabs = Object.assign(TabsRoot, {
  Panel: TabsPanel
});
