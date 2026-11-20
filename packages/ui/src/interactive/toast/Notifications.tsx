'use client';

import * as React from 'react';

import { Toast as ToastPrimitive } from '@base-ui/react/toast';

import { cn } from '../../core/cn';
import { linkProps } from '../../core/link';

import { VisuallyHidden } from '../../components/VisuallyHidden';

import { Button } from '../button/Button';
import { IconButton } from '../button/IconButton';
import { ClearGlyph } from '../text-input/glyphs';
import { ToneGlyph } from '../tone-glyphs/toneGlyphs';

import { NotificationsContext, StatusMark, useNotificationsState } from './toastShared';

import type { Job, JobStatus, Notifications, NotificationsState, UndoOptions } from './notificationsStore';


/* --------
 * Types Definition
 * -------- */

export interface NotificationsLabels {
  /** The names of the two regions */
  readonly confirmRegion: string;
  readonly jobsRegion: string;

  /** The title of the panel: "Jobs" */
  readonly title: string;

  /** Name and tooltip of the button that reduces the panel */
  readonly collapse: string;

  /** "Clear the concluded" */
  readonly clear: string;

  /** Name and tooltip of the x of a row */
  readonly dismiss: string;

  readonly stop: string;
  readonly retry: string;
  readonly undo: string;

  /** The counts of the bar and of the header: "1 error", "2 running", "3 ready" */
  readonly errors: (count: number) => string;
  readonly running: (count: number) => string;
  readonly ready: (count: number) => string;

  /** The name of a progress bar: "45%" */
  readonly progress: (value: number) => string;
}

export interface NotificationsProviderProps {
  notifications: Notifications;
  labels: NotificationsLabels;
  children?: React.ReactNode;
}

/* --------
 * Constants Definition
 * -------- */

/** Errors first, then what runs, then what is ready */
const ORDER: Readonly<Record<JobStatus, number>> = { failed: 0, warning: 1, running: 2, stopped: 3, done: 4 };


/* --------
 * Helpers
 * -------- */

function counts(jobs: readonly Job[]): { errors: number; running: number; ready: number } {
  return {
    errors : jobs.filter((job) => job.status === 'failed').reduce((sum, job) => sum + job.count, 0),
    running: jobs.filter((job) => job.status === 'running').length,
    ready  : jobs.filter((job) => job.status === 'done' || job.status === 'warning' || job.status === 'stopped').length
  };
}


/* --------
 * Parts
 * -------- */

function CollapseGlyph(): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
    >
      <path d={'m6 9 6 6 6-6'} />
    </svg>
  );
}


