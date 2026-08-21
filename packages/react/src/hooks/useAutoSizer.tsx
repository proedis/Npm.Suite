import * as React from 'react';

import { useSyncedRef } from './useSyncedRef';


/* --------
 * Internal Types
 * -------- */
export interface UseAutoSizerOptions {
  /** Stop measuring, keeping the last size. For a panel that is collapsed, or a tab that is hidden */
  disabled?: boolean;

  /** Skip the height computation entirely and answer with this value */
  fixedHeight?: number;

  /** Skip the width computation entirely and answer with this value */
  fixedWidth?: number;

  /** Never grow taller than this */
  maxHeight?: number;

  /** Never grow wider than this */
  maxWidth?: number;

  /** Never shrink shorter than this */
  minHeight?: number;

  /** Never shrink narrower than this */
  minWidth?: number;

  /** Measure the element's own height instead of the room left below it */
  useOwnHeight?: boolean;

  /** Measure the element's own width instead of the room left beside it */
  useOwnWidth?: boolean;
}


export interface AutoSizerSize {
  height: number;

  width: number;
}


/** The measurement anchor: a plain `div` that reports the room around it. */
export type AutoSizerComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<'div'>> & React.RefAttributes<HTMLDivElement>
>;


export type UseAutoSizerReturn = [ AutoSizerComponent, AutoSizerSize ];


/** The room the ancestors still need after the element, on each axis */
export interface AncestorsSpace {
  bottom: number;

  right: number;
}


/* --------
 * Utilities
 * -------- */

/**
 * Cross-realm `instanceof HTMLElement`.
 *
 * An element rendered into a portal, an iframe or a popup window belongs to a different realm, where
 * the global `HTMLElement` is a different constructor — so the plain `instanceof` answers `false` on
 * a perfectly valid element. Asking its own document's view keeps the walk working there.
 */
function isHtmlElement(element: Element | null | undefined): element is HTMLElement {
  const view = element?.ownerDocument?.defaultView;

  return !!view && element instanceof view.HTMLElement;
}


/**
 * Sum the space every ancestor still needs *after* the element, walking up to the document.
 *
 * This is what makes the hook worth having. An element's `getBoundingClientRect().top` says where it
 * starts; the room left below it is the rest of the viewport **minus** the bottom padding, margin and
 * border of each ancestor — otherwise a table filling "the rest of the screen" overflows its card by
 * exactly the card's own padding, and the page grows a scrollbar nobody asked for.
 *
 * Exported because it is the useful half on its own: anything sizing an element it does not own — a
 * canvas, a third-party widget — needs the same number and has no reason to reimplement the walk.
 *
 * @param element - Where to start. Usually the parent of the element being sized.
 */
export function getAncestorsSpace(element: HTMLElement | null): AncestorsSpace {
  const space: AncestorsSpace = { bottom: 0, right: 0 };

  let current: HTMLElement | null = element;

  while (isHtmlElement(current)) {
    const styles = current.ownerDocument.defaultView!.getComputedStyle(current);

    space.bottom += (parseFloat(styles.marginBottom) || 0)
      + (parseFloat(styles.paddingBottom) || 0)
      + (parseFloat(styles.borderBottomWidth) || 0);

    space.right += (parseFloat(styles.marginRight) || 0)
      + (parseFloat(styles.paddingRight) || 0)
      + (parseFloat(styles.borderRightWidth) || 0);

    current = current.parentElement;
  }

  return { bottom: Math.ceil(space.bottom), right: Math.ceil(space.right) };
}


function clamp(value: number, min: number | undefined, max: number | undefined): number {
  return Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.max(min ?? 0, value));
}


/* --------
 * Hook Definition
 * -------- */

/**
 * Measure the room an element has, and keep measuring it.
 *
 * The problem it replaces is `height: calc(100vh - 320px)`: a virtualized table, a map or a chart
 * needs a pixel height, the height available depends on everything rendered above it, and that
 * number is not a constant — a filter bar wraps onto a second line, a sidebar collapses, a
 * notification appears, the font finally loads.
 *
 * Render the returned component where the sized content goes, and use the numbers:
 *
 * ```tsx
 * const [ AutoSizer, { height } ] = useAutoSizer({ minHeight: 240 });
 *
 * return (
 *   <AutoSizer>
 *     <VirtualizedTable height={height} rows={rows} />
 *   </AutoSizer>
 * );
 * ```
 *
 * By default each axis answers with **the room left between the element and the far edge of the
 * viewport**, minus what the ancestors still need for their own padding, margin and border. Switch an
 * axis to `useOwnHeight` / `useOwnWidth` to measure the element itself instead, or pin it with
 * `fixedHeight` / `fixedWidth`.
 *
 * What it watches: the element and its parent through a `ResizeObserver`, the viewport through a
 * resize listener, and its own visibility through an `IntersectionObserver` — so a tab that was
 * hidden when it mounted measures itself the moment it is shown, instead of reporting zero until the
 * next window resize. Measurements are coalesced into one animation frame, because a resize observer
 * fires several times per frame while a layout settles.
 *
 * @param options - See `UseAutoSizerOptions`. Read through a ref, so changing them mid-life is safe
 *  and never re-subscribes the observers.
 */
