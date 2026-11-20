'use client';

import * as React from 'react';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { inertValue, optionalContextBuilder, useDelayedBusy, useSyncedRef } from '@proedis/react';

import { cn } from '../../core/cn';

import { BusyVeil } from '../../components/BusyVeil';
import { IconBox } from '../../components/IconBox';
import { VisuallyHidden } from '../../components/VisuallyHidden';


import { FOCUSABLE } from '../focus/focus';
import { isPresent } from '../presence/presence';
import { ToneGlyph } from '../tone-glyphs/toneGlyphs';


/*
 * The parts Dialog, AlertDialog and Drawer share: the isolated container with its veil, the header,
 * the body with its scroll shades, the footer, the error box, the waiting veil, the jolt, and the
 * level of nesting. Private, shared by relative import.
 */


/* --------
 * Types Definition
 * -------- */

export type OverlaySize = 'sm' | 'md' | 'lg';

export type OverlayBusy = false | 'load' | 'submit';

/** One section of the index of a large dialog or drawer */
export interface OverlaySection {
  readonly id: string;
  readonly label: React.ReactNode;

  /** How many errors the section holds, shown with the item */
  readonly errors?: number;
}


/* --------
 * Constants Definition
 * -------- */

/** 15s: a save with no answer by then becomes a send error */
export const SUBMIT_TIMEOUT = 15_000;


const FIELD = 'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [data-field-control], [role="combobox"]';

/**
 * How deep a dialog sits: 0 on the page, 1 opened from a dialog or a drawer, 2 for the discard prompt
 * over a nested one. Ours, so it does not depend on how Base UI marks its nesting.
 */
export const [ OverlayLevelContext, useOverlayLevelContext ] = optionalContextBuilder('OverlayLevel', 0);


/* --------
 * Helpers
 * -------- */

/** The first field inside, then the first focusable element */
export function firstField(container: HTMLElement | null): HTMLElement | null {
  return container?.querySelector<HTMLElement>(FIELD) ?? null;
}

export function firstFocusable(container: HTMLElement | null): HTMLElement | null {
  return container?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
}

/** The control focused when the overlay opened, or the fallback, or the title of the page */
export function focusTarget(
  origin: HTMLElement | null,
  fallback?: { readonly current: HTMLElement | null } | (() => HTMLElement | null)
): HTMLElement | null {
  if (origin?.isConnected) {
    return origin;
  }

  const fromFallback = typeof fallback === 'function' ? fallback() : fallback?.current ?? null;

  if (fromFallback?.isConnected) {
    return fromFallback;
  }

  const heading = document.querySelector<HTMLElement>('h1');

  if (heading && !heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1');
  }

  return heading;
}


/* --------
 * Hooks
 * -------- */

/** The control that had the focus when `open` turned on, captured before Base UI moves it */
export function useOrigin(open: boolean): { readonly current: HTMLElement | null } {
  const originRef = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    if (open) {
      originRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
  }, [ open ]);

  return originRef;
}

/** The 4px jolt, restarted on every call */
export function useNudge(): [ boolean, () => void ] {
  const [ nudging, setNudging ] = React.useState(false);

  React.useEffect(() => {
    if (!nudging) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNudging(false), 200);

    return () => window.clearTimeout(timer);
  }, [ nudging ]);

  return [ nudging, () => setNudging(true) ];
}

export interface OverlayBusyState {
  /** Inert at once: no second click, no second Enter */
  inert: boolean;

  /** The veil, after 300ms and for at least 400 */
  visible: boolean;

  /** The save got no answer in time */
  timedOut: boolean;
}

/**
 * The timing of a waiting dialog: inert at once, the veil later, and a limit on a save.
 *
 * The limit belongs to one save. When the wait ends the timeout is forgotten, adjusted while
 * rendering, so the next save of a dialog that stayed mounted gets its full limit instead of being
 * reported as timed out at once. `onTimeout` is read from a ref: a caller passes it inline, and as a
 * dependency of the timer it restarted the limit on every render of the page.
 */
