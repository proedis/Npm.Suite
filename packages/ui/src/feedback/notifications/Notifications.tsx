'use client';

import * as React from 'react';

import { Toast as ToastPrimitive } from '@base-ui/react/toast';

import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { VisuallyHidden } from '../../primitives/VisuallyHidden';

import { ToneGlyph } from '../../internal/glyphs';

import { Button } from '../../actions/button/Button';

import { NotificationsContext, useNotificationsState } from './toastShared';

import type { Notifications, UndoOptions } from './notificationsStore';


/* --------
 * Types Definition
 * -------- */

export interface NotificationsLabels {
  /** The name of the region of the confirmation */
  readonly confirmRegion: string;

  /** The action of a confirmation that can be undone */
  readonly undo: string;
}

export interface StrictNotificationsProviderProps {
  notifications: Notifications;
  labels: NotificationsLabels;
  children?: React.ReactNode;
}
export type NotificationsProviderProps = StrictNotificationsProviderProps;


/* --------
 * Parts
 * -------- */

function ConfirmationRows(props: { labels: NotificationsLabels; store: Notifications['store'] }): React.ReactNode {
  const { labels, store } = props;
  const { close, toasts } = ToastPrimitive.useToastManager<{ undo?: UndoOptions; historyId?: string }>();

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      swipeDirection={[]}
      data-slot={'toast-confirmation'}
      render={<Stack direction={'horizontal'} align={'center'} gap={3} />}
      className={cn(
        'pointer-events-auto col-start-1 row-start-1 self-end justify-self-center',
        'max-w-120 min-h-12 rounded-md bg-popover py-2.5 ps-4 pe-2 text-sm text-popover-foreground shadow-lg outline-none wrap-anywhere',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
        'transition duration-150 data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none'
      )}
    >
      <ToneGlyph tone={'success'} className={'size-4 shrink-0 text-success-soft-foreground'} />
      <ToastPrimitive.Title className={'min-w-0 flex-1 pe-1.5'}>{toast.title}</ToastPrimitive.Title>
      {toast.data?.undo && (
        <Button
          size={'sm'}
          fill={'plain'}
          tone={'primary'}
          onClick={() => {
            if (toast.data?.historyId) {
              store.undo(toast.data.historyId);
            }

            close(toast.id);
          }}
        >
          {labels.undo}
        </Button>
      )}
    </ToastPrimitive.Root>
  ));
}


/* --------
 * Component Definition
 * -------- */

/**
 * The notifications of the application, mounted once in its shell, above the router: the jobs stay
 * when the page changes. It owns the store, the confirmations and the live regions; the jobs are drawn
 * by `JobsPanel` and their history by `JobsButton`, both from `@proedis/ui/feedback/jobs`, placed inside
 * it where the application wants them.
 *
 * ```tsx
 * <NotificationsProvider notifications={notifications} labels={labels}>
 *   <App />
 *   <JobsPanel labels={jobsLabels} />
 * </NotificationsProvider>
 * ```
 *
 * The **confirmation** of an action is a small toast at the bottom that leaves on its own after 4s
 * (6 when it wraps, 8 with "Undo"), one at a time, paused under the pointer, with the focus inside
 * and while the window is in the background. It runs on Base UI's `Toast`.
 *
 * Nothing takes the focus on its own. F6 moves it to the confirmation, then to the jobs, then back.
 * Only changes of state are announced, a confirmation and the end of a job politely, an error once and
 * urgently: the regions are the provider's, so a job announces itself even with no panel on screen. The
 * toasts stand left of an open drawer and above dialogs (`z-toast`).
 *
 * Parts with a slot: `toast-viewport`, `toast-confirmation`.
 */
export function NotificationsProvider(props: NotificationsProviderProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, labels, notifications } = props;


  // ----
  // Internal Hooks
  // ----
  const state = useNotificationsState(notifications);
  const returnRef = React.useRef<HTMLElement | null>(null);


  // ----
  // Lifecycle Events
  // ----

  /* F6: the confirmation, then the jobs, then back where the focus was. One handler, before any other */
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'F6' || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const stops = [
        document.querySelector<HTMLElement>('[data-slot=toast-confirmation]'),
        document.querySelector<HTMLElement>('[data-slot=toast-jobs-bar], [data-slot=toast-jobs]')
      ].filter((stop): stop is HTMLElement => stop !== null);

      if (stops.length === 0) {
        return;
      }

      const active = document.activeElement;
      const current = stops.findIndex((stop) => stop === active || (active instanceof Node && stop.contains(active)));

      if (current < 0) {
        returnRef.current = active instanceof HTMLElement ? active : null;
      }

      event.preventDefault();
      event.stopPropagation();

      const next = stops[current + 1];

      if (next) {
        next.focus();
      }
      else {
        returnRef.current?.focus();
        returnRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);


  // ----
  // Memoized Data
  // ----
  const context = React.useMemo(() => ({ notifications, state }), [ notifications, state ]);


  // ----
  // Component Render
  // ----
  return (
    <NotificationsContext.Provider value={context}>
      <ToastPrimitive.Provider toastManager={notifications.store.confirmations} limit={1}>
        {children}

        <ToastPrimitive.Portal>
          <ToastPrimitive.Viewport
            aria-label={labels.confirmRegion}
            data-slot={'toast-viewport'}
            /*
             * One cell for every toast: the one leaving and the one arriving overlap for the 150ms they
             * share. In a centred row they stood side by side and both jumped sideways
             */
            render={<Stack gap={0} columns={1} />}
            className={'pointer-events-none fixed bottom-4 z-toast toast-span px-4 outline-none'}
          >
            <ConfirmationRows labels={labels} store={notifications.store} />
          </ToastPrimitive.Viewport>
        </ToastPrimitive.Portal>
      </ToastPrimitive.Provider>

      {/*
        * The regions stay, their content is replaced on every message: keyed on the count the store
        * keeps, a message equal to the previous one is a new node and is announced again. As plain
        * text it was the same DOM, and a second identical error said nothing.
        */}
      <VisuallyHidden>
        <span role={'status'}><span key={state.polite.key}>{state.polite.text}</span></span>
        <span role={'alert'}><span key={state.assertive.key}>{state.assertive.text}</span></span>
      </VisuallyHidden>
    </NotificationsContext.Provider>
  );

}

NotificationsProvider.displayName = 'NotificationsProvider';
