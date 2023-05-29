import * as React from 'react';

import { useMergedRef, useWindowEvent } from '@mantine/hooks';
import { useSafeState } from '@proedis/react';


/* --------
 * Internal Types
 * -------- */
interface UseAutoSizerOptions {
  /** Set a fixed height, removing height detection */
  fixedHeight?: number;

  /** Set a fixed width, removing width detection */
  fixedWidth?: number;

  /** Set parent element used to compute the size */
  parent?: HTMLElement | string;

  /** Set a max height */
  maxHeight?: number;

  /** Set a max width */
  maxWidth?: number;

  /** Set a min height */
  minHeight?: number;

  /** Set a min width */
  minWidth?: number;

  /** Tell the AutoSizer to use own height without computing from parent */
  useOwnHeight?: boolean;

  /** Tell the AutoSizer to use own width without computing from parent */
  useOwnWidth?: boolean;
}

interface UseAutoSizerReturnData {
  /** The height of the content */
  height: number;

  /** The width of the content */
  width: number;
}

type AutoSizerComponent =
  React.ForwardRefExoticComponent<React.PropsWithoutRef<React.PropsWithChildren<JSX.IntrinsicElements['div']>> & React.RefAttributes<HTMLDivElement>>;

type UseAutoSizerReturn = [ AutoSizerComponent, UseAutoSizerReturnData ];


/* --------
 * Utilities
 * -------- */
function isValidParentElement(element?: HTMLElement | Element | string | null): element is Element {
  /** Assert the element has a valid owner document and is a valid instance of HTMLElement */
  return (
    typeof element !== 'string' &&
    !!element &&
    !!element.ownerDocument &&
    !!element.ownerDocument.defaultView &&
    element instanceof element.ownerDocument.defaultView.HTMLElement
  );
}


/* --------
 * Hook Definition
 * -------- */
export function useAutoSizer(options?: UseAutoSizerOptions): UseAutoSizerReturn {

  // ----
  // Options Deconstruct
  // ----
  const {
    fixedHeight,
    fixedWidth,
    parent,
    maxHeight,
    minHeight,
    maxWidth,
    minWidth,
    useOwnHeight,
    useOwnWidth
  } = options || {};


  // ----
  // Internal State
  // ----
  const [ currentSize, setCurrentSize ] = useSafeState<UseAutoSizerReturnData>({
    height: fixedHeight || 0,
    width : fixedWidth || 0
  });


  // ----
  // Internal Hooks
  // ----
  const autoSizerRef = React.useRef<HTMLDivElement>(null);


  // ----
  // Utilities
  // ----
  const getParentElement = React.useCallback(
    (): Element | null => {
      /** Assert AutoSizer has been mounted */
      const { current: autoSizerElement } = autoSizerRef;

      if (!autoSizerElement) {
        return null;
      }

      /** If the user has defined a specific DOM element, use it */
      if (isValidParentElement(parent)) {
        return parent;
      }

      /** If the parent is a string, assume it is a selector */
      if (typeof parent === 'string') {
        const selectedParent = document.querySelector(parent);

        if (isValidParentElement(selectedParent)) {
          return selectedParent;
        }
      }

      /** If no parent has been declared, use default AutoSizer parent */
      if (isValidParentElement(autoSizerElement.parentElement)) {
        return autoSizerElement.parentElement;
      }

      /** Fallback to null */
      return null;
    },
    [ parent ]
  );


  // ----
  // Handlers
  // ----
  const handleWindowResize = React.useCallback(
    () => {
      /** Load the AutoSizer component Ref and the parent element */
      const { current: autoSizerElement } = autoSizerRef;
      const parentElement = getParentElement();

      /** If one (or both) are null, abort */
      if (!autoSizerElement || !parentElement) {
        return;
      }

      /** Get the size of the Window */
      const {
        innerHeight: windowHeight,
        innerWidth : windowWidth
      } = window;

      /** Get padding from the parent element */
      const parentElementStyle = window.getComputedStyle(parentElement) || {};
      const paddingRight = parseInt(parentElementStyle.paddingRight, 10) || 0;
      const paddingBottom = parseInt(parentElementStyle.paddingBottom, 10) || 0;

      /** Get the AutoSizer current position and width */
      const {
        top : autoSizerElementTopPosition,
        left: autoSizerElementLeftPosition
      } = autoSizerElement.getBoundingClientRect();

      /** Compute next AutoSizer sizes */
      const nextComputedHeight: number = (() => {
        /** If a fixed height has been defined, return it */
        if (typeof fixedHeight === 'number') {
          return fixedHeight;
        }

        /** If height must not be computed, return own height */
        if (useOwnHeight) {
          return autoSizerElement.clientHeight;
        }

        /** Compute the starting top position */
        return Math.max(windowHeight - autoSizerElementTopPosition - paddingBottom, 0);
      })();

      const nextComputedWidth: number = (() => {
        /** If a fixed width has been defined, return it */
        if (typeof fixedWidth === 'number') {
          return fixedWidth;
        }

        /** If width must not be computed, return own width */
        if (useOwnWidth) {
          return autoSizerElement.clientWidth;
        }

        /** Compute the starting top position */
        return Math.max(windowWidth - autoSizerElementLeftPosition - paddingRight, 0);
      })();

      const nextHeight = Math.min(maxHeight || Number.MAX_SAFE_INTEGER, Math.max(minHeight || 0, nextComputedHeight));
      const nextWidth = Math.min(maxWidth || Number.MAX_SAFE_INTEGER, Math.max(minWidth || 0, nextComputedWidth));

      /** Update only if one or both changes */
      if ((nextHeight !== currentSize.height) || (nextWidth !== currentSize.width)) {
        setCurrentSize({
          height: nextHeight,
          width : nextWidth
        });
      }

    },
    [
      currentSize.height,
      currentSize.width,
      fixedHeight,
      fixedWidth,
      getParentElement,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      setCurrentSize,
      useOwnHeight,
      useOwnWidth
    ]
  );


  // ----
  // Resize Listener
  // ----
  React.useEffect(
    () => {
      handleWindowResize();
    },
    [ handleWindowResize ]
  );
  useWindowEvent('resize', handleWindowResize);


  // ----
  // AutoSizer Component
  // ----
  const AutoSizer = React.useMemo(
    () => React.forwardRef<HTMLDivElement, React.PropsWithChildren<JSX.IntrinsicElements['div']>>(
      (props, ref) => {
        // ----
        // Props Deconstruct
        // ----
        const {
          children,
          style: userDefinedStyle,
          ...rest
        } = props;


        // ----
        // Merge the refs using user defined and system
        // ----
        const mergedRef = useMergedRef(autoSizerRef, ref);


        // ----
        // Return Component
        // ----
        return (
          <div {...rest} ref={mergedRef}>
            {children}
          </div>
        );
      }
    ),
    []
  );


  // ----
  // Hook Return
  // ----
  return [ AutoSizer, currentSize ];

}