export function useOverlayBusy(busy: OverlayBusy | 'action', timeoutMs: number, onTimeout?: () => void): OverlayBusyState {

  // ----
  // Internal Hooks
  // ----
  const wait = useDelayedBusy(busy !== false);


  // ----
  // Internal Refs
  // ----
  const onTimeoutRef = useSyncedRef(onTimeout);


  // ----
  // Internal State
  // ----
  const [ timedOutFor, setTimedOutFor ] = React.useState<OverlayBusy | 'action'>(false);
  const saving = busy === 'submit' || busy === 'action';

  if (!saving && timedOutFor !== false) {
    setTimedOutFor(false);
  }


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (!saving) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTimedOutFor(busy);
      onTimeoutRef.current?.();
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [ saving, busy, timeoutMs, onTimeoutRef ]);


  // ----
  // Hook Return
  // ----

  const timedOut = saving && timedOutFor === busy;

  return {
    inert  : busy !== false && !timedOut,
    visible: wait.visible && !timedOut,
    timedOut
  };
}


/* --------
 * Components
 * -------- */

interface OverlayFrameProps {
  placement: 'dialog' | 'drawer';
  size: OverlaySize;

  /** A click on the veil, which never closes by itself */
  onVeilPress: () => void;
  nudging: boolean;

  popupRef?: React.Ref<HTMLDivElement>;
  initialFocus: () => HTMLElement | null;
  finalFocus: () => HTMLElement | boolean | null;

  /** Overrides what Base UI writes: AlertDialog points at its description and its consequences */
  'aria-describedby'?: string;

  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;

  dataSlot: string;

  /** The resolved variants of the component on top, written on the panel next to `data-size` */
  dataAttributes?: Readonly<Record<`data-${string}`, string | true | undefined>>;
  className?: string;
  children: React.ReactNode;
}

const DIALOG_WIDTHS: Readonly<Record<OverlaySize, string>> = { sm: 'w-100', md: 'w-140', lg: 'w-200' };

/** 64px from the top, 120 over another dialog, 176 for the discard prompt over a nested one; less when the window is short */
const DIALOG_TOP = [
  'pt-16 [@media(max-height:640px)]:pt-4',
  'pt-30 [@media(max-height:640px)]:pt-18',
  'pt-44 [@media(max-height:640px)]:pt-32'
] as const;

/**
 * The isolated container (`z-dialog`), the veil inside it, the viewport that places the panel, and
 * the panel. Every dialog opened later covers the one under it entirely; lists and popovers
 * (`z-popover`) stay above.
 */
export function OverlayFrame(props: OverlayFrameProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-describedby': ariaDescribedBy,
    children,
    className,
    dataAttributes,
    dataSlot,
    finalFocus,
    initialFocus,
    nudging,
    onKeyDown,
    onVeilPress,
    placement,
    popupRef,
    size
  } = props;


  // ----
  // Internal Hooks
  // ----
  const level = useOverlayLevelContext();


  // ----
  // Component Render
  // ----
  const isDrawer = placement === 'drawer';

  return (
    <DialogPrimitive.Portal className={'fixed inset-0 isolate z-dialog'}>
      <DialogPrimitive.Backdrop
        forceRender
        data-slot={`${dataSlot}-backdrop`}
        className={cn(
          'fixed inset-0 z-0 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none',
          level === 0 ? 'bg-overlay' : 'bg-overlay-nested'
        )}
      />

      <DialogPrimitive.Viewport
        data-slot={`${dataSlot}-viewport`}
        className={cn(
          'fixed inset-0 z-10 flex',
          isDrawer ? 'justify-end p-2' : cn('items-start justify-center px-4 pb-4', DIALOG_TOP[Math.min(level, 2)])
        )}
        onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
          if (event.target === event.currentTarget) {
            onVeilPress();
          }
        }}
      >
        <DialogPrimitive.Popup
          ref={popupRef}
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          aria-describedby={ariaDescribedBy}
          onKeyDown={onKeyDown}
          {...dataAttributes}
          data-slot={dataSlot}
          data-size={size}
          className={cn(
            'relative flex min-w-0 flex-col rounded-lg bg-popover text-sm text-popover-foreground shadow-lg outline-none',
            'tabular-nums wrap-anywhere',
            DIALOG_WIDTHS[size],
            isDrawer
              ? [
                'h-full shrink ms-14 max-sm:ms-0',
                'transition duration-200 data-ending-style:translate-x-full data-ending-style:opacity-0',
                'data-starting-style:translate-x-full data-starting-style:opacity-0 motion-reduce:transition-none'
              ]
              : [
                'max-h-full max-w-full',
                'transition duration-200 data-starting-style:-translate-y-2 data-starting-style:opacity-0',
                'data-ending-style:transition-none motion-reduce:transition-none'
              ],
            nudging && (isDrawer ? 'animate-nudge-x' : 'animate-nudge-y'),
            nudging && 'motion-reduce:animate-none motion-reduce:shadow-xl',
            className
          )}
        >
          <OverlayLevelContext.Provider value={level + 1}>
            {children}
          </OverlayLevelContext.Provider>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );

}


