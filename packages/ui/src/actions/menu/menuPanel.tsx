'use client';

import * as React from 'react';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { optionalContextBuilder } from '@proedis/react';

import { cn } from '../../core/cn';

import { CloseWhenAnchorHidden } from '../anchor/CloseWhenAnchorHidden';


/* --------
 * Types Definition
 * -------- */

export interface MenuContextValue {
  /** Runs `action` once the menu has finished closing */
  afterClose: (action: () => void) => void;
}

/** What the panel can be placed against instead of its trigger: the point of a right click */
export type MenuAnchor = MenuPrimitive.Positioner.Props['anchor'];


/* --------
 * Constants Definition
 * -------- */

const PANEL = [
  'max-h-(--available-height) min-w-40 max-w-70 overflow-y-auto overscroll-contain scrollbar-thin',
  'rounded-list-panel bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none',
  'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:transition-none motion-reduce:transition-none'
].join(' ');

export const [ MenuContext, useMenuContext ] = optionalContextBuilder<MenuContextValue>('Menu', { afterClose: (action) => action() });

/** The corner of a menu: the theme's (`--list-panel-radius`, `md` undeclared), or a step. Its items follow it */
export type MenuRadius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const RADIUS: Readonly<Record<MenuRadius, string | undefined>> = {
  default: undefined,
  none   : 'list-panel-radius-none',
  sm     : 'list-panel-radius-sm',
  md     : 'list-panel-radius-md',
  lg     : 'list-panel-radius-lg',
  xl     : 'list-panel-radius-xl',
  '2xl'  : 'list-panel-radius-2xl'
};

/** The radius of the menu, for its submenus too: they render in a portal, where the variable of the panel does not reach */
export const [ MenuRadiusContext, useMenuRadius ] = optionalContextBuilder<MenuRadius>('MenuRadius', 'default');


/* --------
 * Hooks
 * -------- */

/**
 * An action chosen in a menu, run once the menu has finished closing rather than while it closes:
 * the context to provide to the items, and the handler for `onOpenChangeComplete`. `triggerRef` is
 * the control the menu opened from, read when the action runs.
 *
 * The focus is back on the trigger before the action runs: a dialog it opens takes the trigger as
 * the control to return to, instead of an item that is no longer there. The context keeps its
 * identity, so the items do not render again when the menu does.
 */
export function useAfterClose(triggerRef: { readonly current: HTMLElement | null }): {
  context: MenuContextValue;
  handleOpenChangeComplete: (open: boolean) => void;
} {

  // ----
  // Internal State
  // ----
  const pendingRef = React.useRef<(() => void) | null>(null);


  // ----
  // Handlers
  // ----
  const handleOpenChangeComplete = (open: boolean): void => {
    if (open) {
      return;
    }

    const action = pendingRef.current;

    pendingRef.current = null;

    if (action) {
      triggerRef.current?.focus({ preventScroll: true });
      action();
    }
  };


  // ----
  // Memoized Data
  // ----
  const context = React.useMemo<MenuContextValue>(() => ({
    afterClose: (action) => {
      pendingRef.current = action;
    }
  }), []);


  return { context, handleOpenChangeComplete };

}


/* --------
 * Component Definition
 * -------- */

/**
 * The panel of every menu of the package: the Select's list, 4px from its anchor, flipped when there
 * is no room, closed when the anchor leaves the view. Private: `Menu` and the Table's shared menu use it.
 */
export function Panel(props: {
  side: 'bottom' | 'top' | 'right';
  align: 'start' | 'end';
  label?: string;
  onAnchorHidden: () => void;
  anchor?: MenuAnchor;
  className?: string;
  children: React.ReactNode;
}): React.ReactNode {
  const { align, anchor, children, className, label, onAnchorHidden, side } = props;
  const radius = useMenuRadius();

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side === 'right' ? 'inline-end' : side}
        align={align}
        sideOffset={4}
        alignOffset={side === 'right' ? -4 : 0}
        collisionPadding={8}
        anchor={anchor}
        className={'z-popover outline-none'}
        render={(positionerProps, state) => (
          <div {...positionerProps}>
            <CloseWhenAnchorHidden hidden={state.anchorHidden} onHidden={onAnchorHidden} />
            {positionerProps.children}
          </div>
        )}
      >
        <MenuPrimitive.Popup aria-label={label} data-slot={'menu'} data-radius={radius} className={cn(PANEL, RADIUS[radius], className)}>
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
