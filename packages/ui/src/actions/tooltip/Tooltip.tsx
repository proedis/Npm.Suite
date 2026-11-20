'use client';

import * as React from 'react';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { cn } from '../../core/cn';
import { isPresent } from '../../internal/presence';


/* --------
 * Types Definition
 * -------- */

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export type TooltipAlign = 'center' | 'start';

export interface TooltipProps {
  /**
   * The first line, or a list of values one per line. Empty, nothing is rendered and the control
   * stands alone: a tooltip with no content is an empty box on hover.
   */
  content: React.ReactNode;

  /**
   * A second, quieter line, normally the reason a control is disabled.
   *
   * It is also rendered as hidden text next to the control and joined to its `aria-describedby`,
   * because the popup itself is hidden from assistive technology: this is the one thing a tooltip
   * says that the control does not already say.
   */
  description?: React.ReactNode;

  /** The side it prefers. It flips on its own when there is no room. Defaults to `top` */
  side?: TooltipSide;

  /**
   * `start` lays the text of the tooltip exactly over the text of the control, which is what a
   * truncated value wants. Defaults to `center`.
   */
  align?: TooltipAlign;

  /**
   * Opens only when the text of the control does not fit, measured at the moment it would open.
   *
   * The element measured is the first descendant marked `data-truncate`, or the control itself:
   * the box that overflows is rarely the control (a button clips its label span, not itself).
   */
  truncatedOnly?: boolean;

  /** Switches the tooltip off, leaving the control untouched */
  disabled?: boolean;

  /**
   * The control, as a single element. It is cloned with the trigger props rather than wrapped, so a
   * flex row does not gain a child. It has to forward its ref, or the popup has nothing to anchor to.
   */
  children: React.ReactElement;

  className?: string;
}

export interface TooltipProviderProps {
  /** How long the pointer rests before the first tooltip opens. Defaults to 400ms */
  delay?: number;

  /**
   * How long a neighbour stays instant once one has closed. Defaults to 600ms, so a row of icon
   * buttons reads as one gesture. A table mounts a second provider with `0`: scrolling down a column
   * must not leave a trail of labels over the rows being read.
   */
  timeout?: number;

  children?: React.ReactNode;
}


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_DELAY = 400;

const DEFAULT_TIMEOUT = 600;

/** Clear of the focus halo of a control, which reaches 7px, and of the edge of a scrolling box */
const GAP = 8;

/** The roles of a layer that hands the focus back to its trigger when it closes */
const RETURNING_LAYER = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

/** Input types that are pressed rather than typed into: the focus on these still opens a tooltip */
const PRESSED_INPUT_TYPES = new Set([ 'button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit' ]);


/* --------
 * Helpers
 * -------- */

/** Whether a control takes text, where the tooltip would cover what is being typed */
function isTypeable(element: Element): boolean {
  if (element instanceof HTMLInputElement) {
    return !PRESSED_INPUT_TYPES.has(element.type);
  }

  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return true;
  }

  const role = element.getAttribute('role');

  return role === 'combobox' || role === 'textbox' || (element instanceof HTMLElement && element.isContentEditable);
}


/** Whether the text of a control is clipped, on its marked descendant or on itself */
function isTruncated(trigger: Element): boolean {
  const target = trigger.querySelector('[data-truncate]') ?? trigger;

  return target.scrollWidth > target.clientWidth || target.scrollHeight > target.clientHeight;
}


/**
 * Whether the focus came back from a layer that just closed, rather than from the user moving it.
 *
 * A dialog or a menu that closes returns the focus to the button that opened it, and a tooltip
 * opening right then would sit over the page the user is about to read again. The element the focus
 * came from is either gone with the layer or still inside it.
 */
function isReturnedFocus(event: FocusEvent): boolean {
  const from = event.relatedTarget;

  if (!(from instanceof Element)) {
    return true;
  }

  return !from.isConnected || from.closest(RETURNING_LAYER) !== null;
}


/** Two `aria-describedby` lists as one, keeping the ids the control already had */
function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter((id) => typeof id === 'string' && id.length > 0).join(' ');

  return joined.length ? joined : undefined;
}


/* --------
 * The provider
 * -------- */

/**
 * Mounted once, above everything that can show a tooltip.
 *
 * The delay lives here rather than on each tooltip because Base UI groups them: once one has opened,
 * its neighbours open instantly for `timeout` milliseconds.
 */