export function useAutoSizer(options?: UseAutoSizerOptions): UseAutoSizerReturn {

  // ----
  // Internal State
  // ----

  /**
   * The element lives in state, not only in a ref: the observers must be attached when it mounts,
   * and an effect cannot depend on a ref's content.
   */
  const [ element, setElement ] = React.useState<HTMLDivElement | null>(null);

  const [ size, setSize ] = React.useState<AutoSizerSize>(() => ({
    height: options?.fixedHeight ?? 0,
    width : options?.fixedWidth ?? 0
  }));


  // ----
  // Internal Hooks
  // ----
  const optionsRef = useSyncedRef(options);

  /** The last emitted size, so the measure function never depends on the state it writes */
  const sizeRef = React.useRef(size);
  const frameRef = React.useRef<number | null>(null);


  // ----
  // Handlers
  // ----
  const measure = React.useCallback(
    () => {
      const {
        disabled,
        fixedHeight,
        fixedWidth,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        useOwnHeight,
        useOwnWidth
      } = optionsRef.current ?? {};

      if (!element || disabled) {
        return;
      }

      const view = element.ownerDocument.defaultView;

      if (!view) {
        return;
      }

      const space = getAncestorsSpace(element.parentElement);
      const rect = element.getBoundingClientRect();

      const nextHeight = clamp(
        fixedHeight
          ?? (useOwnHeight
            ? element.clientHeight
            : Math.max(view.innerHeight - rect.top - space.bottom, 0)),
        minHeight,
        maxHeight
      );

      const nextWidth = clamp(
        fixedWidth
          ?? (useOwnWidth
            ? element.clientWidth
            : Math.max(view.innerWidth - rect.left - space.right, 0)),
        minWidth,
        maxWidth
      );

      const { current: lastSize } = sizeRef;

      if (nextHeight === lastSize.height && nextWidth === lastSize.width) {
        return;
      }

      sizeRef.current = { height: nextHeight, width: nextWidth };
      setSize(sizeRef.current);
    },
    [ element, optionsRef ]
  );

  /**
   * Coalesce into one frame. A `ResizeObserver` fires repeatedly while a layout settles, and each
   * measurement reads the layout back — measuring once per frame is the difference between a smooth
   * resize and a janky one.
   */
  const scheduleMeasure = React.useCallback(
    () => {
      const view = element?.ownerDocument.defaultView;

      if (!view) {
        return;
      }

      if (frameRef.current !== null) {
        view.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = view.requestAnimationFrame(() => {
        frameRef.current = null;
        measure();
      });
    },
    [ element, measure ]
  );


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(
    () => {
      const view = element?.ownerDocument.defaultView;

      if (!element || !view) {
        return undefined;
      }

      /** Measure once, synchronously, so the first paint is not a frame late */
      measure();

      const observed = [ element, element.parentElement ].filter(Boolean) as Element[];

      const resizeObserver = new view.ResizeObserver(scheduleMeasure);
      observed.forEach(target => resizeObserver.observe(target));

      /**
       * A hidden element has a zero rect, so measuring it produces zero. Watching its visibility is
       * what makes a tab, an accordion or a collapsed panel measure itself the moment it appears.
       */
      const intersectionObserver = new view.IntersectionObserver(
        (entries) => {
          if (entries.some(entry => entry.isIntersecting)) {
            scheduleMeasure();
          }
        }
      );
      intersectionObserver.observe(element);

      view.addEventListener('resize', scheduleMeasure);
      view.addEventListener('orientationchange', scheduleMeasure);

      return () => {
        if (frameRef.current !== null) {
          view.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }

        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        view.removeEventListener('resize', scheduleMeasure);
        view.removeEventListener('orientationchange', scheduleMeasure);
      };
    },
    [ element, measure, scheduleMeasure ]
  );


  // ----
  // Memoized Data
  // ----

  /**
   * One element, and a stable component identity.
   *
   * Both matter. The ancestor of this hook rendered *two* divs — a zero-height "viewport detector"
   * plus the measured one — and spread the caller's props onto both, so a `className` with padding
   * was applied twice. And a component whose identity changes remounts its whole subtree, which for
   * a virtualized table means losing its scroll position on every resize.
   */
  const AutoSizer = React.useMemo(
    (): AutoSizerComponent => {
      const Component = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
        (props, forwardedRef) => {
          const handleRef = React.useCallback(
            (node: HTMLDivElement | null) => {
              setElement(node);

              if (typeof forwardedRef === 'function') {
                forwardedRef(node);
              }
              else if (forwardedRef) {
                forwardedRef.current = node;
              }
            },
            [ forwardedRef ]
          );

          return <div {...props} ref={handleRef} />;
        }
      );

      Component.displayName = 'AutoSizer';

      return Component;
    },
    []
  );


  // ----
  // Hook Return
  // ----
  return [ AutoSizer, size ];

}
