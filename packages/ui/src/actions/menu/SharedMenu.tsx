'use client';

import * as React from 'react';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { MenuContext, Panel, useAfterClose } from './menuPanel';

import type { MenuAnchor } from './menuPanel';


/* --------
 * Types Definition
 * -------- */

export interface SharedMenuProps<P> {
  /** From `createSharedMenuHandle`, given to the root and to every trigger */
  handle: MenuPrimitive.Handle<P>;

  /** The point of a right click. Without, the panel sits under the trigger that opened it */
  anchor?: MenuAnchor;

  /** Defaults to `end`, the ⋯ at the end of a row */
  align?: 'start' | 'end';

  /** The name of the menu, with its object: "Actions on SG-2038" */
  label: (payload: P) => string;

  /** The items for the trigger that opened it */
  children: (payload: P) => React.ReactNode;

  onOpenChange?: (open: boolean) => void;
}

export interface SharedMenuTriggerProps<P> {
  handle: MenuPrimitive.Handle<P>;
  payload: P;

  /** The id `handle.open()` names it by */
  id: string;

  /** The control, usually an icon button. It must forward its ref */
  render: React.ReactElement;
}


/* --------
 * Component Definition
 * -------- */

/**
 * One menu for many triggers: the ⋯ of every row of a table opens the same panel with its own items,
 * and so do a right click and Shift F10, through `handle.open(id)`. Private to the package.
 *
 * The rules are those of `Menu`: not modal, arrows that stop at the ends, an item's action run once the
 * menu has closed with the focus back on the trigger. Opened at the point of a right click, it closes
 * when the page scrolls instead of following a point that has moved.
 */
export function SharedMenu<P>(props: SharedMenuProps<P>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { align = 'end', anchor, children, handle, label, onOpenChange } = props;


  // ----
  // Internal State
  // ----
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const { context, handleOpenChangeComplete } = useAfterClose(triggerRef);


  // ----
  // Handlers
  // ----
  const handleOpenChange = (open: boolean, details: MenuPrimitive.Root.ChangeEventDetails): void => {
    if (open && details.trigger instanceof HTMLElement) {
      triggerRef.current = details.trigger;
    }

    onOpenChange?.(open);
  };

  const close = React.useCallback(() => handle.close(), [ handle ]);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(
    () => {
      if (!anchor) {
        return undefined;
      }

      /*
       * The page moving under a menu opened at the pointer closes it. A scroll listened to in the
       * capture phase hears the menu's own list as well, which scrolls when it is long, and that one
       * must not close it.
       */
      const handleScroll = (event: Event): void => {
        if (event.target instanceof Element && event.target.closest('[role="menu"]') !== null) {
          return;
        }

        close();
      };

      window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

      return () => window.removeEventListener('scroll', handleScroll, { capture: true });
    },
    [ anchor, close ]
  );


  // ----
  // Component Render
  // ----
  return (
    <MenuContext.Provider value={context}>
      <MenuPrimitive.Root
        handle={handle}
        modal={false}
        loopFocus={false}
        onOpenChange={handleOpenChange}
        onOpenChangeComplete={handleOpenChangeComplete}
      >
        {({ payload }) => (payload === undefined
          ? null
          : (
            <Panel side={'bottom'} align={anchor ? 'start' : align} label={label(payload)} anchor={anchor} onAnchorHidden={close}>
              {children(payload)}
            </Panel>
          ))}
      </MenuPrimitive.Root>
    </MenuContext.Provider>
  );

}

SharedMenu.displayName = 'SharedMenu';


/** A trigger of a shared menu, detached from its root */
export function SharedMenuTrigger<P>(props: SharedMenuTriggerProps<P>): React.ReactNode {
  const { handle, id, payload, render } = props;

  return <MenuPrimitive.Trigger handle={handle} payload={payload} id={id} render={render} />;
}

SharedMenuTrigger.displayName = 'SharedMenuTrigger';


/** A handle for a shared menu, created once per table */
export const createSharedMenuHandle = <P,>(): MenuPrimitive.Handle<P> => MenuPrimitive.createHandle<P>();