interface OverlayHeaderProps {
  icon?: React.ReactNode;
  iconTone?: 'primary' | 'muted' | 'warning' | 'destructive';
  title: React.ReactNode;
  description?: React.ReactNode;
  descriptionId?: string;

  /** The x, the arrows of a drawer: on the right, on the line of the title */
  end?: React.ReactNode;

  /** Inert while saving; while loading only the x stays usable, above the veil */
  inert?: boolean;

  /** A dialog with no x lines up 24px on both sides */
  symmetric?: boolean;

  dataSlot: string;
}

/** Icon box, title, description and the controls on the right, in line 32px from the edge */
export function OverlayHeader(props: OverlayHeaderProps): React.ReactNode {
  const { dataSlot, description, descriptionId, end, icon, iconTone = 'muted', inert, symmetric, title } = props;

  const hasIcon = icon !== null && icon !== undefined;
  const hasDescription = isPresent(description);

  return (
    <div
      data-slot={`${dataSlot}-header`}
      inert={inertValue(inert)}
      className={cn('relative z-20 flex flex-none items-start gap-3 pt-4 pb-2 ps-6', symmetric ? 'pe-6' : 'pe-4')}
    >
      {hasIcon && (
        <IconBox data-slot={`${dataSlot}-icon`} size={'sm'} fill={'soft'} tone={iconTone} className={'rounded-md'}>
          {icon}
        </IconBox>
      )}

      <div data-slot={`${dataSlot}-heading`} className={cn('min-w-0 flex-1', hasIcon && 'pt-1')}>
        <DialogPrimitive.Title data-slot={`${dataSlot}-title`} className={'text-base font-semibold text-foreground'}>
          {title}
        </DialogPrimitive.Title>
        {hasDescription && (
          <DialogPrimitive.Description id={descriptionId} data-slot={`${dataSlot}-description`} className={'mt-0.5 text-sm text-muted-foreground'}>
            {description}
          </DialogPrimitive.Description>
        )}
      </div>

      {end !== null && end !== undefined && (
        <div data-slot={`${dataSlot}-header-end`} className={cn('flex shrink-0 items-center gap-1', hasIcon ? 'mt-0.5' : '-mt-0.5')}>
          {end}
        </div>
      )}
    </div>
  );
}


/** The box at the top of the body for a send error or the error summary. It takes the focus when it changes */
export const OverlayError = React.forwardRef<HTMLDivElement, { children: React.ReactNode; dataSlot: string }>((props, ref) => (
  <div
    ref={ref}
    tabIndex={-1}
    data-slot={`${props.dataSlot}-error`}
    className={'flex items-start gap-2 rounded-md bg-destructive-soft px-3 py-2 text-destructive-soft-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring'}
  >
    <ToneGlyph tone={'destructive'} className={'mt-0.5 size-4 shrink-0'} />
    <div data-slot={`${props.dataSlot}-error-message`} className={'min-w-0 flex-1'}>{props.children}</div>
  </div>
));

OverlayError.displayName = 'OverlayError';


/** Focuses `ref` each time `value` changes to something present */
export function useFocusWhenSet(value: unknown, ref: { readonly current: HTMLElement | null }): void {

  /*
   * What counts as a change. Text is compared as text; anything else (an error passed as an element)
   * counts only when it arrives, because an element written inline is a new object at every render
   * of the page, and comparing it by identity pulled the focus back to it while the user typed.
   */
  const key = value === null || value === undefined || value === false || value === ''
    ? null
    : (typeof value === 'string' || typeof value === 'number' ? value : true);

  React.useEffect(() => {
    if (key !== null) {
      ref.current?.focus();
    }
  }, [ key, ref ]);
}


interface OverlayBodyProps {
  toolbar?: React.ReactNode;
  children?: React.ReactNode;
  error?: React.ReactNode;
  errorRef?: React.Ref<HTMLDivElement>;
  bodyRef?: { readonly current: HTMLDivElement | null };

  /** A body with no fields takes the focus itself, to scroll with the keyboard */
  focusable?: boolean;

  hasFooter: boolean;
  inert?: boolean;

  /** The index of the sections, beside the body */
  sections?: readonly OverlaySection[];
  sectionsLabel?: string;
  sectionErrors?: (count: number) => string;

  /** Indented to the title, as in the AlertDialog */
  indent?: boolean;

  dataSlot: string;
}

