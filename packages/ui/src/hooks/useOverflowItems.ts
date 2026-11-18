'use client';

import * as React from 'react';


/* --------
 * Types Definition
 * -------- */

export interface OverflowItemsOptions {
  /** How many items: before the first measure they are all shown */
  count: number;

  /** The space between two items, in pixels */
  gap: number;

  /**
   * The room the "More" control takes once something overflows, its gap and divider included. Leave it
   * out to measure it: a child of the copy marked `data-overflow-reserve` is the control, not an item
   */
  reserve?: number;

  /** An item that never goes into the overflow: the open tab. It takes the last visible place */
  pinned?: number;

  /** The width the items may use, read from the container. Defaults to its content width */
  available?: (container: HTMLElement) => number;
}

export interface OverflowItems {
  /** The indexes shown in the row, in order: the pinned one may come last, out of its place */
  visible: readonly number[];

  /** The indexes in the overflow, in their original order */
  overflow: readonly number[];
}

interface Measures {
  available: number;
  widths: readonly number[];
  reserve: number;
}


/* --------
 * Helpers
 * -------- */

/** Which items fit, as a pure function of the measures: no frame where the pinned item is missing */
export function fitItems(
  widths: readonly number[],
  available: number,
  options: { gap: number; reserve: number; pinned?: number }
): OverflowItems {
  const { gap, pinned, reserve } = options;
  const all = widths.map((_, index) => index);
  const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, widths.length - 1);

  if (widths.length === 0 || total <= available) {
    return { visible: all, overflow: [] };
  }

  const room = available - reserve;
  const visible: number[] = [];
  let used = 0;

  for (const index of all) {
    const width = widths[index] + (visible.length > 0 ? gap : 0);

    if (used + width > room) {
      break;
    }

    visible.push(index);
    used += width;
  }

  if (pinned !== undefined && pinned >= 0 && pinned < widths.length && !visible.includes(pinned)) {
    const pinnedWidth = (): number => widths[pinned] + (visible.length > 0 ? gap : 0);

    while (visible.length > 0 && used + pinnedWidth() > room) {
      const last = visible.pop() as number;

      used -= widths[last] + (visible.length > 0 ? gap : 0);
    }

    visible.push(pinned);
  }

  return { visible, overflow: all.filter((index) => !visible.includes(index)) };
}


/* --------
 * Hook Definition
 * -------- */

/**
 * Which items of a row fit, and which go into a "More" menu: the tabs of a detail, the tabs of a
 * header. The widths come from a hidden copy of the row (`measureRef`, `aria-hidden` and `inert`),
 * one child per item, so measuring never moves what the user sees.
 *
 * ```tsx
 * const { visible, overflow } = useOverflowItems(rowRef, copyRef, { count: tabs.length, gap: 4, reserve: 88, pinned: active });
 * ```
 *
 * It measures again when the row or the copy changes size, so a count that arrives late is taken in.
 */
export function useOverflowItems(
  containerRef: React.RefObject<HTMLElement | null>,
  measureRef: React.RefObject<HTMLElement | null>,
  options: OverflowItemsOptions
): OverflowItems {

  // ----
  // Options Deconstruct
  // ----
  const { available: readAvailable, count, gap, pinned, reserve } = options;


  // ----
  // Internal State
  // ----
  const [ measures, setMeasures ] = React.useState<Measures | null>(null);
  const readRef = React.useRef(readAvailable);

  React.useEffect(() => {
    readRef.current = readAvailable;
  });


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    const container = containerRef.current;
    const copy = measureRef.current;

    if (!container || !copy) {
      return undefined;
    }

    const measure = (): void => {
      const available = readRef.current ? readRef.current(container) : container.clientWidth;
      const children = Array.from(copy.children);
      const reserveElement = children.find((child) => child.hasAttribute('data-overflow-reserve'));
      const widths = children.filter((child) => child !== reserveElement).map((child) => child.getBoundingClientRect().width);
      const measuredReserve = reserveElement ? reserveElement.getBoundingClientRect().width : 0;

      setMeasures((previous) => (
        previous
        && previous.available === available
        && previous.reserve === measuredReserve
        && previous.widths.length === widths.length
        && previous.widths.every((width, index) => width === widths[index])
          ? previous
          : { available, widths, reserve: measuredReserve }
      ));
    };

    const observer = new ResizeObserver(measure);

    observer.observe(container);
    observer.observe(copy);
    measure();

    return () => observer.disconnect();
  }, [ containerRef, measureRef ]);


  // ----
  // Hook Return
  // ----
  if (!measures || measures.widths.length !== count) {
    return { visible: Array.from({ length: count }, (_, index) => index), overflow: [] };
  }

  return fitItems(measures.widths, measures.available, { gap, pinned, reserve: reserve ?? measures.reserve });

}