function ConfirmationRows(props: { labels: NotificationsLabels; store: Notifications['store'] }): React.ReactNode {
  const { labels, store } = props;
  const { close, toasts } = ToastPrimitive.useToastManager<{ undo?: UndoOptions; historyId?: string }>();

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      swipeDirection={[]}
      data-slot={'toast-confirmation'}
      className={cn(
        'pointer-events-auto flex max-w-120 min-h-12 items-center gap-3 rounded-md bg-popover py-2.5 ps-4 pe-2 text-sm text-popover-foreground shadow-lg outline-none wrap-anywhere',
        'focus-visible:outline-2 focus-visible:outline-ring',
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

function JobRow(props: { job: Job; labels: NotificationsLabels; store: Notifications['store'] }): React.ReactNode {
  const { job, labels, store } = props;
  const concluded = job.status !== 'running';
  const { action } = job;

  let actionButton: React.ReactNode = null;

  if (action?.target) {
    actionButton = (
      <a
        {...linkProps(action.target)}
        className={'inline-flex h-control-sm shrink-0 items-center rounded-md px-2.5 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring'}
      >
        {action.label}
      </a>
    );
  }
  else if (action?.onClick) {
    actionButton = <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={action.onClick}>{action.label}</Button>;
  }

  return (
    <li data-slot={'toast-job'} data-status={job.status} className={'flex items-start gap-3 px-4 py-2.5'}>
      <StatusMark status={job.status} className={'mt-0.5'} />

      <div className={'min-w-0 flex-1'}>
        <div className={'font-medium'}>
          {job.title}
          {job.count > 1 && <span aria-hidden className={'ms-1 text-muted-foreground tabular-nums'}>{`(${job.count})`}</span>}
        </div>
        {job.detail !== null && job.detail !== undefined && <div className={'text-xs text-muted-foreground'}>{job.detail}</div>}
        {job.status === 'running' && job.value !== undefined && (
          <div
            role={'progressbar'}
            aria-label={labels.progress(job.value)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(job.value * 100)}
            className={'mt-1.5 h-1 overflow-hidden rounded-full bg-muted'}
          >
            <div
              className={'h-full origin-left bg-info transition-transform duration-200 motion-reduce:transition-none'}
              style={{ transform: `scaleX(${job.value})` }}
            />
          </div>
        )}
      </div>

      <div className={'-my-0.5 flex shrink-0 items-center gap-0.5'}>
        {job.status === 'running' && job.onStop && (
          <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={() => store.stop(job.id)}>{labels.stop}</Button>
        )}
        {job.status === 'failed' && job.retry && (
          <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={() => store.retry(job.id)}>{labels.retry}</Button>
        )}
        {actionButton}
        {concluded && (
          <IconButton label={labels.dismiss} icon={<ClearGlyph />} size={'sm'} onClick={() => store.dismiss(job.id)} />
        )}
      </div>
    </li>
  );
}

interface JobsPanelProps {
  notifications: Notifications;
  state: NotificationsState;
  labels: NotificationsLabels;
}

function JobsPanel(props: JobsPanelProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { labels, notifications, state } = props;
  const { store } = notifications;


  // ----
  // Internal Hooks
  // ----
  const rootRef = React.useRef<HTMLDivElement>(null);
  const returnRef = React.useRef<HTMLElement | null>(null);


  // ----
  // Internal State
  // ----

  /* A row that changes state stays still while the pointer or the focus is in the panel */
  const [ holding, setHolding ] = React.useState(false);
  const [ heldOrder, setHeldOrder ] = React.useState<readonly string[]>([]);

  const sorted = [ ...state.jobs ].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const ordered = holding
    ? [ ...state.jobs ].sort((a, b) => {
      const ia = heldOrder.indexOf(a.id);
      const ib = heldOrder.indexOf(b.id);

      return (ia < 0 ? Number.MAX_SAFE_INTEGER : ia) - (ib < 0 ? Number.MAX_SAFE_INTEGER : ib);
    })
    : sorted;

  const summary = counts(state.jobs);
  const countsText = [
    summary.errors > 0 ? labels.errors(summary.errors) : null,
    summary.running > 0 ? labels.running(summary.running) : null,
    summary.ready > 0 ? labels.ready(summary.ready) : null
  ].filter(Boolean).join(' · ');

  let urgent: JobStatus = 'done';

  if (summary.errors > 0) {
    urgent = 'failed';
  }
  else if (summary.running > 0) {
    urgent = 'running';
  }


  // ----
  // Handlers
  // ----
  const hold = (): void => {
    if (!holding) {
      setHeldOrder(sorted.map((job) => job.id));
      setHolding(true);
    }
  };

  const collapse = (): void => {
    store.setExpanded(false);
    returnRef.current?.focus({ preventScroll: true });
    returnRef.current = null;
  };


  // ----
  // Lifecycle Events
  // ----

  /* The first click in the page reduces the panel */
  React.useEffect(() => {
    if (!state.expanded) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) {
        store.setExpanded(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [ state.expanded, store ]);


  // ----
  // Component Render
  // ----
  if (state.jobs.length === 0) {
    return null;
  }

  return (
    <section
      ref={rootRef}
      aria-label={labels.jobsRegion}
      data-slot={'toast-jobs'}
      data-expanded={state.expanded || undefined}
      tabIndex={-1}
      className={'pointer-events-auto fixed bottom-4 z-toast toast-end text-sm text-popover-foreground outline-none'}
      onPointerEnter={hold}
      onPointerLeave={() => setHolding(false)}
      onFocus={(event) => {
        const from = event.relatedTarget;

        if (!returnRef.current && from instanceof HTMLElement && !event.currentTarget.contains(from)) {
          returnRef.current = from;
        }

        hold();
      }}
      onBlur={(event) => {
        if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
          setHolding(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && state.expanded) {
          event.preventDefault();
          collapse();
        }
      }}
    >
      {state.expanded
        ? (
          <div data-slot={'toast-jobs-panel'} className={'flex toast-panel-width flex-col rounded-md bg-popover shadow-lg'}>
            <div className={'flex h-12 flex-none items-center gap-2 border-b border-border ps-4 pe-2'}>
              <div className={'min-w-0 flex-1 truncate'}>
                <span className={'font-semibold'}>{labels.title}</span>
                {countsText && <span aria-hidden className={'ms-2 text-xs text-muted-foreground'}>{countsText}</span>}
              </div>
              {summary.ready + summary.errors > 0 && (
                <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={() => store.clearConcluded()}>{labels.clear}</Button>
              )}
              <IconButton label={labels.collapse} icon={<CollapseGlyph />} size={'sm'} onClick={collapse} />
            </div>
            <ul className={'max-h-80 overflow-y-auto overscroll-contain py-1'}>
              {ordered.map((job) => <JobRow key={job.id} job={job} labels={labels} store={store} />)}
            </ul>
          </div>
        )
        : (
          <button
            type={'button'}
            data-slot={'toast-jobs-bar'}
            aria-expanded={false}
            onClick={() => store.setExpanded(true)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-md bg-popover px-4 text-sm shadow-lg outline-none',
              'hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring'
            )}
          >
            <StatusMark status={urgent} />
            <span className={'font-medium'}>{labels.title}</span>
            {countsText && <span className={'text-xs text-muted-foreground'}>{countsText}</span>}
          </button>
        )}
    </section>
  );

}

/* --------
 * Component Definition
 * -------- */

/**
 * The notifications of the application, mounted once in its shell, above the router: the jobs stay
 * when the page changes. Two things in two places.
 *
 * ```tsx
 * <NotificationsProvider notifications={notifications} labels={labels}>
 *   <App />
 * </NotificationsProvider>
 * ```
 *
 * The **confirmation** of an action is a small toast at the bottom that leaves on its own after 4s
 * (6 when it wraps, 8 with "Undo"), one at a time, paused under the pointer, with the focus inside
 * and while the window is in the background. It runs on Base UI's `Toast`.
 *
 * The **jobs** are a bar at the bottom right that opens into a panel: errors, then what runs, then
 * what is ready; a row that changes state holds still while the pointer or the focus is in the panel.
 * The panel opens on a click or on its own when an error arrives, and is reduced by Esc, the first
 * click in the page or its button. It is a list of ours rather than a second Base UI viewport, whose
 * rows are dialogs that Esc closes, swipe and stop at three.
 *
 * Neither takes the focus on its own. F6 moves it to the confirmation, then to the jobs, then back.
 * Only changes of state are announced, an error once and urgently. Both stand left of an open
 * drawer and above dialogs (`z-toast`).
 *
 * Parts with a slot: `toast-confirmation`, `toast-jobs` (with `data-expanded`), `toast-jobs-bar`,
 * `toast-jobs-panel`, `toast-job` (with `data-status`).
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
            className={'pointer-events-none fixed bottom-4 z-toast flex toast-span justify-center px-4 outline-none'}
          >
            <ConfirmationRows labels={labels} store={notifications.store} />
          </ToastPrimitive.Viewport>
        </ToastPrimitive.Portal>
      </ToastPrimitive.Provider>

      <JobsPanel notifications={notifications} state={state} labels={labels} />

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