/**
 * The body that scrolls between a still header and footer. An 8px inner shadow shows at the top once
 * it has scrolled, at the bottom while there is more under; no lines.
 */
export function OverlayBody(props: OverlayBodyProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    bodyRef,
    children,
    dataSlot,
    error,
    errorRef,
    focusable = false,
    hasFooter,
    indent = false,
    inert,
    sectionErrors,
    sections,
    sectionsLabel,
    toolbar
  } = props;


  // ----
  // Internal Hooks
  // ----
  const ownScrollerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollerRef = bodyRef ?? ownScrollerRef;
  const topRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);


  // ----
  // Internal State
  // ----
  const [ shades, setShades ] = React.useState({ top: false, bottom: false });
  const [ current, setCurrent ] = React.useState<string | null>(sections?.[0]?.id ?? null);
  const clickedRef = React.useRef(false);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    const root = scrollerRef.current;

    if (!root || !topRef.current || !bottomRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      setShades((previous) => {
        const next = { ...previous };

        entries.forEach((entry) => {
          if (entry.target === topRef.current) {
            next.top = !entry.isIntersecting;
          }
          else {
            next.bottom = !entry.isIntersecting;
          }
        });

        return next.top === previous.top && next.bottom === previous.bottom ? previous : next;
      });
    }, { root });

    observer.observe(topRef.current);
    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [ scrollerRef ]);

  /* The section in view is the current one; after a click, the clicked one until the next scroll */
  React.useEffect(() => {
    const root = scrollerRef.current;

    if (!root || !sections || sections.length === 0) {
      return undefined;
    }

    const handleScroll = (): void => {
      if (clickedRef.current) {
        clickedRef.current = false;
        return;
      }

      const atEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 2;

      if (atEnd) {
        setCurrent(sections[sections.length - 1].id);
        return;
      }

      const { top } = root.getBoundingClientRect();
      let found = sections[0].id;

      sections.forEach((section) => {
        const element = root.querySelector<HTMLElement>(`[data-overlay-section="${section.id}"]`);

        if (element && element.getBoundingClientRect().top - top <= 24) {
          found = section.id;
        }
      });

      setCurrent(found);
    };

    root.addEventListener('scroll', handleScroll, { passive: true });

    return () => root.removeEventListener('scroll', handleScroll);
  }, [ sections, scrollerRef ]);


  // ----
  // Handlers
  // ----
  const goToSection = (id: string): void => {
    const heading = scrollerRef.current?.querySelector<HTMLElement>(`[data-overlay-section="${id}"] [data-overlay-section-title]`);

    clickedRef.current = true;
    setCurrent(id);
    heading?.scrollIntoView({ block: 'start' });
    heading?.focus({ preventScroll: true });
  };


  // ----
  // Component Render
  // ----
  const hasToolbar = isPresent(toolbar);
  const hasError = isPresent(error);
  const hasSections = sections !== undefined && sections.length > 0;
  const shade = 'pointer-events-none absolute inset-x-0 z-10 h-2 from-scroll-shade to-transparent transition-opacity duration-150';

  return (
    <React.Fragment>
      {hasToolbar && (
        <div data-slot={`${dataSlot}-toolbar`} inert={inertValue(inert)} className={'flex-none px-6 pt-2 pb-1'}>
          {toolbar}
        </div>
      )}

      <div data-slot={`${dataSlot}-content`} inert={inertValue(inert)} aria-busy={inert || undefined} className={'@container relative flex min-h-0 flex-1'}>
        {hasSections && (
          <nav aria-label={sectionsLabel} data-slot={`${dataSlot}-index`} className={'hidden w-44 shrink-0 flex-col gap-0.5 ps-6 pt-2 @3xl:flex'}>
            {sections.map((section) => {
              const errors = section.errors ?? 0;

              return (
                <button
                  key={section.id}
                  type={'button'}
                  data-slot={`${dataSlot}-index-item`}
                  data-errors={errors > 0 || undefined}
                  aria-current={current === section.id ? 'location' : undefined}
                  aria-label={errors > 0 && sectionErrors && typeof section.label === 'string'
                    ? `${section.label} · ${sectionErrors(errors)}`
                    : undefined}
                  onClick={() => goToSection(section.id)}
                  className={cn(
                    'relative flex min-h-8 items-center gap-2 rounded-sm px-2 py-1.5 text-start outline-none',
                    'hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                    'aria-[current=location]:bg-primary-soft aria-[current=location]:text-primary-soft-foreground',
                    'aria-[current=location]:before:absolute aria-[current=location]:before:inset-y-1 aria-[current=location]:before:start-0',
                    'aria-[current=location]:before:w-0.5 aria-[current=location]:before:bg-primary'
                  )}
                >
                  <span className={'min-w-0 flex-1'}>{section.label}</span>
                  {errors > 0 && (
                    <span className={'inline-flex items-center gap-1 text-xs text-destructive'}>
                      <ToneGlyph tone={'destructive'} className={'size-3.5'} />
                      {errors}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        <div data-slot={`${dataSlot}-scroll`} className={'relative flex min-h-0 min-w-0 flex-1 flex-col'}>
          <div data-slot={`${dataSlot}-shade`} data-edge={'top'} data-visible={shades.top || undefined} className={cn(shade, 'top-0 bg-linear-to-b', shades.top ? 'opacity-100' : 'opacity-0')} />

          <div
            ref={scrollerRef}
            data-slot={`${dataSlot}-body`}
            tabIndex={focusable ? 0 : undefined}
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-py-4 px-6 pt-2 outline-none',
              hasFooter ? 'pb-2' : 'pb-6',
              indent && 'ps-17',
              'focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring'
            )}
          >
            <div ref={topRef} aria-hidden className={'h-px'} />
            <div className={'flex flex-col gap-4'}>
              {hasError && <OverlayError ref={errorRef} dataSlot={dataSlot}>{error}</OverlayError>}
              {children}
            </div>
            <div ref={bottomRef} aria-hidden className={'h-px'} />
          </div>

          <div data-slot={`${dataSlot}-shade`} data-edge={'bottom'} data-visible={shades.bottom || undefined} className={cn(shade, 'bottom-0 bg-linear-to-t', shades.bottom ? 'opacity-100' : 'opacity-0')} />
        </div>
      </div>
    </React.Fragment>
  );

}


/** A titled section of the body, the target of the index */
export function OverlaySectionBlock(props: { id: string; title: React.ReactNode; children: React.ReactNode }): React.ReactNode {
  const { children, id, title } = props;

  return (
    <section data-overlay-section={id} data-slot={'overlay-section'} className={'flex flex-col gap-3 not-first:border-t not-first:border-border not-first:pt-6'}>
      <h3 data-overlay-section-title tabIndex={-1} className={'scroll-mt-4 text-sm font-semibold text-foreground outline-none'}>
        {title}
      </h3>
      {children}
    </section>
  );
}


/** The actions on the right, the exit first and the primary last; an option or a summary on the left */
interface OverlayFooterProps {
  start?: React.ReactNode;
  children: React.ReactNode;
  inert?: boolean;
  hasBody: boolean;
  dataSlot: string;
}

export function OverlayFooter(props: OverlayFooterProps): React.ReactNode {
  const { children, dataSlot, hasBody, inert, start } = props;

  return (
    <div
      data-slot={`${dataSlot}-footer`}
      inert={inertValue(inert)}
      className={cn('flex flex-none flex-wrap items-center justify-end gap-2 px-6 pb-4', hasBody ? 'pt-4' : 'pt-2')}
    >
      {isPresent(start) && (
        <div data-slot={`${dataSlot}-footer-start`} className={'me-auto flex min-w-0 items-center gap-2'}>{start}</div>
      )}
      <div data-slot={`${dataSlot}-footer-actions`} className={'ms-auto flex flex-wrap items-center justify-end gap-2'}>{children}</div>
    </div>
  );
}


/**
 * The waiting veil over the whole panel. Focusable, so the focus has somewhere to go while the rest is
 * inert. On a load the x stays above it (the header sits at `z-20`).
 */
interface OverlayVeilProps {
  busy: boolean;
  visible: boolean;
  label: string;
  dataSlot: string;
}

export const OverlayVeil = React.forwardRef<HTMLDivElement, OverlayVeilProps>((props, ref) => {
  const { busy, dataSlot, label, visible } = props;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      data-slot={`${dataSlot}-veil`}
      className={cn('absolute inset-0 z-10 overflow-hidden rounded-lg outline-none', !busy && 'pointer-events-none')}
    >
      <BusyVeil visible={visible} label={label} />
    </div>
  );
});

OverlayVeil.displayName = 'OverlayVeil';


/** A status region always mounted, for a title that changes in place */
export function OverlayStatus(props: { children?: React.ReactNode }): React.ReactNode {
  return (
    <VisuallyHidden>
      <span role={'status'}>{props.children}</span>
    </VisuallyHidden>
  );
}