export function TooltipProvider(props: TooltipProviderProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, delay = DEFAULT_DELAY, timeout = DEFAULT_TIMEOUT } = props;


  // ----
  // Component Render
  // ----
  return (
    <TooltipPrimitive.Provider delay={delay} timeout={timeout}>
      {children}
    </TooltipPrimitive.Provider>
  );

}

TooltipProvider.displayName = 'TooltipProvider';


/* --------
 * Component Definition
 * -------- */

/**
 * The dark label over a control: the name of an icon button, the whole of a truncated value, the
 * reason a control is disabled.
 *
 * ```tsx
 * <Tooltip content={'Delete'} description={'Only a draft can be deleted'}>
 *   <IconButton label={'Delete'} icon={<Trash />} disabled />
 * </Tooltip>
 * ```
 *
 * It repeats or completes what the control already says, never more: an explanation that exists
 * nowhere else belongs in a popover. Which is why the popup is `aria-hidden`: the name is the
 * control's, and the one thing it adds (`description`) reaches assistive technology through hidden
 * text tied to the control.
 *
 * What it decides on its own, from the design system:
 *
 * - it waits 400ms, and its neighbours open at once for 600ms after (both on `TooltipProvider`);
 * - the pointer can move onto it without closing it, and its text can be selected;
 * - the focus on a button opens it with no wait, the focus in a field that takes text does not: there
 *   it would cover what is being typed, and it opens on hover only;
 * - it stays closed while a menu or a popover opened by the same control is open, and when the focus
 *   comes back to the control from a layer that just closed;
 * - a click on an `aria-disabled` control leaves it open, since that is when the reason is wanted;
 * - no tooltip on touch: the product it was designed for is a desktop one.
 *
 * Parts with a slot: `tooltip` (the popup), `tooltip-description` (its second line).
 */
export function Tooltip(props: TooltipProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    align = 'center',
    children,
    className,
    content,
    description,
    disabled = false,
    side = 'top',
    truncatedOnly = false
  } = props;


  // ----
  // Internal Hooks
  // ----
  const descriptionId = React.useId();


  // ----
  // Handlers
  // ----
  const handleOpenChange = (open: boolean, details: TooltipPrimitive.Root.ChangeEventDetails): void => {
    const { trigger } = details;

    if (!trigger) {
      return;
    }

    if (!open) {
      /* The reason a control is disabled is wanted exactly when the click does nothing */
      if (details.reason === 'trigger-press' && trigger.getAttribute('aria-disabled') === 'true') {
        details.cancel();
      }

      return;
    }

    if (trigger.hasAttribute('data-popup-open')) {
      details.cancel();
      return;
    }

    if (details.reason === 'trigger-focus' && (isTypeable(trigger) || isReturnedFocus(details.event))) {
      details.cancel();
      return;
    }

    if (truncatedOnly && !isTruncated(trigger)) {
      details.cancel();
    }
  };


  // ----
  // Component Render
  // ----
  const hasContent = isPresent(content);
  const hasDescription = isPresent(description);

  if (!hasContent) {
    return children;
  }

  const ownDescribedBy = (children.props as { 'aria-describedby'?: string })['aria-describedby'];

  return (
    <React.Fragment>
      <TooltipPrimitive.Root disabled={disabled} onOpenChange={handleOpenChange}>
        <TooltipPrimitive.Trigger
          render={children}
          aria-describedby={hasDescription ? joinIds(ownDescribedBy, descriptionId) : ownDescribedBy}
        />

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            side={side}
            align={align}
            sideOffset={GAP}
            alignOffset={align === 'start' ? -GAP : 0}
            collisionPadding={GAP}
            className={'z-tooltip data-anchor-hidden:hidden'}
          >
            <TooltipPrimitive.Popup
              aria-hidden={'true'}
              data-slot={'tooltip'}
              className={cn(
                'max-w-70 rounded-sm bg-tooltip px-2 py-1 text-xs text-tooltip-foreground tabular-nums wrap-anywhere',

                /* Transparent until the system draws borders itself: then it becomes the frame */
                'outline-1 -outline-offset-1 outline-transparent',

                /* A fade in, none out, none between neighbours, none at all with reduced motion */
                'transition-opacity duration-150 data-starting-style:opacity-0',
                'data-ending-style:transition-none data-instant:transition-none motion-reduce:transition-none',
                className
              )}
            >
              {content}

              {hasDescription && (
                <div data-slot={'tooltip-description'} className={'mt-0.5 text-tooltip-muted-foreground'}>
                  {description}
                </div>
              )}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>

      {hasDescription && (
        <span id={descriptionId} hidden>{description}</span>
      )}
    </React.Fragment>
  );

}

Tooltip.displayName = 'Tooltip';
