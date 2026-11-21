'use client';

import * as React from 'react';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { canTakeFocus, FOCUSABLE } from '../../internal/focus';
import { ClearGlyph } from '../../internal/glyphs';
import { isPresent } from '../../internal/presence';

import { CloseWhenAnchorHidden } from '../../actions/anchor/CloseWhenAnchorHidden';
import { IconButton } from '../../actions/button/IconButton';

import { FormHostContext } from '../../forms/field/fieldContext';
import { FormSubmit } from '../../forms/form/Form';


/* --------
 * Types Definition
 * -------- */

export interface PopoverLabels {
  /** The name of the x, and its tooltip */
  readonly close: string;
}

interface CommonPopoverProps {
  /** The control that opens it: a real button, never a link. It must forward its ref */
  trigger: React.ReactElement;

  /** The text that explains, read when it opens. In a help popover it is the whole content */
  description?: React.ReactNode;

  /** The body: fields, data, text */
  children?: React.ReactNode;

  /** The actions. Without, no footer and no focus trap */
  footer?: React.ReactNode;

  /** 280 or 320px. `sm` for help and choices, `md` for previews and text fields. Defaults to `sm` */
  width?: 'sm' | 'md';

  /** Defaults to `bottom`; it flips on its own */
  side?: 'bottom' | 'top';

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** The body is loading: `aria-busy`, and the caller shows its placeholders */
  busy?: boolean;

  labels: PopoverLabels;

  className?: string;
}

/** A title, which brings a header, or a name for a popover without one */
export type PopoverProps = CommonPopoverProps & (
  | { title: React.ReactNode; 'aria-label'?: string }
  | { title?: undefined; 'aria-label': string }
);


/* --------
 * Constants Definition
 * -------- */

const WIDTHS = { sm: 'w-70', md: 'w-80' } as const;


/* --------
 * Helpers
 * -------- */

/**
 * The first element that can take the focus, the x excluded. Without a title the x is rendered at the
 * top of the body, so a plain first match would hand the opening focus to it.
 */
function firstFocusable(container: HTMLElement | null): HTMLElement | null {
  const found = container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [];

  return Array.from(found).find((element) => element.dataset.slot !== 'popover-close' && canTakeFocus(element)) ?? null;
}

function ArrowGlyph(): React.ReactNode {
  return (
    <svg viewBox={'0 0 12 6'} aria-hidden={'true'} focusable={'false'} className={'block size-full'}>
      <path d={'M0 6 6 0l6 6'} className={'fill-popover'} />
      <path d={'M0 6 6 0l6 6'} fill={'none'} className={'stroke-border'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * A small dialog attached to the control that opens it: an arrow points at it, a header with title and
 * x when the title is needed, a footer with actions when there are some. For a short form, a preview,
 * an explanation to read. Not for lists (Select), actions (Menu), or work to confirm (Dialog).
 *
 * ```tsx
 * <Popover
 *   trigger={<Button fill={'soft'}>Export</Button>}
 *   title={'Export list'}
 *   labels={{ close: 'Close' }}
 *   footer={<Popover.Submit size={'sm'}>Export</Popover.Submit>}
 * >
 *   <Form onSubmit={exportList}>…</Form>
 * </Popover>
 * ```
 *
 * With a footer the focus stays inside (`trap-focus`) while the page behind scrolls; without, Tab from
 * the last element closes it and moves on. The focus goes first to the body, then to the footer, then
 * to the popup, never to the x. A click outside closes and leaves the focus where it landed; Esc and
 * the x bring it back to the control. When the control leaves the view the popover closes.
 *
 * A `Form` inside takes the popover's id, and `Popover.Submit` in the footer points at it: Enter in a
 * field submits, and the popover renders no `<form>` of its own.
 *
 * Parts with a slot: `popover` (the popup, with `data-width`), `popover-arrow`, `popover-header`,
 * `popover-title`, `popover-close`, `popover-body`, `popover-body-content`, `popover-description`,
 * `popover-footer`.
 */
function PopoverRoot(props: PopoverProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-label': ariaLabel,
    busy = false,
    children,
    className,
    description,
    footer,
    labels,
    onOpenChange,
    open: openProp,
    side = 'bottom',
    title,
    trigger,
    width = 'sm'
  } = props;


  // ----
  // Internal Hooks
  // ----
  const formId = React.useId();
  const popupRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  /** Why it closed: a click outside leaves the focus where it landed */
  const closeReasonRef = React.useRef<string | null>(null);


  // ----
  // Internal State
  // ----
  const [ ownOpen, setOwnOpen ] = React.useState(false);

  const open = openProp ?? ownOpen;
  const hasTitle = isPresent(title);
  const hasFooter = isPresent(footer);
  const hasDescription = isPresent(description);


  // ----
  // Memoized Data
  // ----
  const formHost = React.useMemo(() => ({ formId }), [ formId ]);


  // ----
  // Handlers
  // ----
  const setOpen = React.useCallback((next: boolean): void => {
    if (openProp === undefined) {
      setOwnOpen(next);
    }

    onOpenChange?.(next);
  }, [ openProp, onOpenChange ]);

  const handleOpenChange = (next: boolean, details: PopoverPrimitive.Root.ChangeEventDetails): void => {
    closeReasonRef.current = next ? null : details.reason;
    setOpen(next);
  };

  const closeOnHidden = React.useCallback((): void => {
    closeReasonRef.current = 'anchor-hidden';
    setOpen(false);
  }, [ setOpen ]);

  const initialFocus = (): HTMLElement | null => (
    firstFocusable(bodyRef.current) ?? firstFocusable(footerRef.current) ?? popupRef.current
  );

  const finalFocus = (): boolean => {
    const reason = closeReasonRef.current;

    return reason !== 'outside-press' && reason !== 'focus-out' && reason !== 'anchor-hidden';
  };


  // ----
  // Component Render
  // ----
  const closeButton = (
    <PopoverPrimitive.Close
      render={(
        <IconButton
          label={labels.close}
          icon={<ClearGlyph />}
          size={'sm'}
          data-slot={'popover-close'}
          className={hasTitle ? '-me-2 shrink-0' : 'float-end -me-2 -mt-1 ms-2'}
        />
      )}
    />
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={hasFooter ? 'trap-focus' : false}>
      <PopoverPrimitive.Trigger render={trigger} />

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side={side}
          align={'center'}
          sideOffset={8}
          collisionPadding={8}
          arrowPadding={12}
          className={'z-popover'}
          render={(positionerProps, state) => (
            <div {...positionerProps}>
              <CloseWhenAnchorHidden hidden={state.anchorHidden} onHidden={closeOnHidden} />
              {positionerProps.children}
            </div>
          )}
        >
          <PopoverPrimitive.Popup
            ref={popupRef}
            tabIndex={-1}
            aria-label={hasTitle ? undefined : ariaLabel}
            aria-busy={busy || undefined}
            data-busy={busy || undefined}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            data-slot={'popover'}
            data-width={width}
            render={<Stack gap={0} />}
            className={cn(
              'relative max-h-(--available-height) rounded-md bg-popover text-sm text-popover-foreground shadow-md outline-none',
              'origin-(--transform-origin) tabular-nums wrap-anywhere',
              'transition duration-150 data-starting-style:scale-96 data-starting-style:opacity-0',
              'data-ending-style:transition-none motion-reduce:transition-none',
              WIDTHS[width],
              className
            )}
          >
            <PopoverPrimitive.Arrow
              data-slot={'popover-arrow'}
              className={'h-1.5 w-3 data-[side=bottom]:-top-1.5 data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180'}
            >
              <ArrowGlyph />
            </PopoverPrimitive.Arrow>

            {hasTitle && (
              <Stack
                data-slot={'popover-header'}
                direction={'horizontal'}
                align={'start'}
                gap={2}
                className={'flex-none border-b border-border py-2 ps-4 pe-2'}
              >
                <PopoverPrimitive.Title data-slot={'popover-title'} className={'min-w-0 flex-1 py-1 font-heading text-sm font-semibold'}>
                  {title}
                </PopoverPrimitive.Title>
                {closeButton}
              </Stack>
            )}

            <div ref={bodyRef} data-slot={'popover-body'} className={'min-h-0 overflow-y-auto overscroll-contain px-4 py-3'}>
              {!hasTitle && closeButton}

              <FormHostContext.Provider value={formHost}>
                <Stack data-slot={'popover-body-content'} gap={3}>
                  {hasDescription && (
                    <PopoverPrimitive.Description data-slot={'popover-description'}>
                      {description}
                    </PopoverPrimitive.Description>
                  )}
                  {children}
                </Stack>
              </FormHostContext.Provider>
            </div>

            {hasFooter && (
              <Stack
                ref={footerRef}
                data-slot={'popover-footer'}
                direction={'horizontal'}
                align={'center'}
                justify={'end'}
                gap={2}
                className={'flex-none border-t border-border px-4 py-2'}
              >
                <FormHostContext.Provider value={formHost}>
                  {footer}
                </FormHostContext.Provider>
              </Stack>
            )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );

}

PopoverRoot.displayName = 'Popover';


export const Popover = Object.assign(PopoverRoot, {
  /** The submit button of the popover's form, in its footer */
  Submit: FormSubmit
});
